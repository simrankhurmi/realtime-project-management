import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { authService } from '../services';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  ApiResponse.success(res, { tokens }, 'Token refreshed successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  await authService.logout(req.user!.userId, token);
  ApiResponse.success(res, null, 'Logged out successfully');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  ApiResponse.success(res, user);
});
