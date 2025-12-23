import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as groupController from '../controllers/group.controller';

const router = Router();

// All group routes require authentication
router.use(authenticate);

router.get('/', groupController.getGroups);
router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

export default router;

