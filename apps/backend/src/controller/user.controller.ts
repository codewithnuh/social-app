import { UserSchema, LoginSchema } from '@social-app/shared';
import { Request, Response } from 'express';
import UserService from '../services/user.service';

import { ApiResponseUtil } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';

class UserController {
  // -------------------------
  // REGISTER
  // -------------------------
  public static registerUser = async (req: Request, res: Response) => {
    const parsedData = UserSchema.safeParse(req.body);

    if (!parsedData.success) {
      throw new AppError(ERRORS.VALIDATION_FAILED);
    }

    const user = await UserService.createUser(parsedData.data);

    return ApiResponseUtil.success(res, user, 'User Created Successfully');
  };

  // -------------------------
  // LOGIN
  // -------------------------
  public static loginUser = async (req: Request, res: Response) => {
    const parsedData = LoginSchema.safeParse(req.body);

    if (!parsedData.success) {
      throw new AppError(ERRORS.VALIDATION_FAILED);
    }

    const result = await UserService.loginUser(parsedData.data);

    return ApiResponseUtil.success(res, result, 'Login Successful');
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  public static logoutUser = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    const result = await UserService.logout(token);

    return ApiResponseUtil.success(res, result, 'Logged out successfully');
  };

  // -------------------------
  // REFRESH TOKEN
  // -------------------------
  public static refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const result = await UserService.refresh(refreshToken);

    return ApiResponseUtil.success(res, result, 'Token refreshed successfully');
  };

  // -------------------------
  // UPDATE PROFILE
  // -------------------------
  public static updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // from auth middleware

    if (!userId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const { name, avatarUrl } = req.body;

    const result = await UserService.updateProfile(userId, {
      name,
      avatarUrl,
    });

    return ApiResponseUtil.success(res, result, 'Profile updated successfully');
  };

  // -------------------------
  // DELETE ACCOUNT
  // -------------------------
  public static deleteAccount = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    const result = await UserService.deleteAccount(userId, token);

    return ApiResponseUtil.success(res, result, 'Account deleted successfully');
  };
  public static getUserById = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // from auth middleware

    if (!userId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const result = await UserService.getUserById(userId);

    return ApiResponseUtil.success(res, result, 'User found successfully');
  };

  public static getAllUsers = async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    return ApiResponseUtil.success(res, result, 'Users found successfully');
  };
}

export default UserController;
