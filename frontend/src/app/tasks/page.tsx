"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import { AppButton } from "@/components/common/AppButton";
import { TaskModal } from "@/components/task/TaskModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProject } from "@/redux/project/projectSlice";
import { fetchMyTasks, updateTask } from "@/redux/task/taskSlice";
import type { Task, User } from "@/types";
import type { TaskFormValues } from "@/validations/task";
import { buildTaskUpdatePayload } from "@/utils/taskPayload";
import { formatUserName } from "@/utils/permissions";
import { getProjectMembers } from "@/utils/projectMembers";

function TaskCardRow({
  task,
  onEdit,
}: {
  task: Task;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{task.title}</p>
          <p className="mt-1 text-xs capitalize text-slate-400">
            {task.status.replace("_", " ")} · {task.priority}
          </p>
        </div>
        <AppButton variant="secondary" onClick={() => onEdit(task)}>
          Edit
        </AppButton>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">Project</dt>
          <dd className="text-right text-slate-700">{task.projectName ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">Assignee</dt>
          <dd className="text-right text-slate-600">
            {task.assigneeUser ? formatUserName(task.assigneeUser) : "Unassigned"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">Created by</dt>
          <dd className="text-right text-slate-700">{formatUserName(task.createdByUser)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">Last updated by</dt>
          <dd className="text-right text-slate-700">
            {task.lastUpdatedByUser
              ? formatUserName(task.lastUpdatedByUser)
              : formatUserName(task.createdByUser)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { allTasks, listLoading } = useAppSelector((state) => state.task);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editMembers, setEditMembers] = useState<User[]>([]);
  const [editProjectName, setEditProjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  const handleEdit = async (task: Task) => {
    const result = await dispatch(fetchProject(task.projectId));
    if (fetchProject.fulfilled.match(result)) {
      setEditMembers(getProjectMembers(result.payload));
      setEditProjectName(result.payload.name);
    } else {
      setEditMembers([]);
      setEditProjectName(task.projectName ?? "");
    }
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleUpdate = async (values: TaskFormValues) => {
    if (!editingTask) return;
    setSubmitting(true);
    try {
      const result = await dispatch(
        updateTask({
          projectId: editingTask.projectId,
          taskId: editingTask.id,
          payload: buildTaskUpdatePayload(values),
        })
      );
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task updated");
        setModalOpen(false);
        setEditingTask(null);
      } else {
        toast.error((result.payload as string) ?? "Update failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-[20px] border border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/50 to-violet-50/50 p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tasks</h1>
          <p className="mt-2 text-sm text-slate-600">
            View and edit all tasks across your projects. Last updated shows who edited each task most recently.
          </p>
        </div>

        {listLoading && allTasks.length === 0 ? (
          <Loader label="Loading tasks..." />
        ) : allTasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Tasks from your projects will appear here."
          />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {allTasks.map((task) => (
                <TaskCardRow key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(79,70,229,0.06)] md:block">
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-slate-700">Task Name</th>
                      <th className="px-5 py-4 font-semibold text-slate-700">Project</th>
                      <th className="px-5 py-4 font-semibold text-slate-700">Assignee</th>
                      <th className="px-5 py-4 font-semibold text-slate-700">Created By</th>
                      <th className="px-5 py-4 font-semibold text-slate-700">Last Updated By</th>
                      <th className="px-5 py-4 font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-slate-100 transition hover:bg-indigo-50/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-0.5 text-xs capitalize text-slate-400">
                            {task.status.replace("_", " ")} · {task.priority}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{task.projectName ?? "—"}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {task.assigneeUser ? formatUserName(task.assigneeUser) : "Unassigned"}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {formatUserName(task.createdByUser)}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {task.lastUpdatedByUser
                            ? formatUserName(task.lastUpdatedByUser)
                            : formatUserName(task.createdByUser)}
                        </td>
                        <td className="px-5 py-4">
                          <AppButton variant="secondary" onClick={() => handleEdit(task)}>
                            Edit
                          </AppButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        projectName={editProjectName}
        members={editMembers}
        loading={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
          setEditProjectName("");
        }}
        onSubmit={handleUpdate}
      />
    </AppLayout>
  );
}
