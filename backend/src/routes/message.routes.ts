import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as messageController from '../controllers/message.controller';

const router = Router();

// All message routes require authentication
router.use(authenticate);

router.get('/groups', messageController.getChatGroups);
router.post('/groups', messageController.createChatGroup);
router.get('/groups/:groupId/messages', messageController.getMessages);
router.post('/groups/:groupId/messages', messageController.sendMessage);

export default router;

