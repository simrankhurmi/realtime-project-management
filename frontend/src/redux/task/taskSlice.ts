import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { taskApi } from "@/services/api/taskApi";
import { getErrorMessage } from "@/utils/error";
import type { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload } from "@/types";

interface TaskState {
  byProject: Record<string, Task[]>;
  allTasks: Task[];
  loading: boolean;
  listLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  byProject: {},
  allTasks: [],
  loading: false,
  listLoading: false,
  error: null,
};

export const fetchMyTasks = createAsyncThunk(
  "task/fetchMyTasks",
  async (_, { rejectWithValue }) => {
    try {
      return await taskApi.getMyTasks();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load tasks"));
    }
  }
);

export const fetchTasks = createAsyncThunk(
  "task/fetchAll",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return { projectId, tasks: await taskApi.getTasks(projectId) };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load tasks"));
    }
  }
);

export const createTask = createAsyncThunk(
  "task/create",
  async (
    { projectId, payload }: { projectId: string; payload: CreateTaskPayload },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.createTask(projectId, payload);
      return { projectId, task };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create task"));
    }
  }
);

export const updateTask = createAsyncThunk(
  "task/update",
  async (
    {
      projectId,
      taskId,
      payload,
    }: { projectId: string; taskId: string; payload: UpdateTaskPayload },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.updateTask(projectId, taskId, payload);
      return { projectId, task };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update task"));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "task/delete",
  async (
    { projectId, taskId }: { projectId: string; taskId: string },
    { rejectWithValue }
  ) => {
    try {
      await taskApi.deleteTask(projectId, taskId);
      return { projectId, taskId };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete task"));
    }
  }
);

export const moveTask = createAsyncThunk(
  "task/move",
  async (
    { projectId, taskId, status }: { projectId: string; taskId: string; status: TaskStatus },
    { dispatch }
  ) => {
    dispatch(optimisticMoveTask({ projectId, taskId, status }));
    return taskApi.moveTask(projectId, taskId, status);
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    optimisticMoveTask: (
      state,
      action: PayloadAction<{ projectId: string; taskId: string; status: TaskStatus }>
    ) => {
      const { projectId, taskId, status } = action.payload;
      const tasks = state.byProject[projectId];
      if (!tasks) return;
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        task.updatedAt = new Date().toISOString();
      }
    },
    applyRealtimeTaskUpdate: (
      state,
      action: PayloadAction<{ projectId: string; task: Task }>
    ) => {
      const { projectId, task } = action.payload;
      const mergeWithExisting = (existing?: Task): Task => ({
        ...task,
        projectName: task.projectName ?? existing?.projectName,
      });

      const tasks = [...(state.byProject[projectId] ?? [])];
      const index = tasks.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        tasks[index] = mergeWithExisting(tasks[index]);
      } else {
        tasks.unshift(task);
      }
      state.byProject[projectId] = tasks;

      const allIndex = state.allTasks.findIndex((t) => t.id === task.id);
      if (allIndex >= 0) {
        state.allTasks[allIndex] = mergeWithExisting(state.allTasks[allIndex]);
      } else {
        state.allTasks.unshift(task);
      }
    },
    applyRealtimeTaskDelete: (
      state,
      action: PayloadAction<{ projectId: string; taskId: string }>
    ) => {
      const { projectId, taskId } = action.payload;
      state.byProject[projectId] = (state.byProject[projectId] ?? []).filter(
        (t) => t.id !== taskId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.byProject[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyTasks.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.listLoading = false;
        state.allTasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        state.byProject[projectId] = [...(state.byProject[projectId] ?? []), task];
        state.allTasks = [task, ...state.allTasks.filter((t) => t.id !== task.id)];
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        const mergeTask = (existing: Task) => {
          if (existing.id !== task.id) return existing;
          const merged: Task = {
            ...task,
            projectName: task.projectName ?? existing.projectName,
          };
          if (!merged.assigneeId) {
            merged.assigneeId = undefined;
            merged.assigneeUser = undefined;
          }
          return merged;
        };
        state.byProject[projectId] = (state.byProject[projectId] ?? []).map(mergeTask);
        state.allTasks = state.allTasks.map(mergeTask);
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const task = action.payload;
        const mergeTask = (existing: Task) =>
          existing.id === task.id
            ? { ...task, projectName: task.projectName ?? existing.projectName }
            : existing;
        state.byProject[task.projectId] = (state.byProject[task.projectId] ?? []).map(mergeTask);
        state.allTasks = state.allTasks.map(mergeTask);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { projectId, taskId } = action.payload;
        state.byProject[projectId] = (state.byProject[projectId] ?? []).filter(
          (t) => t.id !== taskId
        );
        state.allTasks = state.allTasks.filter((t) => t.id !== taskId);
      });
  },
});

export const { optimisticMoveTask, applyRealtimeTaskUpdate, applyRealtimeTaskDelete } =
  taskSlice.actions;
export default taskSlice.reducer;
