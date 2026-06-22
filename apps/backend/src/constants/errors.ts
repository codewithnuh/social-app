import { HTTP_STATUS } from './http-status';

export const ERRORS = {
  VALIDATION_FAILED: {
    message: 'Validation failed',
    status: HTTP_STATUS.BAD_REQUEST,
  },
  BAD_REQUEST: {
    message: 'Bad request',
    status: HTTP_STATUS.BAD_REQUEST,
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  UNAUTHORIZED: {
    message: 'Unauthorized access',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  TOKEN_EXPIRED: {
    message: 'Session expired. Please log in again.',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  INVALID_TOKEN: {
    message: 'Invalid token',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  TOKEN_TYPE_MISMATCH: {
    message: 'Token type mismatch',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  TOKEN_REVOKED: {
    message: 'Token has been revoked',
    status: HTTP_STATUS.UNAUTHORIZED,
  },

  NOT_FOUND: {
    message: 'Not Found',
    status: HTTP_STATUS.NOT_FOUND,
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
