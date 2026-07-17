import { TaskStatus } from "@/types";

export const TASK_COLUMNS = [
  {
    id: TaskStatus.TODO,
    title: "Todo",
    headerClass: "text-slate-700",
    columnClass: "bg-[#f4f5f7]",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: "In Progress",
    headerClass: "text-indigo-700",
    columnClass: "bg-[#eef0ff]",
  },
  {
    id: TaskStatus.DONE,
    title: "Completed",
    headerClass: "text-emerald-700",
    columnClass: "bg-[#eefaf3]",
  },
] as const;
