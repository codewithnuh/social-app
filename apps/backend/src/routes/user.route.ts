// routes/user.routes.ts

import { Router } from 'express';
import UserController from '../controller/user.controller';

const router = Router();

router.post('/register', UserController.registerUser);

export default router;
