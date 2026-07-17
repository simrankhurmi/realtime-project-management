import { Project, Task, serializeTask } from '../models';
import { ApiError } from '../utils/ApiError';
import { getIO } from '../sockets';
import type { CreateTaskInput, UpdateTaskInput } from '../validators';

const userPopulateFields = [
  { path: 'assignee', select: 'firstName lastName email' },
  { path: 'createdBy', select: 'firstName lastName email' },
  { path: 'lastUpdatedBy', select: 'firstName lastName email' },
] as const;

export class TaskService {
  private async assertProjectAccess(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isMember =
      project.owner.toString() === userId ||
      project.members.some((member) => member.toString() === userId);

    if (!isMember) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    return project;
  }

  private emitTaskEvent(
    projectId: string,
    event: 'task:created' | 'task:updated' | 'task:moved' | 'task:deleted',
    payload: Record<string, unknown>
  ) {
    getIO().to(`project:${projectId}`).emit(event, payload);
  }

  private async populateAndSerialize(task: InstanceType<typeof Task>, projectName?: string) {
    await task.populate([...userPopulateFields]);
    if (!projectName) {
      const project = await Project.findById(task.project).select('name').lean();
      projectName = project?.name;
    }
    return serializeTask(task, projectName);
  }

  private canDeleteTask(task: InstanceType<typeof Task>, userId: string, role: string) {
    return role === 'admin' || task.createdBy.toString() === userId;
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.assertProjectAccess(projectId, userId);
    const tasks = await Task.find({ project: projectId })
      .sort({ createdAt: -1 })
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email');
    return tasks.map((task) => serializeTask(task, project.name));
  }

  async findAllForUser(userId: string) {
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select('_id name');

    if (projects.length === 0) {
      return [];
    }

    const projectMap = new Map(
      projects.map((project) => [project._id.toString(), project.name])
    );
    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .sort({ updatedAt: -1 })
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email');

    return tasks.map((task) =>
      serializeTask(task, projectMap.get(task.project.toString()))
    );
  }

  async create(projectId: string, userId: string, input: CreateTaskInput) {
    await this.assertProjectAccess(projectId, userId);

    const task = await Task.create({
      title: input.title,
      description: input.description,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      project: projectId,
      assignee: input.assigneeId && input.assigneeId !== '' ? input.assigneeId : undefined,
      createdBy: userId,
      lastUpdatedBy: userId,
    });

    const serialized = await this.populateAndSerialize(task);
    this.emitTaskEvent(projectId, 'task:created', {
      projectId,
      task: serialized,
      updatedBy: userId,
    });

    return serialized;
  }

  async update(
    projectId: string,
    taskId: string,
    userId: string,
    input: UpdateTaskInput
  ) {
    await this.assertProjectAccess(projectId, userId);

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const previousStatus = task.status;

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.assigneeId !== undefined) {
      if (input.assigneeId && input.assigneeId !== '') {
        task.assignee = input.assigneeId as never;
      } else {
        task.set('assignee', null);
      }
    }
    if (input.status !== undefined) task.status = input.status;

    task.lastUpdatedBy = userId as never;
    await task.save();

    const serialized = await this.populateAndSerialize(task);
    const event =
      input.status && input.status !== previousStatus ? 'task:moved' : 'task:updated';

    this.emitTaskEvent(projectId, event, {
      projectId,
      task: serialized,
      updatedBy: userId,
    });

    return serialized;
  }

  async delete(projectId: string, taskId: string, userId: string, role: string) {
    await this.assertProjectAccess(projectId, userId);

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    if (!this.canDeleteTask(task, userId, role)) {
      throw ApiError.forbidden('Only the task creator or admin can delete this task');
    }

    await task.deleteOne();

    this.emitTaskEvent(projectId, 'task:deleted', {
      projectId,
      taskId,
      updatedBy: userId,
    });
  }
}

export const taskService = new TaskService();
