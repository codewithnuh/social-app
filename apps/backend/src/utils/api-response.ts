import type { ApiResponse } from '@social-app/shared';
import { Response } from 'express';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    } satisfies ApiResponse<T>);
  }
}
