import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// In-memory OTP store for dev mode (phone -> otp)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const DEV_OTP = '123456';

function hashPII(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '30d' });
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const email_hash = hashPII(email);
    const existing = await prisma.user.findUnique({ where: { email_hash } });
    if (existing) {
      res.status(409).json({ error: 'Account already exists' });
      return;
    }

    const user = await prisma.user.create({
      data: { email_hash, region: 'Unknown' },
    });

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: name ?? 'SANO User', subscription: user.subscription } });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string; password?: string };
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const email_hash = hashPII(email);
    const user = await prisma.user.findUnique({ where: { email_hash } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: 'SANO User', subscription: user.subscription } });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/otp/send — logs OTP to console in dev mode
router.post('/otp/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body as { phone: string };
    if (!phone) {
      res.status(400).json({ error: 'Phone number required' });
      return;
    }

    const otp = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : DEV_OTP;

    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // In production: send via Twilio/AfricasTalking
    // In dev: log to console
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    res.json({ ok: true, message: 'OTP sent', dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch {
    res.status(500).json({ error: 'OTP send failed' });
  }
});

// POST /auth/otp/verify
router.post('/otp/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string };
    if (!phone || !otp) {
      res.status(400).json({ error: 'Phone and OTP required' });
      return;
    }

    // Dev mode: accept "123456"
    const isDev = process.env.NODE_ENV !== 'production';
    const stored = otpStore.get(phone);
    const valid = isDev
      ? otp === DEV_OTP
      : stored && stored.otp === otp && stored.expiresAt > Date.now();

    if (!valid) {
      res.status(401).json({ error: 'Invalid or expired OTP' });
      return;
    }

    otpStore.delete(phone);

    const phone_hash = hashPII(phone);
    let user = await prisma.user.findUnique({ where: { phone_hash } });
    if (!user) {
      user = await prisma.user.create({ data: { phone_hash, region: 'Unknown' } });
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, subscription: user.subscription }, is_new: !stored });
  } catch {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        region: true,
        age_group: true,
        fitzpatrick: true,
        primary_concern: true,
        subscription: true,
        research_opt_in: true,
        created_at: true,
        _count: { select: { scans: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      ...user,
      scan_count: user._count.scans,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export { router as authRouter };
