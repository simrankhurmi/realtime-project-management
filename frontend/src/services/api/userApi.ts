import api from "./axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { User } from "@/types";

export const userApi = {
  listUsers: async () => {
    const { data } = await api.get<{ data: User[] }>(API_ENDPOINTS.USERS.BASE);
    return data.data;
  },
};
