import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, getAuthenticatedUser } from '../middleware/auth.middleware';

const createChatGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  memberIds: z.array(z.string().min(1)).max(100).default([]),
});

const messageSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

// Lists chat groups in which the authenticated user is a member.
export const getChatGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const memberships = await prisma.chatGroupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
            },
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
          },
        },
      },
      orderBy: { group: { updatedAt: 'desc' } },
    });

    res.status(200).json({
      success: true,
      message: 'Chat groups retrieved successfully',
      data: memberships.map(({ group }) => ({
        ...group,
        lastMessage: group.messages[0] ?? null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Creates a chat group and adds the creator and requested users as members.
export const createChatGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const input = createChatGroupSchema.parse(req.body);
    const memberIds = [...new Set([user.id, ...input.memberIds])];
    const users = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });
    if (users.length !== memberIds.length) {
      throw new AppError('One or more chat members were not found', 404);
    }

    const group = await prisma.chatGroup.create({
      data: {
        name: input.name,
        createdById: user.id,
        members: { create: memberIds.map((userId) => ({ userId })) },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
        },
      },
    });

    res.status(201).json({ success: true, message: 'Chat group created successfully', data: group });
  } catch (error) {
    next(error);
  }
};

// Retrieves recent messages after confirming the user belongs to the chat group.
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const membership = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.groupId, userId: user.id } },
    });
    if (!membership) throw new AppError('Chat group not found', 404);

    const messages = await prisma.message.findMany({
      where: { groupId: req.params.groupId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.status(200).json({ success: true, message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    next(error);
  }
};

// Adds a message to a group and notifies its other members.
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = getAuthenticatedUser(req);
    const input = messageSchema.parse(req.body);
    const membership = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.groupId, userId: user.id } },
      include: { group: { include: { members: { select: { userId: true } } } } },
    });
    if (!membership) throw new AppError('Chat group not found', 404);

    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          groupId: req.params.groupId,
          senderId: user.id,
          content: input.content,
        },
        include: { sender: { select: { id: true, name: true, role: true } } },
      });

      const recipients = membership.group.members
        .filter((member) => member.userId !== user.id)
        .map((member) => member.userId);

      if (recipients.length > 0) {
        await tx.notification.createMany({
          data: recipients.map((userId) => ({
            userId,
            groupId: req.params.groupId,
            type: 'MESSAGE',
            message: `${createdMessage.sender.name} sent a message in ${membership.group.name}.`,
          })),
        });
      }

      await tx.chatGroup.update({
        where: { id: req.params.groupId },
        data: { updatedAt: new Date() },
      });

      return createdMessage;
    });

    res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
  } catch (error) {
    next(error);
  }
};
