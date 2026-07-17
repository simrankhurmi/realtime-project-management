import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectApi } from "@/services/api/projectApi";
import { getErrorMessage } from "@/utils/error";
import type {
  CreateProjectPayload,
  PaginationMeta,
  Project,
  UpdateProjectPayload,
} from "@/types";

interface ProjectState {
  items: Project[];
  current: Project | null;
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  items: [],
  current: null,
  meta: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async (params: { page?: number; limit?: number; search?: string } | undefined, { rejectWithValue }) => {
    try {
      return await projectApi.getProjects(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load projects"));
    }
  }
);

export const fetchProject = createAsyncThunk(
  "project/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectApi.getProject(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load project"));
    }
  }
);

export const createProject = createAsyncThunk(
  "project/create",
  async (payload: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectApi.createProject(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create project"));
    }
  }
);

export const updateProject = createAsyncThunk(
  "project/update",
  async (
    { id, payload }: { id: string; payload: UpdateProjectPayload },
    { rejectWithValue }
  ) => {
    try {
      return await projectApi.updateProject(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update project"));
    }
  }
);

export const deleteProject = createAsyncThunk(
  "project/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete project"));
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.projects;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.items = state.items.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
