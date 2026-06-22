import { SafeUserType, UserType } from '@social-app/shared';
import { UserModel } from '../models/user';
import bcrypt from 'bcrypt';
import id from 'zod/v4/locales/id.js';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { ERRORS } from '../constants/errors';

class UserService {
  public static async createUser(user: UserType): Promise<SafeUserType> {
    const { avatarUrl, email, name, password, username } = user;
    const userExists = await UserModel.findOne({
      email,
    });
    if (userExists) {
      throw new AppError(ERRORS.USER_ALREADY_EXISTS);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      avatarUrl,
      email,
      name,
      password: hashedPassword,
      username,
    });
    if (!newUser) throw new Error('Failed To created new user');

    return {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.email,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }
}
export default UserService;
