import { Prisma } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, getAuthenticatedUser } from '../middleware/auth.middleware';

const groupInclude = {
  project: true,
  teacher: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  students: {
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  },
};

const createGroupSchema = z.object({
  name: z.string().trim().min(1),
  project: z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }),
  teacherId: z.string().min(1),
  studentIds: z.array(z.string().min(1)).min(1).max(4),
});

const updateGroupSchema = z.object({
  name: z.string().trim().min(1).optional(),
  project: z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }).optional(),
  teacherId: z.string().min(1).optional(),
  studentIds: z.array(z.string().min(1)).min(1).max(4).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required');

// Restricts group queries to groups visible to the authenticated role.
const getGroupAccessFilter = (req: AuthRequest): Prisma.GroupWhereInput => {
  const user = getAuthenticatedUser(req);
  if (user.role === 'SUPER_ADMIN') return {};
  if (user.role === 'TEACHER') {
    return { teacher: { userId: user.id } };
  }
  return { students: { some: { userId: user.id } } };
};

// Lists groups the authenticated user is allowed to see.
export const getGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.group.findMany({
      where: getGroupAccessFilter(req),
      include: groupInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, message: 'Groups retrieved successfully', data: groups });
  } catch (error) {
    next(error);
  }
};

// Creates a project group and assigns its teacher and students.
export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new AppError('Only super admins can create groups', 403);
    }

    const input = createGroupSchema.parse(req.body);
    const group = await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({ where: { userId: input.teacherId } });
      if (!teacher) throw new AppError('Teacher not found', 404);

      const students = await tx.student.findMany({
        where: { userId: { in: input.studentIds } },
      });
      if (students.length !== input.studentIds.length) {
        throw new AppError('One or more students were not found', 404);
      }
      if (students.some((student) => student.groupId)) {
        throw new AppError('All selected students must be unassigned', 409);
      }

      const project = await tx.project.create({ data: input.project });
      return tx.group.create({
        data: {
          name: input.name,
          projectId: project.id,
          teacherId: teacher.id,
          students: { connect: students.map((student) => ({ id: student.id })) },
        },
        include: groupInclude,
      });
    });

    res.status(201).json({ success: true, message: 'Group created successfully', data: group });
  } catch (error) {
    next(error);
  }
};

// Retrieves one group if it is visible to the authenticated user.
export const getGroupById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const group = await prisma.group.findFirst({
      where: { id: req.params.id, ...getGroupAccessFilter(req) },
      include: groupInclude,
    });
    if (!group) throw new AppError('Group not found', 404);

    res.status(200).json({ success: true, message: 'Group retrieved successfully', data: group });
  } catch (error) {
    next(error);
  }
};

// Updates a group's details and optional member assignments.
export const updateGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new AppError('Only super admins can update groups', 403);
    }

    const input = updateGroupSchema.parse(req.body);
    const group = await prisma.$transaction(async (tx) => {
      const existing = await tx.group.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError('Group not found', 404);

      const data: Prisma.GroupUpdateInput = {};
      if (input.name) data.name = input.name;
      if (input.teacherId) {
        const teacher = await tx.teacher.findUnique({ where: { userId: input.teacherId } });
        if (!teacher) throw new AppError('Teacher not found', 404);
        data.teacher = { connect: { id: teacher.id } };
      }
      if (input.project) data.project = { update: input.project };

      if (input.studentIds) {
        const students = await tx.student.findMany({
          where: { userId: { in: input.studentIds } },
        });
        if (students.length !== input.studentIds.length) {
          throw new AppError('One or more students were not found', 404);
        }
        if (students.some((student) => student.groupId && student.groupId !== existing.id)) {
          throw new AppError('All selected students must be unassigned or in this group', 409);
        }

        await tx.student.updateMany({
          where: { groupId: existing.id, userId: { notIn: input.studentIds } },
          data: { groupId: null },
        });
        await tx.student.updateMany({
          where: { userId: { in: input.studentIds } },
          data: { groupId: existing.id },
        });
      }

      return tx.group.update({
        where: { id: existing.id },
        data,
        include: groupInclude,
      });
    });

    res.status(200).json({ success: true, message: 'Group updated successfully', data: group });
  } catch (error) {
    next(error);
  }
};

// Deletes a group and its related tasks according to the Prisma relations.
export const deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new AppError('Only super admins can delete groups', 403);
    }

    await prisma.group.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};
