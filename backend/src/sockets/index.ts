import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { socketAuthMiddleware } from './middleware/socketAuth.middleware';
import { registerProjectHandlers } from './handlers/project.handler';

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  io.use(socketAuthMiddleware);
  registerProjectHandlers(io);

  console.log('Socket.io initialized');
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const closeSocket = (): void => {
  if (io) {
    io.close();
    io = null;
    console.log('Socket.io closed');
  }
};
