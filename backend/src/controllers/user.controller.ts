import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { userService } from '../services';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listActive();
  ApiResponse.success(res, users);
});
