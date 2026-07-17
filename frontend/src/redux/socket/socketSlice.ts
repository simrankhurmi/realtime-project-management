import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  connected: boolean;
  activeProjectId: string | null;
  lastEvent: string | null;
}

const initialState: SocketState = {
  connected: false,
  activeProjectId: null,
  lastEvent: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setActiveProjectRoom: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    setLastSocketEvent: (state, action: PayloadAction<string | null>) => {
      state.lastEvent = action.payload;
    },
  },
});

export const { setSocketConnected, setActiveProjectRoom, setLastSocketEvent } =
  socketSlice.actions;
export default socketSlice.reducer;
