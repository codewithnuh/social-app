import { Router } from 'express';
import UserController from '../controller/user.controller';
import { asyncHandler } from '../utils/async-handler';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// -------------------------
// PUBLIC ROUTES
// -------------------------
router.post('/register', asyncHandler(UserController.registerUser));

router.post('/login', asyncHandler(UserController.loginUser));

router.post('/refresh', asyncHandler(UserController.refreshToken));

// -------------------------
// PROTECTED ROUTES
// -------------------------
router.post('/logout', authMiddleware, asyncHandler(UserController.logoutUser));

router.patch(
  '/profile',
  authMiddleware,
  asyncHandler(UserController.updateProfile)
);

router.delete(
  '/delete',
  authMiddleware,
  asyncHandler(UserController.deleteAccount)
);
router.get(
  '/:userId',
  authMiddleware,
  asyncHandler(UserController.getUserById)
);
router.get('/me', authMiddleware, asyncHandler(UserController.me));
router.get('/all', authMiddleware, asyncHandler(UserController.getAllUsers));
export default router;
