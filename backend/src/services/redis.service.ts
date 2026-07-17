import { getRedisClient, REDIS_KEYS } from '../config/redis';
import { env } from '../config/env';
import { getTokenExpirySeconds } from '../utils/jwt';

export class RedisService {
  private get client() {
    return getRedisClient();
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await this.client.setex(key, expirySeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
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
    await this.client.sadd(REDIS_KEYS.userSession(userId), socketId);
  }

  async removeUserSession(userId: string, socketId: string): Promise<void> {
    await this.client.srem(REDIS_KEYS.userSession(userId), socketId);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    return this.client.smembers(REDIS_KEYS.userSession(userId));
  }
}

export const redisService = new RedisService();
