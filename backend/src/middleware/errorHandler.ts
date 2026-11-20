import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Converts application, validation, upload, and database errors to API responses.
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Invalid request data';
    details = error.flatten();
  } else if (error instanceof MulterError) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file exceeds the 5 MB limit' : error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'A record with these values already exists';
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record was not found';
    } else if (error.code === 'P2003') {
      statusCode = 400;
      message = 'The request references a record that does not exist';
    }
  } else if (error instanceof Error && error.message === 'Only image files are allowed') {
    statusCode = 400;
    message = error.message;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details !== undefined ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && error.stack
        ? { stack: error.stack }
        : {}),
    },
  });
};
