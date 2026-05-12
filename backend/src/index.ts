import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// Initialize Firebase Admin
const firebaseAdminJson = process.env.FIREBASE_ADMIN_SDK_JSON;
if (firebaseAdminJson) {
  try {
    const admin = require('firebase-admin');
    const serviceAccount = JSON.parse(firebaseAdminJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✓ Firebase Admin initialized');
  } catch (e: any) {
    console.error('✗ Firebase Admin init failed:', e.message);
  }
} else {
  console.log('⚠ FIREBASE_ADMIN_SDK_JSON missing — auth verification disabled');
}

app.get('/', (_req, res) => {
  res.json({ service: 'SANO API', status: 'running', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Routes — gracefully skip if dependencies missing
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const aiRoutes = require('./routes/ai').default;
  app.use('/ai', aiRoutes);
  console.log('✓ AI routes loaded');
} catch (e: any) {
  console.log('⚠ AI routes skipped:', e.message);
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const scanRoutes = require('./routes/scans').default;
  app.use('/scans', scanRoutes);
  console.log('✓ Scan routes loaded');
} catch (e: any) {
  console.log('⚠ Scan routes skipped:', e.message);
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const paymentsRoutes = require('./routes/payments').default;
  app.use('/payments', paymentsRoutes);
  console.log('✓ Payments routes loaded');
} catch (e: any) {
  console.log('⚠ Payments routes skipped:', e.message);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SANO API running on port ${PORT}`);
  console.log(`Health: http://0.0.0.0:${PORT}/health`);
});

export default app;
