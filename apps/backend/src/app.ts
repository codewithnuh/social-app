import express from 'express';
import cors from 'cors';

import userRoutes from './routes/user.route';
import { globalErrorHandler } from './utils/global-error-handler';

const app = express();

// --------------------
// Core middlewares
// --------------------
app.use(cors());
app.use(express.json());
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
app.use('/api/v1/users', userRoutes);

// --------------------
// Global error handler (MUST be last middleware)
// --------------------
app.use(globalErrorHandler);

export default app;
