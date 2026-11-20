import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Checks whether a decoded token role is one of the application's roles.
const isUserRole = (role: unknown): role is UserRole => {
  return role === 'SUPER_ADMIN' || role === 'TEACHER' || role === 'STUDENT';
};

// Returns the authenticated user or raises an authentication error.
export const getAuthenticatedUser = (req: AuthRequest): NonNullable<AuthRequest['user']> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  return req.user;
};

// Validates the bearer token and attaches its identity to the request.
export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication token is required', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (
      typeof decoded === 'string'
      || typeof decoded.id !== 'string'
      || typeof decoded.email !== 'string'
      || !isUserRole(decoded.role)
    ) {
      throw new AppError('Invalid token', 401);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

// Allows a route only when the authenticated user's role is listed.
export const authorize = (...roles: string[]) => {
  // Rejects requests whose authenticated role is not allowed.
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

