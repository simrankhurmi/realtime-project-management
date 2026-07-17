"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader } from "@/components/common/Loader";
import { AppButton } from "@/components/common/AppButton";
import { TaskBoard } from "@/components/task/TaskBoard";
import { CreateProjectModal } from "@/components/project/CreateProjectModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProject,
  clearCurrentProject,
  updateProject,
} from "@/redux/project/projectSlice";
import { fetchTasks } from "@/redux/task/taskSlice";
import { getProjectMembers } from "@/utils/projectMembers";
import { canManageProjects } from "@/utils/permissions";
import { ROUTES } from "@/constants/routes";
import type { ProjectFormValues } from "@/validations/project";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const dispatch = useAppDispatch();
  const { current: project, loading } = useAppSelector((state) => state.project);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const isAdmin = canManageProjects(userRole);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    dispatch(fetchProject(projectId));
    dispatch(fetchTasks(projectId));
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, projectId]);

  const members = getProjectMembers(project ?? null);

  const handleUpdateProject = async (values: ProjectFormValues) => {
    if (!project) return;
    setSubmitting(true);
    try {
      const result = await dispatch(
        updateProject({ id: project._id, payload: values })
      );
      if (updateProject.fulfilled.match(result)) {
        toast.success("Project updated");
        setEditModalOpen(false);
      } else {
        toast.error((result.payload as string) ?? "Update failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !project) {
    return (
      <AppLayout>
        <Loader label="Loading project board..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-[20px] border border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/40 to-violet-50/40 p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <Link
            href={ROUTES.PROJECTS}
            className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Projects
          </Link>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {project?.name ?? "Project Board"}
              </h1>
              {project?.description && (
                <p className="mt-2 max-w-3xl text-sm text-slate-600">{project.description}</p>
              )}
            </div>
            {isAdmin && project && (
              <AppButton
                variant="secondary"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => setEditModalOpen(true)}
              >
                Edit Project
              </AppButton>
            )}
          </div>
          {members.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {members.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600"
                >
                  {member.firstName} {member.lastName}
                </span>
              ))}
            </div>
          )}
        </div>
        {projectId && <TaskBoard projectId={projectId} project={project} />}
      </div>

      {isAdmin && project && (
        <CreateProjectModal
          open={editModalOpen}
          project={project}
          currentUserId={currentUserId}
          loading={submitting}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateProject}
        />
      )}
    </AppLayout>
  );
}
