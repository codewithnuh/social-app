import express from 'express';
import cors from 'cors';

import authRoutes from './routes/user.route';
import postRoutes from './routes/post.route';
import { globalErrorHandler } from './utils/global-error-handler';
import cookieParser from 'cookie-parser';
const app = express();

// --------------------
// Core middlewares
// --------------------
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend URL (NOT '*')
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());
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

// --------------------
// Health check
// --------------------
app.get('/health', (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    message: 'API is running',
  });
});

// --------------------
// Routes
// --------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/post', postRoutes);

// --------------------
// Global error handler (MUST be last middleware)
// --------------------
app.use(globalErrorHandler);

export default app;
