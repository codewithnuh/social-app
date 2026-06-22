import { Request, Response, NextFunction } from 'express';
import z, { ZodError } from 'zod';

import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { ERRORS } from '../constants/errors';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // App errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
    });
  }

  // Zod validation
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      data: null,
      message: ERRORS.VALIDATION_FAILED.message,
      errors: z.treeifyError(err),
    });
  }

  // Mongo duplicate key
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 11000
  ) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      data: null,
      message: ERRORS.DUPLICATE_RESOURCE.message,
    });
  }

  console.error(err);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    data: null,
    message: ERRORS.INTERNAL_SERVER_ERROR.message,
  });
};
