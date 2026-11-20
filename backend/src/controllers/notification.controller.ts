import { Response, NextFunction } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, getAuthenticatedUser } from '../middleware/auth.middleware';

// Lists notifications belonging to the authenticated user.
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Marks one notification as read only when it belongs to the authenticated user.
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const result = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: { isRead: true },
    });
    if (result.count === 0) throw new AppError('Notification not found', 404);

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// Marks all unread notifications belonging to the authenticated user as read.
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      data: { updatedCount: result.count },
    });
  } catch (error) {
    next(error);
  }
};
