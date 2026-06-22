import { z } from 'zod';

export const UserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

export type UserType = z.infer<typeof UserSchema>;
