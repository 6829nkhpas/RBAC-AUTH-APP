import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle SQLite/Prisma Unique constraint errors
  if (err.message && err.message.includes('Unique constraint failed')) {
    return ApiResponse.error(res, 'A record with this unique value already exists.', 400);
  }

  // Default Fallback for Server Errors
  const isProduction = process.env.NODE_ENV === 'production';
  return ApiResponse.error(
    res,
    isProduction ? 'Internal Server Error' : err.message,
    500
  );
};
