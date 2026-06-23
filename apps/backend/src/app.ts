import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from './routes/user.route';
import postRoutes from './routes/post.route';
import { globalErrorHandler } from './utils/global-error-handler';
import { apiLimiter, authLimiter } from './middleware/rate-limiter.middleware';

const app = express();

// Security middlewares

app.use(helmet());
app.disable('x-powered-by');
// Core middlewares

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Safe JSON error handler

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      data: null,
      error: null,
    });
  }

  next(err);
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    message: 'API is running',
  });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/post', postRoutes);

app.use(globalErrorHandler);

export default app;
