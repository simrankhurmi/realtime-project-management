import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { taskService } from '../services';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.findAll(req.params.projectId as string, req.user!.userId);
  ApiResponse.success(res, tasks);
});

export const getMyTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.findAllForUser(req.user!.userId);
  ApiResponse.success(res, tasks);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create(
    req.params.projectId as string,
    req.user!.userId,
    req.body
  );
  ApiResponse.created(res, task, 'Task created successfully');
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(
    req.params.projectId as string,
    req.params.taskId as string,
    req.user!.userId,
    req.body
  );
  ApiResponse.success(res, task, 'Task updated successfully');
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.delete(
    req.params.projectId as string,
    req.params.taskId as string,
    req.user!.userId,
    req.user!.role
  );
  ApiResponse.noContent(res);
});
