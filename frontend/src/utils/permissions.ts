import type { Task } from "@/types";

export function isAdmin(role?: string) {
  return role === "admin";
}

export function canManageProjects(role?: string) {
  return isAdmin(role);
}

export function canEditTaskDetails(task: Task, userId?: string, role?: string) {
  if (!userId) return false;
  return isAdmin(role) || task.createdBy === userId;
}

export function canDeleteTask(task: Task, userId?: string, role?: string) {
  return canEditTaskDetails(task, userId, role);
}

export function formatUserName(user?: { firstName: string; lastName: string }) {
  if (!user) return "Unassigned";
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatTaskDate(date: string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getInitials(user?: { firstName: string; lastName: string }) {
  if (!user) return "?";
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}
