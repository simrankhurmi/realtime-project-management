# Project Management API

Production-grade Express.js backend built with TypeScript, MongoDB, Redis, and Socket.io.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Cache / Sessions:** Redis (ioredis)
- **Real-time:** Socket.io
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod

## Project Structure

```
backend/
├── src/
│   ├── config/          # Environment, database, Redis configuration
│   ├── controllers/     # Request handlers (thin layer)
│   ├── services/        # Business logic layer
│   ├── routes/          # API route definitions
│   ├── models/          # Mongoose schemas
│   ├── sockets/         # Socket.io setup and event handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Helpers, JWT, API response utilities
│   ├── validators/      # Zod validation schemas
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Server entry point
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis

### Installation

From the project root:

```bash
npm install --prefix backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
npm run dev:backend
```

Or from this folder:

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Seed users (development)

```bash
npm run seed
```

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Password123` | admin |
| `bob@example.com` | `Password123` | user |
| `alice@example.com` | `Password123` | user |

Existing users are skipped. Password must meet registration rules (8+ chars, upper, lower, number).

### Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start development server       |
| `npm run build` | Compile TypeScript to dist/    |
| `npm start`     | Run production build           |
| `npm run typecheck` | Type-check without emit    |

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Endpoint    | Auth | Description          |
|--------|-------------|------|----------------------|
| POST   | `/register` | No   | Register new user    |
| POST   | `/login`    | No   | Login                |
| POST   | `/refresh`  | No   | Refresh access token |
| POST   | `/logout`   | Yes  | Logout & revoke token|
| GET    | `/profile`  | Yes  | Get current user     |

### Projects (`/api/v1/projects`)

| Method | Endpoint | Auth | Description       |
|--------|----------|------|-------------------|
| POST   | `/`      | Yes  | Create project    |
| GET    | `/`      | Yes  | List projects     |
| GET    | `/:id`   | Yes  | Get project by ID |
| PATCH  | `/:id`   | Yes  | Update project    |
| DELETE | `/:id`   | Yes  | Delete project    |

## Socket.io Events

Connect with JWT token in `auth.token` or `Authorization` header.

| Event                  | Direction     | Description              |
|------------------------|---------------|--------------------------|
| `project:join`         | Client → Server | Join a project room    |
| `project:leave`        | Client → Server | Leave a project room   |
| `project:update`       | Client → Server | Broadcast project update |
| `project:updated`      | Server → Client | Receive project update |
| `notification:send`    | Client → Server | Send notification      |
| `notification:received`| Server → Client | Receive notification   |

## Environment Variables

See `.env.example` for all required variables.

## Architecture

The app follows a **service layer architecture**:

1. **Routes** — Define endpoints and attach middleware
2. **Controllers** — Parse requests, call services, format responses
3. **Services** — Contain all business logic
4. **Models** — Data layer (Mongoose schemas)
5. **Middleware** — Cross-cutting concerns (auth, validation, errors)
