import api from "./axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<{ data: AuthResponse }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return data.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const { data } = await api.post<{ data: AuthResponse }>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials
    );
    return data.data;
  },

  getProfile: async () => {
    const { data } = await api.get<{ data: User }>(API_ENDPOINTS.AUTH.PROFILE);
    return data.data;
  },

  logout: async () => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
