import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { loginSchema, signupSchema } from '../utils/validation';
import prisma from '../database/prisma';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    // Check if user with same email AND role already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        role,
      },
    });

    if (existingUser) {
      return next(new AppError('User with this email and role already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine designation based on role
    const designation =
      role === 'STUDENT'
        ? 'Final Year Student'
        : role === 'TEACHER'
        ? 'Professor'
        : 'System Administrator';

    // Create user and role-specific profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          designation,
        },
      });

      // Create role-specific profile
      if (role === 'TEACHER') {
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            department: 'Computer Science', // Default, can be updated later
          },
        });
      } else if (role === 'STUDENT') {
        // Generate enrollment ID
        const year = new Date().getFullYear();
        const studentCount = await tx.student.count();
        const enrollmentId = `STU-${year}-${String(studentCount + 1).padStart(3, '0')}`;

        await tx.student.create({
          data: {
            userId: newUser.id,
            enrollmentId,
          },
        });
      }
      // SUPER_ADMIN doesn't need a separate profile

      return newUser;
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error?.code === 'P2002') {
      return next(new AppError('User with this email and role already exists', 400));
    }
    
    if (error instanceof Error && error.name === 'ZodError') {
      return next(new AppError('Invalid input data. Please check your fields.', 400));
    }
    
    // Handle other Prisma errors
    if (error?.code?.startsWith('P')) {
      return next(new AppError('Database error occurred', 500));
    }
    
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { email, password, role } = validatedData;

    // Find user with matching email and role
    const user = await prisma.user.findFirst({
      where: {
        email,
        role,
      },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return next(new AppError('Invalid email, password, or role', 401));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error?.code === 'P2002') {
      return next(new AppError('User with this email and role already exists', 400));
    }
    
    if (error instanceof Error && error.name === 'ZodError') {
      return next(new AppError('Invalid input data. Please check your fields.', 400));
    }
    
    // Handle other Prisma errors
    if (error?.code?.startsWith('P')) {
      return next(new AppError('Database error occurred', 500));
    }
    
    next(error);
  }
};

