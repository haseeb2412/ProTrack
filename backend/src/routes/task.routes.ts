import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as taskController from '../controllers/task.controller';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);

export default router;

