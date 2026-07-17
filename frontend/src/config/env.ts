/**
 * Frontend environment configuration.
 * NEXT_PUBLIC_* variables are available in the browser.
 * BACKEND_URL is server-only (Next.js rewrites / API proxy).
 */

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.BACKEND_URL ??
  "http://localhost:3000";

export const env = {
  /** Server-side backend URL for Next.js rewrites */
  backendUrl: process.env.BACKEND_URL ?? backendUrl,

  /** Public backend URL (health checks, direct links) */
  publicBackendUrl: backendUrl,

  /** API base path — use /api/v1 to proxy via Next.js, or full URL for direct calls */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",

  /** Socket.io server URL */
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? backendUrl,

  /** Frontend app URL (must match backend CORS_ORIGIN) */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173",

  isDevelopment: process.env.NODE_ENV === "development",
} as const;
