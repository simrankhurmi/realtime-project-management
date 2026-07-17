import { Server as SocketServer, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth.middleware';
import { redisService } from '../../services';

function resolveProjectId(payload: string | { projectId: string }): string {
  return typeof payload === 'string' ? payload : payload.projectId;
}

export const registerProjectHandlers = (io: SocketServer): void => {
  io.on('connection', async (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const { userId } = authSocket;

    await redisService.setUserSession(userId, socket.id);
    console.log(`User ${userId} connected (${socket.id})`);

    socket.join(`user:${userId}`);

    socket.on('project:join', (payload: string | { projectId: string }) => {
      const projectId = resolveProjectId(payload);
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('project:user-joined', {
        userId,
        projectId,
      });
    });

    socket.on('project:leave', (payload: string | { projectId: string }) => {
      const projectId = resolveProjectId(payload);
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('project:user-left', {
        userId,
        projectId,
      });
    });

    socket.on('disconnect', async () => {
      await redisService.removeUserSession(userId, socket.id);
      console.log(`User ${userId} disconnected (${socket.id})`);
    });
  });
};
