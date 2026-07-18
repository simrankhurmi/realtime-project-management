import type { CorsOptions } from 'cors';
import { env } from './env';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://realtime-project-management.vercel.app',
];

export const getAllowedOrigins = (): string[] => {
  const envOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...envOrigins, ...DEFAULT_ALLOWED_ORIGINS])];
};

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const socketCorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST'],
  credentials: true,
};
