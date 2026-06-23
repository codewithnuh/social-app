import { Request, Response } from 'express';
import PostService from '../services/post.service';
import { ApiResponseUtil } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { CreatePostDTO } from '@social-app/shared';
import UploadService from '../services/upload.service';

class PostController {
  // CREATE POST
  public static createPost = async (
    req: Request<{}, {}, CreatePostDTO>,
    res: Response
  ) => {
    const user = (req as any).user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    let imageUrl: string | undefined;

    // 1. if file exists → upload it
    if ((req as any).file?.path) {
      const uploadResult = await UploadService.uploadImage(
        (req as any).file.path
      );
      imageUrl = uploadResult.url;
    }

    // 2. now create post with CLEAN data
    const post = await PostService.createPost({
      authorId: user.id,
      text: req.body.text,
      image: imageUrl,
    });

    return ApiResponseUtil.success(res, post, 'Post created');
  };

  // LIKE / UNLIKE
  public static toggleLike = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const postId = req.params.postId as string;

    const result = await PostService.toggleLike(postId, user.id);

    return ApiResponseUtil.success(res, result, 'Post updated successfully');
  };
  // GET FEED
  public static getFeed = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await PostService.getFeed(userId);

    return ApiResponseUtil.success(res, result, 'Feed fetched successfully');
  };
  // ADD COMMENT
  public static addComment = async (req: Request, res: Response) => {
    const user = (req as any).user;
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
    const user = (req as any).user;
    if (!user) throw new AppError(ERRORS.UNAUTHORIZED);

    const postId = req.params.postId as string;

    const result = await PostService.deletePost(postId, user.id);

    return ApiResponseUtil.success(res, result, 'Post deleted successfully');
  };
}

export default PostController;
