import { env } from "@/config/env";

export const API_BASE_URL = env.apiBaseUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
  },
  PROJECTS: {
    BASE: "/projects",
    BY_ID: (id: string) => `/projects/${id}`,
    TASKS: (projectId: string) => `/projects/${projectId}/tasks`,
    TASK_BY_ID: (projectId: string, taskId: string) =>
      `/projects/${projectId}/tasks/${taskId}`,
  },
  TASKS: {
    BASE: "/tasks",
  },
  USERS: {
    BASE: "/users",
  },
  HEALTH: "/health",
} as const;

export const AUTH_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
