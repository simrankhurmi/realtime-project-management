import api from "./axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateProjectPayload,
  PaginationMeta,
  Project,
  UpdateProjectPayload,
} from "@/types";

export const projectApi = {
  getProjects: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<{ data: Project[]; meta: PaginationMeta }>(
      API_ENDPOINTS.PROJECTS.BASE,
      { params }
    );
    return { projects: data.data, meta: data.meta };
  },

  getProject: async (id: string) => {
    const { data } = await api.get<{ data: Project }>(
      API_ENDPOINTS.PROJECTS.BY_ID(id)
    );
    return data.data;
  },

  createProject: async (payload: CreateProjectPayload) => {
    const { data } = await api.post<{ data: Project }>(
      API_ENDPOINTS.PROJECTS.BASE,
      payload
    );
    return data.data;
  },

  updateProject: async (id: string, payload: UpdateProjectPayload) => {
    const { data } = await api.patch<{ data: Project }>(
      API_ENDPOINTS.PROJECTS.BY_ID(id),
      payload
    );
    return data.data;
  },

  deleteProject: async (id: string) => {
    await api.delete(API_ENDPOINTS.PROJECTS.BY_ID(id));
  },
};
