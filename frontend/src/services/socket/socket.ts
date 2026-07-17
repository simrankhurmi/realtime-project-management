import { io, type Socket } from "socket.io-client";
import { env } from "@/config/env";
import { getAccessToken } from "@/services/api/axios";

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (socket) return socket;

  const token = getAccessToken();
  if (!token) {
    throw new Error("Cannot initialize socket without authentication token");
  }

  socket = io(env.socketUrl, {
    auth: { token },
    autoConnect: false,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinProjectRoom(projectId: string) {
  if (!socket?.connected) return;
  socket.emit("project:join", { projectId });
}

export function leaveProjectRoom(projectId: string) {
  if (!socket?.connected) return;
  socket.emit("project:leave", { projectId });
}

export function onTaskEvent(
  event: "task:created" | "task:updated" | "task:moved" | "task:deleted",
  callback: (payload: unknown) => void
) {
  socket?.on(event, callback);
}

export function offTaskEvent(
  event: "task:created" | "task:updated" | "task:moved" | "task:deleted",
  callback: (payload: unknown) => void
) {
  socket?.off(event, callback);
}
