import { getRedisClient, REDIS_KEYS } from '../config/redis';
import { env } from '../config/env';
import { getTokenExpirySeconds } from '../utils/jwt';
import { memoryStoreService } from './memory-store.service';

export class RedisService {
  private useMemoryFallback = false;

  private get client() {
    return getRedisClient();
  }

  private markMemoryFallback(error: unknown): void {
    if (!this.useMemoryFallback) {
      const message = error instanceof Error ? error.message : 'Unknown Redis error';
      console.warn(`Using in-memory token store because Redis is unavailable: ${message}`);
      this.useMemoryFallback = true;
    }
  }

  private async withFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (this.useMemoryFallback || !this.client) {
      return fallback();
    }

    try {
      return await operation();
    } catch (error) {
      this.markMemoryFallback(error);
      return fallback();
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    await this.withFallback(
      async () => {
        if (expirySeconds) {
          await this.client!.setex(key, expirySeconds, value);
        } else {
          await this.client!.set(key, value);
        }
      },
      () => memoryStoreService.set(key, value, expirySeconds)
    );
  }

  async get(key: string): Promise<string | null> {
    return this.withFallback(
      () => this.client!.get(key),
      () => memoryStoreService.get(key)
    );
  }

  async del(key: string): Promise<void> {
    await this.withFallback(
      () => this.client!.del(key).then(() => undefined),
      () => memoryStoreService.del(key)
    );
  }

  async exists(key: string): Promise<boolean> {
    return this.withFallback(
      async () => {
        const result = await this.client!.exists(key);
        return result === 1;
      },
      () => memoryStoreService.exists(key)
    );
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiry = getTokenExpirySeconds(env.JWT_REFRESH_EXPIRES_IN);
    await this.set(REDIS_KEYS.refreshToken(userId), token, expiry);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.get(REDIS_KEYS.refreshToken(userId));
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.del(REDIS_KEYS.refreshToken(userId));
  }

  async blacklistAccessToken(token: string, expirySeconds: number): Promise<void> {
    await this.set(REDIS_KEYS.blacklistedToken(token), '1', expirySeconds);
  }

  async setUserSession(userId: string, socketId: string): Promise<void> {
    await this.withFallback(
      () => this.client!.sadd(REDIS_KEYS.userSession(userId), socketId).then(() => undefined),
      () => memoryStoreService.sadd(REDIS_KEYS.userSession(userId), socketId)
    );
  }

  async removeUserSession(userId: string, socketId: string): Promise<void> {
    await this.withFallback(
      () => this.client!.srem(REDIS_KEYS.userSession(userId), socketId).then(() => undefined),
      () => memoryStoreService.srem(REDIS_KEYS.userSession(userId), socketId)
    );
  }

  async getUserSessions(userId: string): Promise<string[]> {
    return this.withFallback(
      () => this.client!.smembers(REDIS_KEYS.userSession(userId)),
      () => memoryStoreService.smembers(REDIS_KEYS.userSession(userId))
    );
  }
}

export const redisService = new RedisService();
