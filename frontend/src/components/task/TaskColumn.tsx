"use client";

import type { Project, Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  project?: Project | null;
  headerClass?: string;
  columnClass?: string;
  onDrop: (status: TaskStatus) => void;
  onDragStart: (task: Task) => void;
}

export function TaskColumn({
  title,
  status,
  tasks,
  project,
  headerClass,
  columnClass,
  onDrop,
  onDragStart,
}: TaskColumnProps) {
  return (
    <div
      className={`flex min-h-[360px] w-[min(100%,280px)] shrink-0 flex-col rounded-[20px] p-3 sm:min-h-[480px] sm:w-full sm:rounded-[24px] sm:p-4 md:min-h-[520px] ${columnClass ?? "bg-[#f4f5f7]"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(status)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-[0.15em] ${headerClass ?? "text-slate-700"}`}>
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{tasks.length} tasks</p>
        </div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-xs text-slate-400">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={project}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
