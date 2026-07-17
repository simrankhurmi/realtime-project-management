"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Task, User } from "@/types";
import { TaskPriority, TaskStatus } from "@/types";
import { taskSchema, type TaskFormValues } from "@/validations/task";
import { PRIORITY_OPTIONS } from "@/constants/priority";
import { AppInput } from "@/components/common/AppInput";
import { AppButton } from "@/components/common/AppButton";
import { getMemberLabel } from "@/utils/projectMembers";

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  projectName?: string;
  members?: User[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskModal({
  open,
  task,
  projectName,
  members = [],
  loading = false,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        status: task?.status ?? TaskStatus.TODO,
        priority: task?.priority ?? TaskPriority.MEDIUM,
        assigneeId: task?.assigneeId ?? "",
      });
    }
  }, [open, task, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {task ? "Edit Task" : "Create Task"}
        </h2>
        {task && (projectName ?? task.projectName) && (
          <p className="mt-1 text-sm font-medium text-slate-500">
            {projectName ?? task.projectName}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <AppInput
            label="Title"
            placeholder="Implement login flow"
            error={errors.title?.message}
            {...register("title")}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              {...register("description")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assigneeId" className="text-sm font-medium text-slate-700">
              Assign to
            </label>
            <select
              id="assigneeId"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              {...register("assigneeId")}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {getMemberLabel(member)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="priority" className="text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              id="priority"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              {...register("priority")}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              {...register("status")}
            >
              <option value={TaskStatus.TODO}>Todo</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AppButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton type="submit" loading={loading}>
              {task ? "Save Task" : "Create Task"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}
