import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  lastUpdatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);

function serializeUser(user: unknown) {
  if (!user || typeof user !== 'object' || !('_id' in user)) return undefined;
  const doc = user as { _id: Types.ObjectId; firstName: string; lastName: string; email: string };
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
  };
}

export function serializeTask(task: ITask, projectName?: string) {
  const assigneeDoc = task.assignee as unknown;
  const createdByDoc = task.createdBy as unknown;
  const lastUpdatedByDoc = task.lastUpdatedBy as unknown;

  const assigneeId =
    assigneeDoc && typeof assigneeDoc === 'object' && '_id' in assigneeDoc
      ? (assigneeDoc as { _id: Types.ObjectId })._id.toString()
      : task.assignee
        ? task.assignee.toString()
        : undefined;

  const createdBy =
    createdByDoc && typeof createdByDoc === 'object' && '_id' in createdByDoc
      ? (createdByDoc as { _id: Types.ObjectId })._id.toString()
      : task.createdBy.toString();

  const lastUpdatedBy =
    lastUpdatedByDoc && typeof lastUpdatedByDoc === 'object' && '_id' in lastUpdatedByDoc
      ? (lastUpdatedByDoc as { _id: Types.ObjectId })._id.toString()
      : task.lastUpdatedBy?.toString();

  return {
    id: task._id.toString(),
    projectId: task.project.toString(),
    projectName,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId,
    createdBy,
    lastUpdatedBy,
    createdByUser: serializeUser(createdByDoc),
    assigneeUser: assigneeId ? serializeUser(assigneeDoc) : undefined,
    lastUpdatedByUser: serializeUser(lastUpdatedByDoc),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function buildDefaultTaskTitle(projectName: string) {
  const slug = projectName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  return `Task_${slug || 'Project'}`;
}
