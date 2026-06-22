import { Router } from 'express';
import PostController from '../controller/post.controller';
import { asyncHandler } from '../utils/async-handler';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.post('/', authMiddleware, asyncHandler(PostController.createPost));

router.get('/feed', asyncHandler(PostController.getFeed));

router.patch(
  '/:postId/like',
  authMiddleware,
  asyncHandler(PostController.toggleLike)
);

router.post(
  '/:postId/comment',
  authMiddleware,
  asyncHandler(PostController.addComment)
);

router.delete(
  '/:postId',
  authMiddleware,
  asyncHandler(PostController.deletePost)
);

export default router;
