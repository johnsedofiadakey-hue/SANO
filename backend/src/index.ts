import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

if (process.env.NODE_ENV === 'production') {
  const criticalKeys = [
    'FIREBASE_ADMIN_SDK_JSON',
    'ANTHROPIC_API_KEY',
    'AI_SERVICE_URL',
    'AI_SERVICE_SECRET',
  ];
  const missing = criticalKeys.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing critical environment variables for production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

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
let serviceAccount;

if (firebaseAdminJson) {
  try {
    serviceAccount = JSON.parse(firebaseAdminJson);
  } catch (e: any) {
    console.error('✗ Firebase Admin JSON parse failed:', e.message);
  }
}

if (!serviceAccount) {
  const secretPath = '/etc/secrets/firebase-admin-sdk.json';
  const fs = require('fs');
  if (fs.existsSync(secretPath)) {
    try {
      const fileContent = fs.readFileSync(secretPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
    } catch (e: any) {
      console.error('✗ Firebase Admin file parse failed:', e.message);
    }
  }
}

if (serviceAccount) {
  try {
    const admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✓ Firebase Admin initialized');
  } catch (e: any) {
    console.error('✗ Firebase Admin init failed:', e.message);
  }
} else {
  console.log('⚠ Firebase Admin configuration missing — auth verification disabled');
}

const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length === 0) {
      console.warn('Firebase Admin not initialized — skipping token verification (UNSAFE)');
      return next();
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

app.get('/', (_req, res) => {
  res.json({ service: 'SANO API', status: 'running', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Dummy analytics route to prevent 404 spam from mobile app
app.post('/analytics/batch', (req, res) => {
  res.status(200).json({ status: 'ok', received: req.body.events?.length || 0 });
});

// Routes — gracefully skip if dependencies missing
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const aiRoutes = require('./routes/ai').default;
  app.use('/ai', authenticate, aiRoutes);
  console.log('✓ AI routes loaded');
} catch (e: any) {
  console.log('⚠ AI routes skipped:', e.message);
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const scanRoutes = require('./routes/scans').default;
  app.use('/scans', authenticate, scanRoutes);
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
