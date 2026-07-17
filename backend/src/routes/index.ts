import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import userRoutes from './user.routes';
import tasksRoutes from './tasks.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', tasksRoutes);
router.use('/projects', projectRoutes);

export default router;
