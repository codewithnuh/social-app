import { HTTP_STATUS } from './http-status';

export const ERRORS = {
  VALIDATION_FAILED: {
    message: 'Validation failed',
    status: HTTP_STATUS.BAD_REQUEST,
  },

  USER_ALREADY_EXISTS: {
    message: 'User already exists',
    status: HTTP_STATUS.CONFLICT,
  },

  DUPLICATE_RESOURCE: {
    message: 'Resource already exists',
    status: HTTP_STATUS.CONFLICT,
  },

  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  },
} as const;
