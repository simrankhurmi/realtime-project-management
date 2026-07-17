"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setSocketConnected,
  setActiveProjectRoom,
  setLastSocketEvent,
} from "@/redux/socket/socketSlice";
import {
  initializeSocket,
  disconnectSocket,
  joinProjectRoom,
  leaveProjectRoom,
  onTaskEvent,
  offTaskEvent,
} from "@/services/socket";
import { SOCKET_TASK_EVENTS } from "@/constants/socket";
import {
  applyRealtimeTaskUpdate,
  applyRealtimeTaskDelete,
} from "@/redux/task/taskSlice";
import type { Task } from "@/types";

const TASK_EVENTS = SOCKET_TASK_EVENTS;

export function useSocket(projectId?: string) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { connected, activeProjectId } = useAppSelector((state) => state.socket);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      dispatch(setSocketConnected(false));
      return;
    }

    try {
      const socket = initializeSocket();
      if (!socket.connected) {
        socket.connect();
      }

      const handleConnect = () => dispatch(setSocketConnected(true));
      const handleDisconnect = () => dispatch(setSocketConnected(false));

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      if (socket.connected) {
        dispatch(setSocketConnected(true));
      }

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        disconnectSocket();
        dispatch(setSocketConnected(false));
        dispatch(setActiveProjectRoom(null));
      };
    } catch {
      return undefined;
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!connected || !projectId) return;

    const handleTaskChange = (payload: unknown) => {
      const data = payload as {
        projectId: string;
        task?: Task;
        taskId?: string;
        updatedBy?: string;
      };

      if (data.updatedBy === userId) return;

      dispatch(setLastSocketEvent("task:updated"));

      if (data.task) {
        dispatch(applyRealtimeTaskUpdate({ projectId: data.projectId, task: data.task }));
      } else if (data.taskId) {
        dispatch(applyRealtimeTaskDelete({ projectId: data.projectId, taskId: data.taskId }));
      }
    };

    joinProjectRoom(projectId);
    dispatch(setActiveProjectRoom(projectId));

    TASK_EVENTS.forEach((event) => onTaskEvent(event, handleTaskChange));

    return () => {
      leaveProjectRoom(projectId);
      TASK_EVENTS.forEach((event) => offTaskEvent(event, handleTaskChange));
      dispatch(setActiveProjectRoom(null));
    };
  }, [connected, projectId, dispatch, userId]);

  return { connected, activeProjectId };
}
