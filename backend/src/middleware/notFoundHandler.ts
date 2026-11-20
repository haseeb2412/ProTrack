import { Request, Response, NextFunction } from 'express';

// Returns a consistent response when no API route matches the request.
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

