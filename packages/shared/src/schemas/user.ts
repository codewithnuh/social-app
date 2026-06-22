import * as z from 'zod';

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().min(3),
  email: z.email({
    error: issue =>
      issue.input === undefined ? 'Email is required.' : 'Invalid email',
  }),
  username: z.string().min(3),
  password: z.string().min(8),
  avatarUrl: z.url(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserType = z.infer<typeof UserSchema>;
