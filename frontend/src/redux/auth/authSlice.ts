import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE, type RehydrateAction } from "redux-persist";
import { authApi } from "@/services/api/authApi";
import { setTokens } from "@/services/api/axios";
import { AUTH_COOKIE, REFRESH_COOKIE } from "@/constants/api";
import { clearAuthCookie, setAuthCookie } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      return await authApi.register(credentials);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Registration failed"));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authApi.login(credentials);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getProfile();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load profile"));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch {
    // Clear local session even if API logout fails
  }
});

function applyAuthResult(state: AuthState, payload: AuthResponse) {
  state.user = payload.user;
  state.accessToken = payload.tokens.accessToken;
  state.refreshToken = payload.tokens.refreshToken;
  state.isAuthenticated = true;
  setTokens(payload.tokens.accessToken, payload.tokens.refreshToken);
  setAuthCookie(AUTH_COOKIE, payload.tokens.accessToken);
  setAuthCookie(REFRESH_COOKIE, payload.tokens.refreshToken, 30);
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (state, action: PayloadAction<Pick<AuthState, "user" | "accessToken" | "refreshToken">>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = Boolean(action.payload.accessToken);
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      setTokens(null, null);
      clearAuthCookie(AUTH_COOKIE);
      clearAuthCookie(REFRESH_COOKIE);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        applyAuthResult(state, action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        applyAuthResult(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        authSlice.caseReducers.clearAuth(state);
      })
      .addCase(REHYDRATE, (state, action: RehydrateAction) => {
        const payload = action.payload as { auth?: AuthState } | undefined;
        const auth = payload?.auth;
        if (!auth?.accessToken) return;

        state.user = auth.user;
        state.accessToken = auth.accessToken;
        state.refreshToken = auth.refreshToken;
        state.isAuthenticated = true;
        setTokens(auth.accessToken, auth.refreshToken);
        setAuthCookie(AUTH_COOKIE, auth.accessToken);
        if (auth.refreshToken) {
          setAuthCookie(REFRESH_COOKIE, auth.refreshToken, 30);
        }
      });
  },
});

export const { hydrateAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
