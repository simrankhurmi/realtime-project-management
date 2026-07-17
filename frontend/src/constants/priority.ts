import { TaskPriority } from "@/types";

export const PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: "Low" },
  { value: TaskPriority.MEDIUM, label: "Medium" },
  { value: TaskPriority.HIGH, label: "High" },
] as const;

export const PRIORITY_STYLES: Record<
  TaskPriority,
  { badge: string; label: string }
> = {
  [TaskPriority.LOW]: {
    badge: "bg-slate-100 text-slate-600",
    label: "Low",
  },
  [TaskPriority.MEDIUM]: {
    badge: "bg-sky-50 text-sky-700",
    label: "Medium",
  },
  [TaskPriority.HIGH]: {
    badge: "bg-rose-50 text-rose-700",
    label: "High",
  },
};
