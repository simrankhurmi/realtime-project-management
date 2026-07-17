import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected gracefully');
  }
};

export const REDIS_KEYS = {
  refreshToken: (userId: string) => `refresh_token:${userId}`,
  blacklistedToken: (token: string) => `blacklist:${token}`,
  userSession: (userId: string) => `session:${userId}`,
} as const;
