import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth/token';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { UserModel } from '../models/user';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError(ERRORS.UNAUTHORIZED));
  }

  try {
    const payload = await verifyAccessToken(token);

    const user = await UserModel.findById(payload.sub).select(
      '_id name email username avatarUrl'
    );

    if (!user) {
      return next(new AppError(ERRORS.NOT_FOUND));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username || 'null',
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (err) {
    return next(new AppError(ERRORS.UNAUTHORIZED));
  }
};
