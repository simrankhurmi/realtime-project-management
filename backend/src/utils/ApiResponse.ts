import { Response } from 'express';

interface ApiResponseOptions<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    const body: ApiResponseOptions<T> = { success: true, message, data };
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: { page: number; limit: number; total: number; totalPages: number },
    message = 'Success'
  ): Response {
    return res.status(200).json({ success: true, message, data, meta });
  }
}
