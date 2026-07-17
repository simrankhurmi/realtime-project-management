const TASKS_STORAGE_KEY = "pm_tasks";

export function getStoredTasks(): Record<string, import("@/types").Task[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setStoredTasks(tasks: Record<string, import("@/types").Task[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export function getAuthCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookie(name: string, value: string, maxAgeDays = 7) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 86400}; SameSite=Lax`;
}

export function clearAuthCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function clearAuthCookies(names: string[]) {
  names.forEach(clearAuthCookie);
}
