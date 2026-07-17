"use client";

import { cn } from "@/utils/cn";
import { TaskStatus as TS } from "@/types";

interface TaskStatusIndicatorProps {
  status: TS;
}

export function TaskStatusIndicator({ status }: TaskStatusIndicatorProps) {
  const isCompleted = status === TS.DONE;
  const isInProgress = status === TS.IN_PROGRESS;

  return (
    <div
      className={cn(
        "relative h-5 w-5 shrink-0 overflow-hidden rounded-full border-2",
        isCompleted ? "border-indigo-500 bg-indigo-500" : "border-violet-400 bg-white"
      )}
    >
      {isInProgress && (
        <div className="absolute inset-0 bg-violet-400" style={{ clipPath: "inset(0 50% 0 0)" }} />
      )}
      {isCompleted && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
          ✓
        </span>
      )}
    </div>
  );
}
