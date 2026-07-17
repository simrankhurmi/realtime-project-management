import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100).trim(),
  description: z.string().max(1000).trim().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID')).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  search: z.string().trim().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
