import type { TaskFormValues } from "@/validations/task";
import type { CreateTaskPayload, UpdateTaskPayload } from "@/types";

/** Maps form values to API payload; empty assignee sends null to clear on update. */
export function buildTaskPayload(values: TaskFormValues): CreateTaskPayload {
  return {
    ...values,
    description: values.description || undefined,
    assigneeId: values.assigneeId ? values.assigneeId : undefined,
  };
}

export function buildTaskUpdatePayload(values: TaskFormValues): UpdateTaskPayload {
  return {
    ...values,
    description: values.description || undefined,
    assigneeId: values.assigneeId ? values.assigneeId : null,
  };
}
