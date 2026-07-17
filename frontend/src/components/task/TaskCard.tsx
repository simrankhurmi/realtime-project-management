"use client";

import type { Project, Task } from "@/types";
import { TaskStatus as TS, TaskPriority } from "@/types";
import { cn } from "@/utils/cn";
import { PRIORITY_STYLES } from "@/constants/priority";
import { formatTaskDate, formatUserName, getInitials } from "@/utils/permissions";
import { TaskStatusIndicator } from "./TaskStatusIndicator";

interface TaskCardProps {
  task: Task;
  project?: Project | null;
  onDragStart?: (task: Task) => void;
}

export function TaskCard({ task, project, onDragStart }: TaskCardProps) {
  const isCompleted = task.status === TS.DONE;
  const priority = task.priority ?? TaskPriority.MEDIUM;
  const priorityStyle = PRIORITY_STYLES[priority];

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task)}
      className="cursor-grab rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(79,70,229,0.12)] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold uppercase tracking-wide text-slate-900">
            {task.title}
          </h4>
          <p className="mt-1 truncate text-xs font-medium text-slate-400">
            {project?.name ?? task.projectName ?? task.description ?? "Project task"}
          </p>
        </div>
        <TaskStatusIndicator status={task.status} />
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Created by</span>
          <span className="font-medium text-slate-700">
            {formatUserName(task.createdByUser)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Assignee</span>
          <span className="font-medium text-slate-700">
            {task.assigneeUser ? formatUserName(task.assigneeUser) : "Unassigned"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            priorityStyle.badge
          )}
        >
          <span>≡</span> {priorityStyle.label}
        </span>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] font-medium",
              isCompleted ? "text-emerald-600" : "text-amber-700"
            )}
          >
            📅 {formatTaskDate(task.updatedAt)}
          </span>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
              task.assigneeUser
                ? "bg-gradient-to-br from-indigo-400 to-violet-500 text-white"
                : "border border-dashed border-slate-300 bg-slate-100 text-slate-400"
            )}
            title={task.assigneeUser ? formatUserName(task.assigneeUser) : "Unassigned"}
          >
            {task.assigneeUser ? getInitials(task.assigneeUser) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
