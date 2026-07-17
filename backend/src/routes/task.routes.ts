import { Router } from 'express';
import { taskController } from '../controllers';
import { validate } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  projectIdParamSchema,
  taskIdParamSchema,
} from '../validators';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validate(projectIdParamSchema, 'params'),
  taskController.getTasks
);

router.post(
  '/',
  validate(projectIdParamSchema, 'params'),
  validate(createTaskSchema),
  taskController.createTask
);

router.patch(
  '/:taskId',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  taskController.updateTask
);

router.delete(
  '/:taskId',
  validate(taskIdParamSchema, 'params'),
  taskController.deleteTask
);

export default router;
