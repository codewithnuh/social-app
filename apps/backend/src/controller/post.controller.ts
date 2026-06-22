import { Request, Response } from 'express';
import PostService from '../services/post.service';
import { ApiResponseUtil } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { CreatePostDTO, CommentDTO } from '@social-app/shared';

class PostController {
  // CREATE POST
  public static createPost = async (
    req: Request<{}, {}, CreatePostDTO>,
    res: Response
  ) => {
    const user = req.user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const post = await PostService.createPost({
      authorId: user.id,
      text: req.body.text,
      image: req.body.image,
    });

    return ApiResponseUtil.success(res, post, 'Post created successfully');
  };

  // FEED
  public static getFeed = async (_req: Request, res: Response) => {
    const posts = await PostService.getFeed();

    return ApiResponseUtil.success(res, posts, 'Feed fetched successfully');
  };

  // LIKE / UNLIKE
  public static toggleLike = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const postId = req.params.postId as string;

    const result = await PostService.toggleLike(postId, user.id);

    return ApiResponseUtil.success(res, result, 'Post updated successfully');
  };

  // ADD COMMENT
  public static addComment = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const postId = req.params.postId as string;

    const result = await PostService.addComment(postId, {
      userId: user.id,
      text: req.body.text,
    });

    return ApiResponseUtil.success(res, result, 'Comment added successfully');
  };

  // DELETE POST
  public static deletePost = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const postId = req.params.postId as string;

    const result = await PostService.deletePost(postId, user.id);

    return ApiResponseUtil.success(res, result, 'Post deleted successfully');
  };
}

export default PostController;
