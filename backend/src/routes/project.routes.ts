import { Router } from 'express';
import { projectController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  paginationSchema,
} from '../validators';
import taskRoutes from './task.routes';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), validate(createProjectSchema), projectController.createProject);
router.get('/', validate(paginationSchema, 'query'), projectController.getProjects);

router.use('/:projectId/tasks', taskRoutes);

router.get('/:id', validate(projectIdSchema, 'params'), projectController.getProject);
router.patch(
  '/:id',
  authorize('admin'),
  validate(projectIdSchema, 'params'),
  validate(updateProjectSchema),
  projectController.updateProject
);
router.delete(
  '/:id',
  authorize('admin'),
  validate(projectIdSchema, 'params'),
  projectController.deleteProject
);

export default router;
