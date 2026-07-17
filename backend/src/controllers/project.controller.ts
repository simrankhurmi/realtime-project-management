import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { projectService } from '../services';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.create(req.user!.userId, req.body);
  ApiResponse.created(res, project, 'Project created successfully');
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { projects, meta } = await projectService.findAll(req.user!.userId, req.query as never);
  ApiResponse.paginated(res, projects, meta);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.findById(req.params.id as string, req.user!.userId);
  ApiResponse.success(res, project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.update(req.params.id as string, req.user!.userId, req.body);
  ApiResponse.success(res, project, 'Project updated successfully');
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.delete(req.params.id as string, req.user!.userId);
  ApiResponse.noContent(res);
});
