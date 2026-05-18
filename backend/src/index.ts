import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

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
const ALLOWED_ORIGINS = [
  'https://getsano.com',
  'https://www.getsano.com',
  'https://sano-admin.vercel.app',
  // Expo Go / dev tunnels
  /^https?:\/\/.*\.exp\.direct$/,
  /^https?:\/\/.*\.ngrok\.io$/,
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and mobile native (no origin header)
    if (!origin) return cb(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(allowed ? null : new Error(`CORS blocked: ${origin}`), allowed);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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
      console.error('Firebase Admin not initialized — rejecting request');
      return res.status(503).json({ error: 'Service unavailable', message: 'Auth service not configured' });
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

// Protected analytics batch endpoint
app.post('/analytics/batch', authenticate, (req: any, res) => {
  const events = req.body.events || [];
  console.log(`[Analytics] Received ${events.length} events from user ${req.user?.uid || 'anonymous'}`);
  // In a real prod env, these would be streamed to BigQuery or Mixpanel here
  res.status(200).json({ status: 'ok', received: events.length });
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
  // No top-level authenticate here — /webhook is HMAC-verified; other routes
  // check req.user individually since Paystack calls webhook without a Firebase token.
  // The authenticate middleware is applied selectively via express router below.
  const paymentsAuth = (req: any, res: any, next: any) => {
    if (req.path === '/webhook') return next(); // HMAC-verified by verifyWebhook
    authenticate(req, res, next);
  };
  app.use('/payments', paymentsAuth, paymentsRoutes);
  console.log('✓ Payments routes loaded');
} catch (e: any) {
  console.log('⚠ Payments routes skipped:', e.message);
}

try {
  const labelRoutes = require('./routes/labelling').default;
  app.use('/labelling', authenticate, labelRoutes);
  console.log('✓ Labelling routes loaded');
} catch (e: any) {
  console.log('⚠ Labelling routes skipped:', e.message);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SANO API running on port ${PORT}`);
  console.log(`Health: http://0.0.0.0:${PORT}/health`);

  // Keep Render free tier awake — ping /health every 10 minutes
  if (process.env.SELF_URL) {
    setInterval(() => {
      fetch(`${process.env.SELF_URL}/health`)
        .then(() => console.log('[keep-warm] ping ok'))
        .catch(e => console.warn('[keep-warm] ping failed:', e.message));
    }, 10 * 60 * 1000);
  }
});

export default app;
