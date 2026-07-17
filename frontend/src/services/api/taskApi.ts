import api from "./axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "@/types";

export const taskApi = {
  getTasks: async (projectId: string) => {
    const { data } = await api.get<{ data: Task[] }>(
      API_ENDPOINTS.PROJECTS.TASKS(projectId)
    );
    return data.data;
  },

  createTask: async (projectId: string, payload: CreateTaskPayload) => {
    const { data } = await api.post<{ data: Task }>(
      API_ENDPOINTS.PROJECTS.TASKS(projectId),
      payload
    );
    return data.data;
  },

  updateTask: async (
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload
  ) => {
    const { data } = await api.patch<{ data: Task }>(
      API_ENDPOINTS.PROJECTS.TASK_BY_ID(projectId, taskId),
      payload
    );
    return data.data;
  },

  deleteTask: async (projectId: string, taskId: string) => {
    await api.delete(API_ENDPOINTS.PROJECTS.TASK_BY_ID(projectId, taskId));
  },

  moveTask: async (projectId: string, taskId: string, status: TaskStatus) =>
    taskApi.updateTask(projectId, taskId, { status }),

  getMyTasks: async () => {
    const { data } = await api.get<{ data: Task[] }>(API_ENDPOINTS.TASKS.BASE);
    return data.data;
  },
};
