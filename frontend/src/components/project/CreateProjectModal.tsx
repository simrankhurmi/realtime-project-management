"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project, User } from "@/types";
import { projectSchema, type ProjectFormValues } from "@/validations/project";
import { userApi } from "@/services/api/userApi";
import { getProjectMembers, getMemberLabel } from "@/utils/projectMembers";
import { AppInput } from "@/components/common/AppInput";
import { AppButton } from "@/components/common/AppButton";

interface CreateProjectModalProps {
  open: boolean;
  project?: Project | null;
  currentUserId?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
}

export function CreateProjectModal({
  open,
  project,
  currentUserId,
  loading = false,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", members: [] },
  });

  useEffect(() => {
    if (!open) return;

    userApi
      .listUsers()
      .then(setAvailableUsers)
      .catch(() => setAvailableUsers([]));
  }, [open]);

  useEffect(() => {
    if (open) {
      const existingMembers = project
        ? getProjectMembers(project)
            .map((m) => m.id)
            .filter((id) => id !== currentUserId)
        : [];

      setSelectedMembers(existingMembers);
      reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        members: existingMembers,
      });
    }
  }, [open, project, currentUserId, reset]);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFormSubmit = (values: ProjectFormValues) => {
    onSubmit({ ...values, members: selectedMembers });
  };

  if (!open) return null;

  const selectableUsers = availableUsers.filter((user) => user.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {project ? "Edit Project" : "Create Project"}
        </h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
          <AppInput
            label="Project Name"
            placeholder="Website Redesign"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Brief project overview..."
              {...register("description")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">Team members</p>
            <p className="text-xs text-slate-500">
              Select members who can view tasks and collaborate in real time.
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {selectableUsers.length === 0 ? (
                <p className="text-sm text-slate-400">Loading users...</p>
              ) : (
                selectableUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      {getMemberLabel(user)}{" "}
                      <span className="text-slate-400">({user.email})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <AppButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton type="submit" loading={loading}>
              {project ? "Save Changes" : "Create Project"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}
