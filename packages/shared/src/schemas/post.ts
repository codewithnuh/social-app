import * as z from 'zod';
export const CommentSchema = z.object({
  user: z.string(), // ObjectId
  text: z.string(),
  createdAt: z.date().optional(), // can be omitted on create
});
export const PostSchema = z.object({
  _id: z.string().optional(),
  author: z.string(),
  text: z.string().optional(),
  image: z.string().optional(),

  likes: z.array(z.string()).default([]),

  comments: z.array(CommentSchema).default([]),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PostType = z.infer<typeof PostSchema>;
