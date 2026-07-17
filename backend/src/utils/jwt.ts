import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

const accessTokenOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
const refreshTokenOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, accessTokenOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
};

export const verifyAccessToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_SECRET) as DecodedToken;
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
};

export const getTokenExpirySeconds = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 604_800;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * (multipliers[unit] ?? 86400);
};
