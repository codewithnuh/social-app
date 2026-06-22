import express from 'express';
import cors from 'cors';
import type { UserType } from '@social-app/shared';
const app = express();
const port = process.env.PORT || 3000;
const user: UserType = {
  email: 'noor',
  username: 'noor',
};
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend server is running' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
