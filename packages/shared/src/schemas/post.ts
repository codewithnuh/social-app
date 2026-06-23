import * as z from 'zod';

// COMMENT

export const CommentSchema = z.object({
  user: z.string(), // ObjectId
  text: z.string(),
  createdAt: z.date().optional(),
});

export type CommentDTO = {
  text: string;
};

// CREATE POST (API INPUT)

export const CreatePostSchema = z.object({
  text: z.string().optional(),
  image: z.string().optional(),
});

export type CreatePostDTO = z.infer<typeof CreatePostSchema>;

// POST (DB / API OUTPUT)

export const PostSchema = z.object({
  id: z.string().optional(),
  author: z.string(),

  text: z.string().optional(),
  image: z.string().optional(),

  likes: z.array(z.string()).default([]),

  comments: z.array(CommentSchema).default([]),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PostType = z.infer<typeof PostSchema>;
