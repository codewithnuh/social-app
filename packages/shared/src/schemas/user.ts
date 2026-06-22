import * as z from 'zod';

export const UserSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(3),
  email: z.email({
    error: issue =>
      issue.input === undefined ? 'Email is required.' : 'Invalid email',
  }),
  username: z.string().min(3),
  password: z.string().min(8),
  avatarUrl: z.url().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
export type SafeUserType = Omit<UserType, 'password'>;
