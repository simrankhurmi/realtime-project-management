import type { Project } from "@/types";

export function getProjectStatusStyle(status: Project["status"]) {
  const styles: Record<Project["status"], string> = {
    planning: "bg-sky-50 text-sky-700",
    active: "bg-indigo-50 text-indigo-600",
    on_hold: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    archived: "bg-slate-100 text-slate-600",
  };
  return styles[status] ?? styles.planning;
}

export function formatProjectStatus(status: Project["status"]) {
  return status.replace("_", " ");
}
