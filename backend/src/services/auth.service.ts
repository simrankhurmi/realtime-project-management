import { User } from '../models';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/helpers';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpirySeconds,
} from '../utils/jwt';
import { redisService } from './redis.service';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../validators';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: AuthTokens;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await User.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const tokens = await this.generateAndStoreTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = await this.generateAndStoreTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const storedToken = await redisService.getRefreshToken(decoded.userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw ApiError.unauthorized('Refresh token revoked or expired');
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    return this.generateAndStoreTokens(user._id.toString(), user.email);
  }

  async logout(userId: string, accessToken?: string): Promise<void> {
    await redisService.revokeRefreshToken(userId);

    if (accessToken) {
      const expiry = getTokenExpirySeconds(env.JWT_EXPIRES_IN);
      await redisService.blacklistAccessToken(accessToken, expiry);
    }
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  private async generateAndStoreTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload = { userId, email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await redisService.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
