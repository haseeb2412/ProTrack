import { Prisma, TaskStatus } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, getAuthenticatedUser } from '../middleware/auth.middleware';

const taskInclude = {
  student: { include: { user: { select: { id: true, name: true, email: true } } } },
  group: { select: { id: true, name: true, teacherId: true } },
  comments: {
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

const createTaskSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  fileUrl: z.string().url().optional(),
  fileName: z.string().trim().min(1).optional(),
});

const updateTaskSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  fileUrl: z.string().url().nullable().optional(),
  fileName: z.string().trim().min(1).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required');

const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

// Restricts task queries to tasks visible to the authenticated role.
const getTaskAccessFilter = (req: AuthRequest): Prisma.TaskWhereInput => {
  const user = getAuthenticatedUser(req);
  if (user.role === 'SUPER_ADMIN') return {};
  if (user.role === 'TEACHER') {
    return { group: { teacher: { userId: user.id } } };
  }
  return { student: { userId: user.id } };
};

// Lists tasks visible to the authenticated user.
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: getTaskAccessFilter(req),
      include: taskInclude,
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ success: true, message: 'Tasks retrieved successfully', data: tasks });
  } catch (error) {
    next(error);
  }
};

// Creates a task submission for the authenticated student's group.
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'STUDENT') {
      throw new AppError('Only students can create task submissions', 403);
    }

    const input = createTaskSchema.parse(req.body);
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student?.groupId) {
      throw new AppError('You must belong to a group before creating a task', 400);
    }

    const task = await prisma.task.create({
      data: {
        ...input,
        studentId: student.id,
        groupId: student.groupId,
      },
      include: taskInclude,
    });

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    next(error);
  }
};

// Retrieves a task only when it is visible to the authenticated user.
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, ...getTaskAccessFilter(req) },
      include: taskInclude,
    });
    if (!task) throw new AppError('Task not found', 404);

    res.status(200).json({ success: true, message: 'Task retrieved successfully', data: task });
  } catch (error) {
    next(error);
  }
};

// Updates a submission or changes its review status for authorized users.
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const input = updateTaskSchema.parse(req.body);
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, ...getTaskAccessFilter(req) },
      include: { student: { select: { userId: true } } },
    });
    if (!existing) throw new AppError('Task not found', 404);

    const isStudent = user.role === 'STUDENT';
    const isAdmin = user.role === 'SUPER_ADMIN';
    const hasTaskDetails = input.name !== undefined
      || input.description !== undefined
      || input.fileUrl !== undefined
      || input.fileName !== undefined;
    if (isStudent && (existing.student.userId !== user.id || input.status)) {
      throw new AppError('Students can only edit their own task details', 403);
    }
    if (user.role === 'TEACHER' && hasTaskDetails) {
      throw new AppError('Reviewers can only update task status', 403);
    }

    const data: Prisma.TaskUpdateInput = {};
    if (isStudent || isAdmin) {
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl;
      if (input.fileName !== undefined) data.fileName = input.fileName;
      if (isStudent) data.status = TaskStatus.PENDING;
    }
    if (input.status) data.status = input.status;

    const task = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: existing.id },
        data,
        include: taskInclude,
      });

      if (input.status && input.status !== existing.status) {
        await tx.notification.create({
          data: {
            userId: existing.student.userId,
            type: 'TASK_UPDATE',
            taskId: existing.id,
            message: `Your task "${existing.name}" was marked ${input.status.toLowerCase().replace('_', ' ')}.`,
          },
        });
      }

      return updatedTask;
    });

    res.status(200).json({ success: true, message: 'Task updated successfully', data: task });
  } catch (error) {
    next(error);
  }
};

// Deletes a task owned by the student or any task as a super admin.
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, ...getTaskAccessFilter(req) },
      include: { student: { select: { userId: true } } },
    });
    if (!task) throw new AppError('Task not found', 404);
    if (req.user?.role !== 'SUPER_ADMIN' && task.student.userId !== req.user?.id) {
      throw new AppError('Only the task owner or a super admin can delete this task', 403);
    }

    await prisma.task.delete({ where: { id: task.id } });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adds feedback to a task for its assigned teacher or a super admin.
export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    if (user.role !== 'TEACHER' && user.role !== 'SUPER_ADMIN') {
      throw new AppError('Only teachers and super admins can comment on tasks', 403);
    }

    const input = commentSchema.parse(req.body);
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, ...getTaskAccessFilter(req) },
      include: { student: { select: { userId: true } } },
    });
    if (!task) throw new AppError('Task not found', 404);

    const comment = await prisma.$transaction(async (tx) => {
      const createdComment = await tx.taskComment.create({
        data: { taskId: task.id, authorId: user.id, content: input.content },
        include: { author: { select: { id: true, name: true, role: true } } },
      });

      await tx.notification.create({
        data: {
          userId: task.student.userId,
          type: 'TASK_UPDATE',
          taskId: task.id,
          message: `New feedback was added to your task "${task.name}".`,
        },
      });

      return createdComment;
    });

    res.status(201).json({ success: true, message: 'Comment added successfully', data: comment });
  } catch (error) {
    next(error);
  }
};
