import type { Project, User } from "@/types";

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = record.id ?? record._id;
  if (!id || !record.email) return null;

  return {
    id: String(id),
    email: String(record.email),
    firstName: String(record.firstName ?? ""),
    lastName: String(record.lastName ?? ""),
    role: String(record.role ?? "user"),
  };
}

export function getProjectMembers(project: Project | null): User[] {
  if (!project) return [];

  const members: User[] = [];

  const owner = normalizeUser(project.owner);
  if (owner) members.push(owner);

  for (const member of project.members ?? []) {
    const user = normalizeUser(member);
    if (user && !members.some((m) => m.id === user.id)) {
      members.push(user);
    }
  }

  return members;
}

export function getMemberLabel(user: User) {
  return `${user.firstName} ${user.lastName}`;
}
