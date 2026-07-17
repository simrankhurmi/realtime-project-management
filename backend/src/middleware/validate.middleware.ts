import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type RequestProperty = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, property: RequestProperty = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'root';
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        next(ApiError.badRequest('Validation failed', errors));
        return;
      }
      next(error);
    }
  };
};
