import { UserSchema } from '@social-app/shared';
import { Request, Response } from 'express';
import UserService from '../services/user.service';

import { ApiResponseUtil } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';

class UserController {
  public static async registerUser(req: Request, res: Response) {
    const parsedData = UserSchema.safeParse(req.body);
    if (!parsedData.success) {
      throw new AppError(ERRORS.VALIDATION_FAILED);
    }
    const user = await UserService.createUser(parsedData.data);
    return ApiResponseUtil.success(res, user, 'User Created Successfully');
  }
}

export default UserController;
