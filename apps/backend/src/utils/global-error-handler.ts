import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { ERRORS } from '../constants/errors';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // -------------------------
  // Custom AppError
  // -------------------------
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
    });
  }

  // -------------------------
  // Zod validation error
  // -------------------------
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      data: null,
      message: ERRORS.VALIDATION_FAILED.message,
      errors: err.flatten(), // cleaner + standard
    });
  }

  // -------------------------
  // Mongo duplicate key error
  // -------------------------
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 11000
  ) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      data: null,
      message: ERRORS.DUPLICATE_RESOURCE.message,
    });
  }

  // -------------------------
  // Unknown errors
  // -------------------------
  console.error('[UNHANDLED ERROR]', err);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    data: null,
    message: ERRORS.INTERNAL_SERVER_ERROR.message,
  });
};
