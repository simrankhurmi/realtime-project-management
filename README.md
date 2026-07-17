# SyncBoard — Project Management System

Monorepo with a **Node.js/Express API** (backend) and a **Next.js** web app (frontend). Supports project boards, role-based access, Kanban task management, and real-time collaboration via Socket.io.

---

## Must Demonstrate (Frontend)

The frontend is built to satisfy these evaluation criteria:

| Requirement | Implementation |
|-------------|----------------|
| **Reusable components** | Shared UI in `frontend/src/components/common/` (`AppButton`, `AppInput`, `Loader`, `EmptyState`, `ConfirmDialog`, `ErrorBoundary`) and domain components (`TaskCard`, `TaskBoard`, `ProjectCard`, `TaskModal`, `CreateProjectModal`, `AppLayout`). |
| **Controlled forms** | React Hook Form + Zod validation in `LoginForm`, `RegisterForm`, `TaskModal`, `CreateProjectModal` (`frontend/src/components/forms/`, `validations/`). |
| **Real-time UI updates** | `useSocket` hook joins project rooms; Redux `taskSlice` applies `applyRealtimeTaskUpdate` / `applyRealtimeTaskDelete` when peers move or edit tasks. Live indicator on Kanban board. |
| **Clean API + socket abstraction** | HTTP: `frontend/src/services/api/` (Axios instance + per-domain APIs). Socket: `frontend/src/services/socket/` + `constants/socket.ts` event catalog. Pages never call `fetch` or raw socket.io directly. |
| **Error & loading handling** | Route-level `Loader` / `EmptyState`, toast notifications (`react-hot-toast`), Redux async thunk error payloads, Axios 401 refresh + redirect, global `ErrorBoundary`. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Next.js 15 App)                     │
│  App Router pages → AppLayout → Redux Toolkit + Redux Persist   │
│  React Hook Form + Zod │ Tailwind CSS │ Socket.io-client        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
              /api/v1/* rewrite (Next.js proxy)
              Socket.io (NEXT_PUBLIC_SOCKET_URL)
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│              Express.js API (TypeScript, port 3000)              │
│  Routes → Controllers → Services → Mongoose Models               │
│  JWT auth │ Zod validation │ Role middleware (admin/user)        │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
         MongoDB (data)                  Redis (sessions)
```

### Frontend structure

```
frontend/src/
├── app/              # Next.js routes (login, dashboard, projects, tasks)
├── components/       # Reusable + domain UI
├── constants/        # API endpoints, routes, socket events, task columns
├── hooks/            # useSocket, useAuth
├── redux/            # auth, project, task, socket slices
├── services/
│   ├── api/          # Axios + authApi, projectApi, taskApi, userApi
│   └── socket/       # Socket.io connection & room helpers
├── types/            # Shared TypeScript interfaces
└── validations/      # Zod schemas for forms
```

### Backend structure

```
backend/src/
├── routes/           # REST route definitions
├── controllers/      # HTTP handlers
├── services/         # Business logic
├── models/           # Mongoose schemas
├── middleware/       # Auth, validation, errors
├── sockets/          # Socket.io handlers
└── scripts/seed.ts   # Demo users & project data
```

---

## Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Next.js App Router + client components for app shell** | SSR for layout/metadata; interactive dashboard/board as client components with Redux. | More `"use client"` boundaries than a pure SPA. |
| **Redux Toolkit + thunks** | Predictable async state for projects/tasks; easy real-time merge in reducers. | Boilerplate vs React Query; acceptable for demo scope. |
| **Next.js `/api` rewrite proxy** | Frontend uses relative `/api/v1`; avoids CORS in dev; single origin for cookies. | Production needs same proxy or direct API URL + CORS config. |
| **Socket.io rooms per project** | Targeted broadcasts; clients only receive events for open board. | Must join/leave rooms on navigation; handled in `useSocket`. |
| **JWT + refresh in Axios interceptor** | Transparent token refresh; cookies synced for middleware route protection. | Refresh queue adds complexity on 401 storms. |
| **Admin-only project CRUD** | Clear ownership model for enterprise PM. | Members rely on admin for project setup. |
| **Tasks list page for edits** | Kanban focused on status drag; centralized edit with `lastUpdatedBy`. | Two places to interact with tasks (board vs list). |
| **Tailwind only (no component library)** | Full control over UI; matches custom Kanban design. | More custom CSS than MUI/Chakra. |
| **MongoDB + Redis** | Flexible document model for tasks; Redis for socket session tracking. | Operational overhead vs single DB. |

---

## API List

Base URL (local): `http://localhost:3000/api/v1`  
Via frontend proxy: `http://localhost:5173/api/v1`

All protected routes require header: `Authorization: Bearer <accessToken>`

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | API health check |

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login; returns user + tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/profile` | Yes | Current user profile |

### Users (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | Yes | List users (member picker) |

### Projects (`/projects`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/projects` | Yes | Any member | List user's projects (paginated) |
| POST | `/projects` | Yes | Admin | Create project (+ auto starter task) |
| GET | `/projects/:id` | Yes | Member | Get project by ID |
| PATCH | `/projects/:id` | Yes | Admin | Update project |
| DELETE | `/projects/:id` | Yes | Admin | Delete project & tasks |

### Tasks — all user projects (`/tasks`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tasks` | Yes | All tasks across user's projects |

### Tasks — per project (`/projects/:projectId/tasks`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/projects/:projectId/tasks` | Yes | List project tasks |
| POST | `/projects/:projectId/tasks` | Yes | Create task |
| PATCH | `/projects/:projectId/tasks/:taskId` | Yes | Update task (status drag or full edit) |
| DELETE | `/projects/:projectId/tasks/:taskId` | Yes | Delete task (creator or admin) |

### Task fields

`title`, `description`, `status` (`todo` \| `in_progress` \| `done`), `priority` (`low` \| `medium` \| `high`), `assigneeId`, `createdBy`, `lastUpdatedBy`

---

## Socket Events List

Connection URL (local): `http://localhost:3000`  
Auth: `{ auth: { token: "<JWT access token>" } }`

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `project:join` | `{ projectId: string }` | Join project room for real-time task updates |
| `project:leave` | `{ projectId: string }` | Leave project room |

### Server → Client (tasks)

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `{ projectId, task, updatedBy }` | New task in project |
| `task:updated` | `{ projectId, task, updatedBy }` | Task fields updated |
| `task:moved` | `{ projectId, task, updatedBy }` | Task status changed (Kanban drag) |
| `task:deleted` | `{ projectId, taskId, updatedBy }` | Task removed |

### Server → Client (presence)

| Event | Payload | Description |
|-------|---------|-------------|
| `project:user-joined` | `{ userId, projectId }` | Another user joined the room |
| `project:user-left` | `{ userId, projectId }` | Another user left the room |

Room naming: `project:{projectId}`

---

## Local Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally or Atlas URI
- **Redis** running locally

### 1. Clone & install

```bash
cd ProjectManagment
npm install
npm run install:all
```

### 2. Environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend** (`backend/.env`): set `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN=http://localhost:5173`

**Frontend** (`frontend/.env`): `BACKEND_URL=http://localhost:3000`, `NEXT_PUBLIC_SOCKET_URL=http://localhost:3000`, `NEXT_PUBLIC_APP_URL=http://localhost:5173`

### 3. Seed demo data (optional)

```bash
cd backend
npm run seed
```

### 4. Run development

From repo root:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5173
```

### Demo credentials (after seed)

All passwords: **`Password123`**

| Email | Role |
|-------|------|
| `admin@example.com` | Admin — create projects, assign members |
| `bob@example.com` | Member |
| `alice@example.com` | Member |

---

## Deployment Steps

### Backend

1. Set production env vars (`NODE_ENV=production`, `MONGODB_URI`, `JWT_*`, `REDIS_*`, `CORS_ORIGIN=<frontend-url>`).
2. Build: `cd backend && npm run build`
3. Start: `npm start` (or PM2/Docker).
4. Ensure MongoDB and Redis are reachable from the API host.

### Frontend

1. Set `BACKEND_URL`, `NEXT_PUBLIC_API_URL` (or keep `/api/v1` if proxying), `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_APP_URL` to production URLs.
2. Build: `cd frontend && npm run build`
3. Start: `npm start` (port 5173 or `PORT` env).
4. **Important:** If frontend and API are on different domains, configure CORS on backend and point `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` to the API origin (Next.js rewrite proxy only works when both run on same Next host).

### Suggested production layout

| Service | Example URL |
|---------|-------------|
| Frontend | `https://app.example.com` |
| API + Socket | `https://api.example.com` |
| MongoDB | Atlas cluster |
| Redis | Managed Redis (ElastiCache, Upstash, etc.) |

---

## CI/CD

GitHub Actions pipelines live in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|---------------|
| `ci.yml` | Push to any branch except `main`/`develop`; PRs into `main`/`develop` | Lint + typecheck + build for whichever of `backend`/`frontend` changed |
| `deploy.yml` | Push to `develop` or `main` | Re-runs build, then deploys backend to Render and frontend to Vercel — `develop` → staging, `main` → production |

Branching follows **Git Flow** (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).

Full details — branching rules, environment/secrets setup, deploy-hook configuration — are in [`docs/CI_CD.md`](./docs/CI_CD.md).

---

## URLs

### Local development

| Resource | URL |
|----------|-----|
| **Frontend app** | http://localhost:5173 |
| **Login** | http://localhost:5173/login |
| **Register** | http://localhost:5173/register |
| **Dashboard** | http://localhost:5173/dashboard |
| **Projects** | http://localhost:5173/projects |
| **Tasks list** | http://localhost:5173/tasks |
| **API base** | http://localhost:3000/api/v1 |
| **API health** | http://localhost:3000/api/v1/health |
| **Socket.io** | http://localhost:3000 |

### API proxy (via Next.js)

Browser requests to `http://localhost:5173/api/v1/*` are rewritten to `http://localhost:3000/api/v1/*` (see `frontend/next.config.ts`).

---

## Root Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend |
| `npm run dev:backend` | API only |
| `npm run dev:frontend` | Next.js only (cleans `.next` cache) |
| `npm run build` | Production build both packages |
| `npm run install:all` | Install deps in backend & frontend |

---

## Further Reading

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [CI/CD Pipeline & Branching Strategy](./docs/CI_CD.md)
