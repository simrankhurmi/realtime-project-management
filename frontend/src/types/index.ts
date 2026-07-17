export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface TaskUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  members: (User | string)[];
  status: "planning" | "active" | "on_hold" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdBy: string;
  lastUpdatedBy?: string;
  createdByUser?: TaskUser;
  assigneeUser?: TaskUser;
  lastUpdatedByUser?: TaskUser;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: Project["status"];
  members?: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface DashboardStats {
  totalProjects: number;
  assignedTasks: number;
  completedTasks: number;
}
