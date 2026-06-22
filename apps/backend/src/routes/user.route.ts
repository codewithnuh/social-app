import { Router } from 'express';
import UserController from '../controller/user.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.post('/register', asyncHandler(UserController.registerUser));

router.post('/login', asyncHandler(UserController.loginUser));

router.post('/logout', asyncHandler(UserController.logoutUser));

router.post('/refresh', asyncHandler(UserController.refreshToken));

export default router;
