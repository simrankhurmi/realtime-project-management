import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { getRedisClient, disconnectRedis } from './config/redis';
import { initializeSocket, closeSocket } from './sockets';

const bootstrap = async (): Promise<void> => {
  await connectDatabase();
  getRedisClient();

  const app = createApp();
  const httpServer = http.createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    httpServer.close(async () => {
      closeSocket();
      await disconnectDatabase();
      await disconnectRedis();
      console.log('Server shut down complete');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
