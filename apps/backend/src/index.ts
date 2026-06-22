import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Backend server is running' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
