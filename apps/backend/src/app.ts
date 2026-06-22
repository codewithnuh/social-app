import express from 'express';
import cors from 'cors';

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    message: 'API is running',
  });
});

export default app;
