import { Schema, model } from 'mongoose';
import type { UserType } from '@social-app/shared';

const UserSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    avatarUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // automatically creates createdAt + updatedAt
  }
);

export const UserModel = model<UserType>('User', UserSchema);
