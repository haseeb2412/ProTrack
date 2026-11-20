import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../database/prisma';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().min(1, 'Designation is required'),
});

// Returns the authenticated user's profile and role-specific details.
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get user with role-specific profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: {
          include: {
            group: {
              include: {
                project: true,
                teacher: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Format response based on user role
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      createdAt: user.createdAt,
      ...(user.role === 'TEACHER' && user.teacherProfile
        ? {
          teacherProfile: {
            id: user.teacherProfile.id,
            department: user.teacherProfile.department,
          },
        }
        : {}),
      ...(user.role === 'STUDENT' && user.studentProfile
        ? {
          studentProfile: {
            id: user.studentProfile.id,
            enrollmentId: user.studentProfile.enrollmentId,
            group: user.studentProfile.group ? {
              id: user.studentProfile.group.id,
              name: user.studentProfile.group.name,
              project: {
                id: user.studentProfile.group.project.id,
                name: user.studentProfile.group.project.name,
              },
              teacher: {
                id: user.studentProfile.group.teacher.id,
                name: user.studentProfile.group.teacher.user.name,
              },
            } : null,
        },
        }
        : {}),
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData,
    });
  } catch (error) {
    return next(error);
  }
};

// Updates the authenticated user's name and designation.
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Validate input
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors,
      });
    }

    const { name, designation } = validationResult.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        designation,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        updatedAt: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

// Lists users with role-specific details for super admins.
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    // Only super admin can get all users
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.',
      });
    }

    // Get all users with their role-specific profiles
    const users = await prisma.user.findMany({
      include: {
        teacherProfile: {
          select: {
            id: true,
            department: true,
          }
        },
        studentProfile: {
          select: {
            id: true,
            enrollmentId: true,
            group: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      createdAt: user.createdAt,
      ...(user.teacherProfile ? { teacherProfile: user.teacherProfile } : {}),
      ...(user.studentProfile
        ? {
          studentProfile: {
            id: user.studentProfile.id,
            enrollmentId: user.studentProfile.enrollmentId,
            group: user.studentProfile.group
              ? {
                id: user.studentProfile.group.id,
                name: user.studentProfile.group.name,
                projectName: user.studentProfile.group.project.name,
              }
              : null,
          },
        }
        : {}),
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: formattedUsers,
    });
  } catch (error) {
    return next(error);
  }
};

// Stores an authenticated user's uploaded avatar as a data URL.
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Convert image to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: base64Image,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        updatedAt: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

