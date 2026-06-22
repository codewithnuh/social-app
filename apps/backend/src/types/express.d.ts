// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        username: string;
        avatarUrl?: string;
      };
    }
  }
}
