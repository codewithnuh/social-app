import { Schema, model } from 'mongoose';
import type { UserType } from '@social-app/shared';

const UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  username: String,
  password: String,
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date,
});
export const UserModel = model<UserType>('User', UserSchema);
