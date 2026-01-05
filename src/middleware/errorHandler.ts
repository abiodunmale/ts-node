import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error (we'll improve logging next)
//   console.error(`[${req.method} ${req.path}] ${statusCode} - ${message}`);
    logger.error(err, `[${req.method} ${req.path}] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    message,
    // In production, hide stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};