import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_COOKIE, REFRESH_COOKIE } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { clearAuthCookies, getAuthCookie } from "@/utils/storage";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
}

export function getAccessToken() {
  return accessToken;
}

function resolveTokensFromCookies() {
  if (!accessToken) {
    accessToken = getAuthCookie(AUTH_COOKIE);
  }
  if (!refreshToken) {
    refreshToken = getAuthCookie(REFRESH_COOKIE);
  }
}

function redirectToLogin() {
  clearAuthCookies([AUTH_COOKIE, REFRESH_COOKIE]);
  setTokens(null, null);
  if (typeof window !== "undefined" && window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  resolveTokensFromCookies();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    resolveTokensFromCookies();

    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const newAccessToken = data.data.tokens.accessToken as string;
      const newRefreshToken = data.data.tokens.refreshToken as string;
      setTokens(newAccessToken, newRefreshToken);
      refreshQueue.forEach((cb) => cb(newAccessToken));
      refreshQueue = [];
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
