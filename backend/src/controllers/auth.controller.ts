import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { loginSchema, signupSchema } from '../utils/validation';
import prisma from '../database/prisma';

// Reads the configured JWT secret or reports a server configuration error.
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET is not configured', 500);
  return secret;
};

// Creates a token carrying the user's identity and role.
const createToken = (user: { id: string; email: string; role: string }, secret: string): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' },
  );
};

// Creates a user account and its teacher or student profile.
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = signupSchema.parse(req.body);
    if (input.role === 'SUPER_ADMIN') {
      const signupKey = process.env.SUPER_ADMIN_SIGNUP_KEY;
      if (!signupKey) {
        throw new AppError('SUPER_ADMIN_SIGNUP_KEY is not configured', 500);
      }
      if (input.signupKey !== signupKey) {
        throw new AppError('A valid super admin signup key is required', 403);
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: input.email, role: input.role },
      select: { id: true },
    });
    if (existingUser) throw new AppError('User with this email and role already exists', 409);

    const jwtSecret = getJwtSecret();
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          designation: input.role === 'STUDENT'
            ? 'Final Year Student'
            : input.role === 'TEACHER'
              ? 'Professor'
              : 'System Administrator',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          designation: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (input.role === 'TEACHER') {
        await tx.teacher.create({
          data: { userId: newUser.id, department: 'Computer Science' },
        });
      } else if (input.role === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: newUser.id,
            enrollmentId: `STU-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
          },
        });
      }

      return newUser;
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token: createToken(user, jwtSecret) },
    });
  } catch (error) {
    next(error);
  }
};

// Authenticates a user by email, password, and role.
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { email: input.email, role: input.role },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new AppError('Invalid email, password, or role', 401);
    }
    const jwtSecret = getJwtSecret();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          createdAt: user.createdAt,
          teacherProfile: user.teacherProfile,
          studentProfile: user.studentProfile,
        },
        token: createToken(user, jwtSecret),
      },
    });
  } catch (error) {
    next(error);
  }
};
