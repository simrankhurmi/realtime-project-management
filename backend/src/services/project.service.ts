import { Project, Task, buildDefaultTaskTitle } from '../models';
import { ApiError } from '../utils/ApiError';
import type { CreateProjectInput, UpdateProjectInput, PaginationInput } from '../validators';

export class ProjectService {
  async create(ownerId: string, input: CreateProjectInput) {
    const project = await Project.create({
      ...input,
      owner: ownerId,
      members: input.members ?? [],
    });

    const defaultTitle = buildDefaultTaskTitle(input.name);
    await Task.create({
      title: defaultTitle,
      description: `Auto-created starter task for ${input.name}`,
      status: 'todo',
      priority: 'medium',
      project: project._id,
      createdBy: ownerId,
      lastUpdatedBy: ownerId,
    });

    return project.populate('owner members', 'firstName lastName email');
  }

  async findAll(userId: string, query: PaginationInput) {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      $or: [{ owner: userId }, { members: userId }],
    };

    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'firstName lastName email')
        .populate('members', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return {
      projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(projectId: string, userId: string) {
    const project = await Project.findById(projectId)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email');

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isMember =
      project.owner._id.toString() === userId ||
      project.members.some((m) => m._id.toString() === userId);

    if (!isMember) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    return project;
  }

  async update(projectId: string, userId: string, input: UpdateProjectInput) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.owner.toString() !== userId) {
      throw ApiError.forbidden('Only admin can update projects');
    }

    Object.assign(project, input);
    await project.save();

    return project.populate('owner members', 'firstName lastName email');
  }

  async delete(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.owner.toString() !== userId) {
      throw ApiError.forbidden('Only admin can delete projects');
    }

    await Task.deleteMany({ project: projectId });
    await project.deleteOne();
  }
}

export const projectService = new ProjectService();
