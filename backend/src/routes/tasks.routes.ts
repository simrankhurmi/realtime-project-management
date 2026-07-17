import { Router } from 'express';
import { taskController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', taskController.getMyTasks);

export default router;
