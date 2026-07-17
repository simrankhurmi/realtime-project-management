import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', userController.listUsers);

export default router;
