import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;
let warnedAboutMemoryFallback = false;

export const getRedisClient = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  if (env.REDIS_URL) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 2 ? null : Math.min(times * 200, 1000)),
    });
  } else {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 2 ? null : Math.min(times * 200, 1000)),
    });
  }

  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    if (!warnedAboutMemoryFallback) {
      console.warn('Redis unavailable, falling back to in-memory token store:', error.message);
      warnedAboutMemoryFallback = true;
    }
  });

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
