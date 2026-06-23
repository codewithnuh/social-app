import { UserSchema, LoginSchema } from '@social-app/shared';
import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { ApiResponseUtil } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import UploadService from '../services/upload.service';

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

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponseUtil.success(
      res,
      { user: result.user },
      'Login Successful'
    );
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  public static logoutUser = async (req: Request, res: Response) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const result = await UserService.logout(token);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return ApiResponseUtil.success(res, result, 'Logged out successfully');
  };

  // -------------------------
  // REFRESH TOKEN
  // -------------------------
  public static refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const result = await UserService.refresh(token);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponseUtil.success(res, { user: result }, 'Token refreshed');
  };

  // -------------------------
  // UPDATE PROFILE
  // -------------------------
  public static updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const user = req.user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    let avatarUrl: string | undefined;

    if (req.file?.path) {
      const uploadResult = await UploadService.uploadImage(req.file.path);
      avatarUrl = uploadResult.url;
    }

    const updatedUser = await UserService.updateProfile(user.id, {
      name: req.body.name,
      avatarUrl,
    });

    return ApiResponseUtil.success(res, updatedUser, 'Profile updated');
  };

  // -------------------------
  // ME
  // -------------------------
  public static me = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) throw new AppError(ERRORS.UNAUTHORIZED);

    const result = await UserService.getUserById(userId);

    return ApiResponseUtil.success(res, result, 'Current user');
  };

  // -------------------------
  // DELETE ACCOUNT
  // -------------------------
  public static deleteAccount = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const token = req.cookies?.accessToken;

    if (!userId || !token) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const result = await UserService.deleteAccount(userId, token);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return ApiResponseUtil.success(res, result, 'Account deleted');
  };

  // -------------------------
  // USERS
  // -------------------------
  public static getUserById = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) throw new AppError(ERRORS.UNAUTHORIZED);

    const result = await UserService.getUserById(userId);

    return ApiResponseUtil.success(res, result, 'User found');
  };

  public static getAllUsers = async (_req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    return ApiResponseUtil.success(res, result, 'Users found');
  };
}

export default UserController;
