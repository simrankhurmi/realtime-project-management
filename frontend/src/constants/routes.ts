export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  TASKS: "/tasks",
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROJECTS,
  ROUTES.TASKS,
] as const;
