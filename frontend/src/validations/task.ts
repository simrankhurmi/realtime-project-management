import { z } from "zod";
import { TaskPriority, TaskStatus } from "@/types";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
