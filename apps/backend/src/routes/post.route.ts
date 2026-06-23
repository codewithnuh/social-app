import { Router } from 'express';
import PostController from '../controller/post.controller';
import { asyncHandler } from '../utils/async-handler';
import { authMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = Router();
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  asyncHandler(PostController.createPost)
);

router.get('/feed', authMiddleware, asyncHandler(PostController.getFeed));

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
