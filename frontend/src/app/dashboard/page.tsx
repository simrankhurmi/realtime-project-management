"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppButton } from "@/components/common/AppButton";
import { Loader } from "@/components/common/Loader";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProjects } from "@/redux/project/projectSlice";
import { fetchMyTasks } from "@/redux/task/taskSlice";
import { StatCard } from "@/components/dashboard/StatCard";
import { ROUTES } from "@/constants/routes";
import { TaskStatus } from "@/types";

function isAssignedToUser(task: { assigneeId?: string; assigneeUser?: { id: string } }, userId?: string) {
  if (!userId) return false;
  return task.assigneeId === userId || task.assigneeUser?.id === userId;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading: projectsLoading } = useAppSelector((state) => state.project);
  const { allTasks, listLoading } = useAppSelector((state) => state.task);
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMyTasks());
  }, [dispatch]);

  const stats = useMemo(() => {
    const assignedTasks = userId
      ? allTasks.filter((task) => isAssignedToUser(task, userId)).length
      : 0;
    const completedTasks = userId
      ? allTasks.filter(
          (task) => task.status === TaskStatus.DONE && isAssignedToUser(task, userId)
        ).length
      : 0;

    return {
      totalProjects: projects.length,
      assignedTasks,
      completedTasks,
    };
  }, [allTasks, projects.length, userId]);

  const statsLoading = (projectsLoading && projects.length === 0) || (listLoading && allTasks.length === 0);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-[20px] border border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/50 to-violet-50/50 p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                Good to see you, {user?.firstName ?? "there"}!
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">PM Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Track projects, your assigned work, and completed tasks at a glance.
              </p>
            </div>
            <Link href={ROUTES.PROJECTS} className="w-full cursor-pointer sm:w-auto">
              <AppButton className="w-full sm:w-auto">Go to Projects</AppButton>
            </Link>
          </div>
        </div>

        {statsLoading ? (
          <Loader label="Loading dashboard stats..." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Projects"
              value={stats.totalProjects}
              variant="indigo"
              hint="Projects you belong to"
            />
            <StatCard
              label="Assigned Tasks"
              value={stats.assignedTasks}
              variant="sky"
              hint="Tasks assigned to you"
            />
            <StatCard
              label="Completed Tasks"
              value={stats.completedTasks}
              variant="emerald"
              hint="Your completed work"
            />
          </div>
        )}

        {projects.length > 0 && (
          <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(79,70,229,0.06)] sm:rounded-[28px] sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Your projects</h2>
            <p className="mt-1 text-sm text-slate-500">Jump straight into a project board</p>
            <ul className="mt-4 space-y-3 sm:mt-5">
              {projects.slice(0, 5).map((project) => (
                <li
                  key={project._id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <p className="text-sm text-slate-500">
                      {project.description ?? "No description"}
                    </p>
                  </div>
                  <Link href={ROUTES.PROJECT_DETAIL(project._id)} className="w-full cursor-pointer sm:w-auto">
                    <AppButton className="w-full sm:w-auto">Open Board</AppButton>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
