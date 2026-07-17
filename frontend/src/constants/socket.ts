/** Client → server events */
export const SOCKET_EMIT_EVENTS = {
  PROJECT_JOIN: "project:join",
  PROJECT_LEAVE: "project:leave",
} as const;

/** Server → client task events (Kanban real-time sync) */
export const SOCKET_TASK_EVENTS = [
  "task:created",
  "task:updated",
  "task:moved",
  "task:deleted",
] as const;

export type SocketTaskEvent = (typeof SOCKET_TASK_EVENTS)[number];

/** Server → client presence events */
export const SOCKET_PRESENCE_EVENTS = {
  USER_JOINED: "project:user-joined",
  USER_LEFT: "project:user-left",
} as const;
