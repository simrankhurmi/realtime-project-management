import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(1000).optional(),
  status: z
    .enum(["planning", "active", "on_hold", "completed", "archived"])
    .optional(),
  members: z.array(z.string()).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
