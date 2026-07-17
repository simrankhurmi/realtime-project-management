import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { isProduction } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    errors = {};
    for (const field in err.errors) {
      errors[field] = [err.errors[field].message];
    }
    isOperational = true;
  } else if ((err as MongooseError & { code?: number }).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    isOperational = true;
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  }

  if (!isOperational) {
    console.error('Unhandled error:', err);
  }

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
