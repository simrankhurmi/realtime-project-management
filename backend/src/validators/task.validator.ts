import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const projectIdParamSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
});

export const taskIdParamSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
});

const assigneeIdSchema = z
  .union([
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID'),
    z.literal(''),
    z.null(),
  ])
  .optional();

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: assigneeIdSchema,
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
