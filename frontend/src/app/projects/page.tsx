"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppButton } from "@/components/common/AppButton";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CreateProjectModal } from "@/components/project/CreateProjectModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "@/redux/project/projectSlice";
import type { Project } from "@/types";
import { canManageProjects } from "@/utils/permissions";
import type { ProjectFormValues } from "@/validations/project";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading } = useAppSelector((state) => state.project);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const isAdmin = canManageProjects(userRole);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmit = async (values: ProjectFormValues) => {
    setSubmitting(true);
    try {
      if (editingProject) {
        const result = await dispatch(
          updateProject({ id: editingProject._id, payload: values })
        );
        if (updateProject.fulfilled.match(result)) toast.success("Project updated");
      } else {
        const result = await dispatch(createProject(values));
        if (createProject.fulfilled.match(result)) toast.success("Project created");
      }
      setModalOpen(false);
      setEditingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const result = await dispatch(deleteProject(deleteTarget._id));
      if (deleteProject.fulfilled.match(result)) toast.success("Project deleted");
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and open project boards</p>
          </div>
          {isAdmin && (
            <AppButton
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingProject(null);
                setModalOpen(true);
              }}
            >
              Create Project
            </AppButton>
          )}
        </div>

        {loading && projects.length === 0 ? (
          <Loader label="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start managing tasks."
            action={
              isAdmin ? (
                <AppButton onClick={() => setModalOpen(true)}>Create Project</AppButton>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isAdmin={isAdmin}
                onEdit={(p) => {
                  setEditingProject(p);
                  setModalOpen(true);
                }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={modalOpen}
        project={editingProject}
        currentUserId={currentUserId}
        loading={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project"
        message={`Delete "${deleteTarget?.name}"? All associated tasks will be removed.`}
        confirmLabel="Delete"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
