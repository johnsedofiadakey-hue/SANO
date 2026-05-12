import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth';
import { scansRouter } from './routes/scans';
import { usersRouter } from './routes/users';
import { healthRouter } from './routes/health';
import { productsRouter } from './routes/products';
import { analyticsRouter } from './routes/analytics';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/auth', authRouter);
app.use('/scans', scansRouter);
app.use('/users', usersRouter);
app.use('/health', healthRouter);
app.use('/products', productsRouter);
app.use('/analytics', analyticsRouter);

app.get('/healthz', (_, res) => res.json({ status: 'ok', service: 'sano-backend' }));

app.listen(PORT, () => {
  console.log(`SANO backend running on port ${PORT}`);
});

export default app;
