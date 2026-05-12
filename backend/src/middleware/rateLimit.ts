import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const TIER_LIMITS: Record<string, number> = {
  free: 3,
  plus: 20,
  pro: 10_000, // effectively unlimited
  glow: 20,    // alias used in mobile types
};

async function getTierLimit(userId: string | undefined): Promise<number> {
  if (!userId) return TIER_LIMITS.free;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true },
    });
    const tier = user?.subscription ?? 'free';
    return TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  } catch {
    return TIER_LIMITS.free;
  }
}

export const scanRateLimit = rateLimit({
  windowMs: WINDOW_MS,

  // Dynamic limit based on subscription tier
  max: async (req: Request): Promise<number> => {
    const authReq = req as AuthRequest;
    return getTierLimit(authReq.userId);
  },

  // Key per user (not IP) so limits are user-scoped
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthRequest;
    return authReq.userId ?? req.ip ?? 'anonymous';
  },

  standardHeaders: true,
  legacyHeaders: false,

  handler: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const limit = await getTierLimit(authReq.userId);
    const tierName = limit >= 10_000 ? 'Pro' : limit >= 20 ? 'Plus' : 'Free';

    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `${tierName} plan allows ${limit >= 10_000 ? 'unlimited' : limit} scans per hour. Upgrade for more scans.`,
      reset_at: new Date(Date.now() + WINDOW_MS).toISOString(),
    });
  },
});
