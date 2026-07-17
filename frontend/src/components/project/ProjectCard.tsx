"use client";

import Link from "next/link";
import type { Project } from "@/types";
import { ROUTES } from "@/constants/routes";
import { AppButton } from "@/components/common/AppButton";
import { getProjectStatusStyle, formatProjectStatus } from "@/utils/projectStatus";

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, isAdmin = false, onEdit, onDelete }: ProjectCardProps) {
  const memberCount = Array.isArray(project.members) ? project.members.length + 1 : 1;

  return (
    <div className="flex flex-col rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(79,70,229,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(79,70,229,0.12)] sm:rounded-[24px] sm:p-6">
      <div className="flex-1">
        <div
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getProjectStatusStyle(project.status)}`}
        >
          {formatProjectStatus(project.status)}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {project.description || "No description provided."}
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
          {memberCount} team member{memberCount !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link href={ROUTES.PROJECT_DETAIL(project._id)} className="w-full sm:w-auto">
          <AppButton variant="primary" className="w-full sm:w-auto">Open Board</AppButton>
        </Link>
        {isAdmin && (
          <>
            <AppButton variant="secondary" className="w-full sm:w-auto" onClick={() => onEdit(project)}>
              Edit
            </AppButton>
            <AppButton variant="ghost" className="w-full sm:w-auto" onClick={() => onDelete(project)}>
              Delete
            </AppButton>
          </>
        )}
      </div>
    </div>
  );
}
