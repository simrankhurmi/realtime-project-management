"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createTask, moveTask } from "@/redux/task/taskSlice";
import { useSocket } from "@/hooks/useSocket";
import type { Project, Task, TaskStatus } from "@/types";
import { TASK_COLUMNS } from "@/constants/task";
import type { TaskFormValues } from "@/validations/task";
import { buildTaskPayload } from "@/utils/taskPayload";
import { AppButton } from "@/components/common/AppButton";
import { TaskColumn } from "./TaskColumn";
import { TaskModal } from "./TaskModal";
import { getProjectMembers } from "@/utils/projectMembers";

interface TaskBoardProps {
  projectId: string;
  project?: Project | null;
}

export function TaskBoard({ projectId, project }: TaskBoardProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.task.byProject[projectId] ?? []);
  const { connected } = useSocket(projectId);
  const members = getProjectMembers(project ?? null);

  const [modalOpen, setModalOpen] = useState(false);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (values: TaskFormValues) => {
    setSubmitting(true);
    try {
      const payload = buildTaskPayload(values);
      const result = await dispatch(createTask({ projectId, payload }));
      if (createTask.fulfilled.match(result)) toast.success("Task created");
      else toast.error((result.payload as string) ?? "Create failed");
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = useCallback(
    async (status: TaskStatus) => {
      if (!draggingTask || draggingTask.status === status) return;
      const result = await dispatch(
        moveTask({ projectId, taskId: draggingTask.id, status })
      );
      if (moveTask.rejected.match(result)) {
        toast.error((result.payload as string) ?? "Could not move task");
      }
      setDraggingTask(null);
    },
    [dispatch, draggingTask, projectId]
  );

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_20px_60px_rgba(79,70,229,0.08)] backdrop-blur sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-400"}`}
            />
            <p className="text-sm font-semibold text-slate-800">
              {connected ? "Live board" : "Connecting..."}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Drag tasks to update status. Edit task details from the Tasks page.
          </p>
        </div>
        <AppButton className="w-full sm:w-auto" onClick={() => setModalOpen(true)}>
          + Create Task
        </AppButton>
      </div>

      <div className="board-scroll -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {TASK_COLUMNS.map((column) => (
          <TaskColumn
            key={column.id}
            title={column.title}
            status={column.id}
            headerClass={column.headerClass}
            columnClass={column.columnClass}
            project={project}
            tasks={tasks.filter((t) => t.status === column.id)}
            onDragStart={setDraggingTask}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        members={members}
        loading={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
