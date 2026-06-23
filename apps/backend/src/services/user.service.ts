import { LoginSchema, SafeUserType, UserType } from '@social-app/shared';
import { UserModel } from '../models/user';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../utils/auth/token';
import { redis } from '../utils/auth/redis';
import { PostModel } from '../models/post';
import { Types } from 'mongoose';

class UserService {
  // CREATE USER

  public static async createUser(user: UserType): Promise<SafeUserType> {
    const { avatarUrl, email, name, password } = user;

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      throw new AppError(ERRORS.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // generate base username
    const baseUsername = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    let username = baseUsername || 'user';

    // ensure uniqueness
    let exists = await UserModel.findOne({ username });
    let counter = 1;

    while (exists) {
      username = `${baseUsername}${counter}`;
      exists = await UserModel.findOne({ username });
      counter++;
    }

    const newUser = await UserModel.create({
      avatarUrl,
      email,
      name,
      password: hashedPassword,
      username,
    });

    if (!newUser) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR);
    }

    return {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }
  public static async getUserById(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  public static async getAllUsers() {
    const users = await UserModel.find();

    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
  public static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // UPDATE PROFILE (name + avatar only)

  public static async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string }
  ) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR);
    }

    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  // LOGIN

  public static async loginUser(input: { email: string; password: string }) {
    const parsedData = LoginSchema.parse(input);
    const user = await UserModel.findOne({ email: parsedData.email });
    // Even user doesn't exist, we can still process to slow down attackers
    const DUMMY_HASH =
      '$2b$10$K8V9L6Xp6z2QzR6eR6z2QeR6z2QeR6z2QeR6z2QeR6z2QeR6z2Qe';

    const isValid = await bcrypt.compare(
      input.password,
      user ? user.password : DUMMY_HASH
    );

    if (!user || !isValid) {
      throw new AppError(ERRORS.INVALID_CREDENTIALS);
    }

    const accessToken = await generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  // LOGOUT

  public static async logout(accessToken: string) {
    const payload = await verifyAccessToken(accessToken);

    if (!payload?.jti || !payload?.exp) {
      throw new AppError(ERRORS.INVALID_TOKEN);
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = payload.exp - now;

    if (ttl > 0) {
      await redis.setex(`blacklist:${payload.jti}`, ttl, 'revoked');
    }

    return { success: true };
  }

  // REFRESH TOKEN

  public static async refresh(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload?.jti) {
      throw new AppError(ERRORS.INVALID_TOKEN);
    }

    const isRevoked = await redis.get(`refresh_blacklist:${payload.jti}`);

    if (isRevoked) {
      throw new AppError(ERRORS.TOKEN_REVOKED);
    }

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    await redis.setex(
      `refresh_blacklist:${payload.jti}`,
      7 * 24 * 60 * 60,
      'revoked'
    );

    const newAccessToken = await generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    const newRefreshToken = await generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // -------------------------
  // DELETE ACCOUNT (cascade inside posts)
  // -------------------------
  public static async deleteAccount(userId: string, accessToken: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const id = new Types.ObjectId(userId);

    await PostModel.deleteMany({ author: id });

    await PostModel.updateMany({}, { $pull: { likes: userId } });

    await PostModel.updateMany({}, { $pull: { comments: { user: userId } } });

    await UserModel.findByIdAndDelete(userId);
    const payload = await verifyAccessToken(accessToken);

    if (payload?.jti && payload?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = payload.exp - now;

      if (ttl > 0) {
        await redis.setex(`blacklist:${payload.jti}`, ttl, 'revoked');
      }
    }

    return { success: true };
  }
}

export default UserService;
