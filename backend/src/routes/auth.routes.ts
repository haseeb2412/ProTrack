import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);

// Protected routes
// router.post('/logout', authenticate, authController.logout);
// router.get('/me', authenticate, authController.getCurrentUser);

export default router;

