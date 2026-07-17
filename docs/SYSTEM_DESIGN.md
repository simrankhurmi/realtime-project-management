# System Design — SyncBoard

**Project:** SyncBoard — Real-Time Project Management System
**Version:** 1.0

---

## 1. High-Level Architecture Diagram

```
                                   ┌────────────────────────────────────┐
                                   │            End Users               │
                                   │      (Admin & Member browsers)      │
                                   └──────────────────┬───────────────────┘
                                                       │ HTTPS
                                                       ▼
                          ┌─────────────────────────────────────────────────┐
                          │         Next.js 15 Frontend (port 5173)         │
                          │  App Router pages · AppLayout                  │
                          │  Redux Toolkit + Redux Persist (client state)  │
                          │  React Hook Form + Zod (controlled forms)      │
                          │  Axios API layer  │  Socket.io-client          │
                          └───────────┬─────────────────────┬─────────────┘
                                      │                     │
                        REST  /api/v1/*  (Next.js       WebSocket (Socket.io)
                        rewrite proxy → same origin)     NEXT_PUBLIC_SOCKET_URL
                                      │                     │
                                      ▼                     ▼
                          ┌─────────────────────────────────────────────────┐
                          │        Express.js API (TypeScript, port 3000)   │
                          │  Routes → Controllers → Services → Models       │
                          │  JWT auth middleware · Zod request validation   │
                          │  Role middleware (admin / user)                 │
                          │  Socket.io server (auth via JWT handshake)      │
                          └───────────┬─────────────────────┬─────────────┘
                                      │                     │
                                      ▼                     ▼
                          ┌───────────────────────┐ ┌───────────────────────┐
                          │       MongoDB          │ │        Redis          │
                          │  users / projects /    │ │  refresh tokens       │
                          │  tasks collections     │ │  blacklisted tokens   │
                          │  (Mongoose ODM)        │ │  session bookkeeping  │
                          └───────────────────────┘ └───────────────────────┘
```

**Request flow (typical):** Browser → Next.js rewrite proxy (`/api/v1/*`, same-origin, no CORS issue in dev) → Express route → auth middleware validates JWT (and checks Redis blacklist) → Zod validates payload → controller → service (business logic + authorization check on project membership) → Mongoose model → MongoDB. Response flows back the same path.

**Real-time flow:** Browser opens a Socket.io connection directly to the API host, authenticating with the JWT access token in the handshake. On opening a project board, the client emits `project:join`; the server places the socket in room `project:{projectId}`. Any task mutation the API performs is followed by an `io.to(room).emit(...)` broadcast, so every other browser in that room updates its Redux store immediately.

---

## 2. API List

Base URL (local): `http://localhost:3000/api/v1` (proxied from the frontend at `http://localhost:5173/api/v1`)
All protected routes require header: `Authorization: Bearer <accessToken>`

### Health

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Liveness/readiness check for the API |

### Auth

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Authenticate; returns user + access/refresh tokens |
| POST | `/auth/refresh` | No | Exchange a valid refresh token for a new access token |
| POST | `/auth/logout` | Yes | Revoke refresh token, blacklist current access token |
| GET | `/auth/profile` | Yes | Return the logged-in user's profile |

### Users

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/users` | Yes | List users (used to populate the member/assignee picker) |

### Projects

| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/projects` | Yes | Any member | List projects the current user owns or belongs to (paginated) |
| POST | `/projects` | Yes | Admin | Create a project (auto-creates a starter task) |
| GET | `/projects/:id` | Yes | Member of project | Get a single project's details |
| PATCH | `/projects/:id` | Yes | Admin (owner) | Update project fields / members / status |
| DELETE | `/projects/:id` | Yes | Admin (owner) | Delete a project and cascade-delete its tasks |

### Tasks (cross-project)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/tasks` | Yes | List every task across all of the current user's projects ("My Tasks") |

### Tasks (per project)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/projects/:projectId/tasks` | Yes | List tasks for one project (Kanban board data) |
| POST | `/projects/:projectId/tasks` | Yes | Create a task in the project |
| PATCH | `/projects/:projectId/tasks/:taskId` | Yes | Update a task (edit fields, or drag-drop status change) |
| DELETE | `/projects/:projectId/tasks/:taskId` | Yes | Delete a task (creator or admin only) |

### Socket.io Events

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `project:join` | Client → Server | `{ projectId }` | Subscribe to a project's real-time room |
| `project:leave` | Client → Server | `{ projectId }` | Unsubscribe when leaving the board |
| `task:created` | Server → Client | `{ projectId, task, updatedBy }` | Broadcast new task to room |
| `task:updated` | Server → Client | `{ projectId, task, updatedBy }` | Broadcast field edits to room |
| `task:moved` | Server → Client | `{ projectId, task, updatedBy }` | Broadcast Kanban status change to room |
| `task:deleted` | Server → Client | `{ projectId, taskId, updatedBy }` | Broadcast task removal to room |
| `project:user-joined` | Server → Client | `{ userId, projectId }` | Presence: someone opened the board |
| `project:user-left` | Server → Client | `{ userId, projectId }` | Presence: someone closed the board |

---

## 3. Database Schema (Collection Design — MongoDB)

MongoDB was chosen, so the design is **document/collection-based** rather than a relational ER diagram, with relationships expressed via `ObjectId` references (not embedding), since projects/tasks/users are each independently queried, updated, and paginated.

```
┌──────────────────────────┐        owner (1) ───┐
│         User             │◄─────────────────────┤
├──────────────────────────┤                      │
│ _id            ObjectId  │◄────────┐            │
│ email          String  (unique)     │            │
│ password       String  (hashed, select:false)    │
│ firstName      String                │            │
│ lastName       String                │            │
│ role           enum[user, admin]     │            │
│ isActive       Boolean               │            │
│ lastLogin      Date                  │            │
│ createdAt / updatedAt  Date          │            │
└──────────────────────────┘           │            │
        ▲            ▲                 │            │
        │ members[]  │ assignee        │            │
        │ (N..M)     │ createdBy       │            ▼
        │            │ lastUpdatedBy   │   ┌──────────────────────────┐
        │            │                 └──►│         Project           │
        │            │                     ├──────────────────────────┤
        │            │                     │ _id          ObjectId    │
        │            │                     │ name         String      │
        │            │                     │ description  String     │
        │            │                     │ owner        ObjectId → User │
        │            │                     │ members[]    ObjectId[] → User │
        │            │                     │ status       enum[planning, active,│
        │            │                     │               on_hold, completed,  │
        │            │                     │               archived]            │
        │            │                     │ startDate    Date        │
        │            │                     │ endDate      Date        │
        │            │                     │ createdAt / updatedAt    │
        │            │                     └──────────────┬───────────┘
        │            │                                    │ project (1..N)
        │            │                                    ▼
        │            │                     ┌──────────────────────────┐
        │            └────────────────────►│          Task              │
        └─────────────────────────────────►├──────────────────────────┤
                                            │ _id           ObjectId    │
                                            │ title         String      │
                                            │ description   String     │
                                            │ status        enum[todo, in_progress, done] │
                                            │ priority      enum[low, medium, high]        │
                                            │ project       ObjectId → Project │
                                            │ assignee      ObjectId → User    │
                                            │ createdBy     ObjectId → User    │
                                            │ lastUpdatedBy ObjectId → User    │
                                            │ createdAt / updatedAt            │
                                            └──────────────────────────┘
```

### Collections & Indexes

| Collection | Key fields | Indexes | Notes |
|---|---|---|---|
| **users** | `email` (unique), `password` (bcrypt hash, `select:false` so it's never returned by default), `firstName`, `lastName`, `role`, `isActive` | `{ email: 1 }` unique, `{ createdAt: -1 }` | Role is a simple 2-value enum (`user`/`admin`); no separate roles collection needed at this scale. |
| **projects** | `name`, `description`, `owner` (→ User), `members[]` (→ User), `status`, `startDate`, `endDate` | `{ owner: 1, status: 1 }`, `{ members: 1 }` | Membership modeled as an array of `ObjectId`s rather than a join table — reads are cheap ("is this project mine?") and project member lists are small. |
| **tasks** | `title`, `description`, `status`, `priority`, `project` (→ Project), `assignee` (→ User), `createdBy` (→ User), `lastUpdatedBy` (→ User) | `{ project: 1, status: 1 }`, `{ assignee: 1 }` | Kept as its own collection (not embedded in Project) because tasks are queried/paginated/updated independently and can grow unbounded per project. |
| **Redis keys** (not MongoDB) | `refresh_token:{userId}`, `blacklist:{token}`, `session:{userId}` | N/A (key-value TTL store) | Used for auth session state, not domain data — kept out of MongoDB so it can expire (TTL) cheaply and be wiped independently of the primary DB. |

**Why references over embedding:** Tasks and Projects both need independent CRUD, pagination, and filtering (e.g. "all tasks assigned to me" spans many projects). Embedding tasks inside projects would force loading/rewriting the whole project document for every task edit and cap collection growth at MongoDB's 16MB document limit — reference-based design avoids both problems.

---

## 4. Real-Time Communication Strategy

- **Transport:** Socket.io (WebSocket with automatic fallback to HTTP long-polling), chosen over raw WebSockets for its built-in reconnection, room/namespace support, and broad browser compatibility out of the box.
- **Authentication:** the JWT access token is passed in the Socket.io handshake (`auth.token`); a socket middleware verifies it before the connection is accepted — no anonymous sockets.
- **Scoping — rooms, not global broadcast:** each project gets its own room, `project:{projectId}`. A client only joins a room when it opens that project's Kanban board (`project:join`) and leaves on navigating away (`project:leave`). This means:
  - Users never receive events for projects they aren't currently viewing (bandwidth + client CPU savings).
  - The server never has to check "does this user have access" per broadcast — it only broadcasts to sockets that already joined the room, and joining is itself access-controlled.
- **Event flow:** every task mutation (`create` / `update` / `move` / `delete`) goes through the normal REST request → service layer → MongoDB write path first. Only **after** the write succeeds does the service emit the corresponding Socket.io event to the room. This guarantees the database is always the source of truth and sockets never broadcast an event for a write that failed.
- **Presence:** `project:user-joined` / `project:user-left` give a lightweight "who's currently looking at this board" indicator, driven purely by socket connect/disconnect + room membership (no separate presence store needed for this scale).
- **Client reconciliation:** the frontend's `useSocket` hook applies incoming events directly onto the Redux `taskSlice` (`applyRealtimeTaskUpdate` / `applyRealtimeTaskDelete`). If a socket disconnects and reconnects, the client re-joins its room and can re-fetch the task list via REST to resync state — the socket layer is an enhancement on top of REST, not a replacement for it.

## 5. Why This Approach Was Chosen

| Decision | Rationale | Trade-off accepted |
|---|---|---|
| **Monorepo (Next.js frontend + Express API)** | One repo, one deploy pipeline, shared conventions; simple for a small team to reason about. | Less flexibility to scale frontend/backend teams fully independently. |
| **Next.js App Router, client components for interactive app shell** | SSR for initial page/metadata; Redux-driven client components for the dashboard/board where interactivity (drag-drop, sockets) matters. | More `"use client"` boundaries than a pure SPA. |
| **Next.js rewrite proxy for `/api/v1`** | Frontend calls a relative path, avoiding CORS in development and keeping cookies same-origin. | In production, still needs either the same proxy pattern or explicit CORS config if the API is on a different domain. |
| **REST (not GraphQL) for CRUD** | Small, well-defined resource set (auth/users/projects/tasks) — REST keeps routing, validation, and caching simple. | No client-driven field selection; acceptable given the small payloads. |
| **Socket.io over raw WebSocket / SSE** | Automatic reconnection, room abstraction, polling fallback for restrictive networks — all needed for reliable real-time Kanban updates without hand-rolling them. | Slightly heavier client bundle than a bare WebSocket. |
| **JWT access + refresh tokens, refresh handled by Axios interceptor** | Stateless API auth that scales horizontally (no server-side session lookup on every request); refresh is transparent to the user. | Refresh-queue logic adds some complexity around concurrent 401s. |
| **MongoDB (document store) over a relational DB** | Task/Project shapes are simple and evolve easily (adding fields doesn't need migrations); natural fit for JSON-shaped API responses. | Cross-collection joins (e.g. reporting across projects+tasks+users) are less convenient than SQL joins — mitigated with `.populate()` for the current scale. |
| **Redis for auth/session state, not app data** | Fast, TTL-native store is ideal for refresh tokens and blacklisted-token checks that must expire automatically. | One more moving part to run/operate alongside MongoDB. |
| **Role-based (admin/user) rather than per-project custom roles** | Matches the actual v1 requirement (only admins create/manage projects); avoids a permissions engine that isn't needed yet. | Less flexible if finer-grained roles are needed later (would require a `ProjectMember` collection with a `role` field). |
| **Service-layer architecture (Route → Controller → Service → Model)** | Keeps controllers thin (HTTP-only concerns) and business/authorization logic testable and reusable. | An extra layer of indirection vs. putting logic straight in controllers. |

## 6. Scalability Considerations

- **Stateless API layer:** because auth is JWT-based (no server-side session store for auth itself, only Redis for revocation/refresh), multiple Express instances can run behind a load balancer without sticky sessions for REST traffic.
- **Socket.io horizontal scaling:** Socket.io requires sticky sessions (or a shared adapter) once run across more than one Node process. The natural next step is a **Redis adapter for Socket.io** (`@socket.io/redis-adapter`) — Redis is already in the stack for tokens, so it can also back cross-instance room broadcasts, letting the API scale to N instances while keeping "join room → broadcast" semantics correct.
- **Database indexing:** all hot query paths are already indexed — `projects` by `{ owner, status }` and `{ members }`; `tasks` by `{ project, status }` (Kanban board fetch) and `{ assignee }` ("My Tasks" fetch); `users` by `{ email }`. This keeps board loads and task lists fast as data grows.
- **Pagination:** project listing is already paginated server-side, preventing unbounded payloads as the number of projects per user grows; the same pattern can be extended to task lists per project as boards grow large.
- **Read/write separation potential:** MongoDB replica sets can be introduced later to route heavy read traffic (dashboards, "My Tasks" aggregation) to secondaries without code changes, since Mongoose already abstracts the connection.
- **Room-scoped broadcasts:** because Socket.io events are scoped to `project:{projectId}` rooms rather than broadcast globally, real-time load scales with "number of people actively viewing a given board," not with total platform users — this keeps real-time overhead bounded as the user base grows.
- **Stateless static frontend:** the Next.js frontend can be deployed to multiple instances or a CDN/edge platform behind a load balancer, since it holds no server-side session state (auth state lives in the browser via Redux Persist + httpOnly-friendly token handling).
- **Caching headroom:** Redis is already present, so it can be extended for response caching (e.g. rarely-changing project metadata) without adding new infrastructure.
- **Vertical cut-over path:** if a single MongoDB instance's write volume becomes a bottleneck, `projects`/`tasks` are already separate collections with clear ownership boundaries, making it straightforward to shard by `project` id or move to a managed, auto-scaling MongoDB service (e.g. Atlas) with no schema changes.
