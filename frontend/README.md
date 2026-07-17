# SyncBoard Frontend

Next.js 15 application for the Project Management system.

## Highlights

- **Reusable components** — `src/components/common/` and domain folders (`task/`, `project/`, `layout/`)
- **Controlled forms** — React Hook Form + Zod (`src/validations/`, `src/components/forms/`)
- **Real-time UI** — `src/hooks/useSocket.ts` + Redux task slice
- **API layer** — `src/services/api/` (import from `@/services/api`)
- **Socket layer** — `src/services/socket/` + `src/constants/socket.ts`
- **Errors & loading** — `Loader`, `EmptyState`, `ErrorBoundary`, toasts, Redux loading flags

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173**

See the [root README](../README.md) for architecture, API/socket documentation, deployment, and demo credentials.
