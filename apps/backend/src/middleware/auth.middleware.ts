import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth/token';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { UserModel } from '../models/user';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(ERRORS.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verifyAccessToken(token);

    const user = await UserModel.findById(payload.sub).select(
      '_id name email username avatarUrl'
    );

    if (!user) {
      return next(new AppError(ERRORS.NOT_FOUND));
    }

    // attach user to request
    (req as any).user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (err) {
    return next(err);
  }
};
