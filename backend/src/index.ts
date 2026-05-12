import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check — Render uses this to confirm deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SANO API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'SANO API is running' });
});

// TODO: add routes here as Firebase is configured
// import authRoutes from './routes/auth';
// app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`SANO API running on port ${PORT}`);
});

export default app;
