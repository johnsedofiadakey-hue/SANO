import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /health/event — store a health event
router.post('/event', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, value, device, confidence } = req.body as {
      type: string;
      value: Record<string, unknown>;
      device?: string;
      confidence?: number;
    };

    if (!type || value === undefined) {
      res.status(400).json({ error: 'type and value are required' });
      return;
    }

    const event = await prisma.healthEvent.create({
      data: {
        user_id: req.userId!,
        type,
        value: JSON.stringify(value),
        device: device ?? 'app',
        confidence: confidence ?? null,
      },
    });

    res.json({ id: event.id });
  } catch {
    res.status(500).json({ error: 'Failed to log health event' });
  }
});

// Alias: POST /health/events (backward compat)
router.post('/events', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, value, device, confidence } = req.body as {
      type: string;
      value: Record<string, unknown>;
      device?: string;
      confidence?: number;
    };

    const event = await prisma.healthEvent.create({
      data: {
        user_id: req.userId!,
        type,
        value: JSON.stringify(value),
        device: device ?? 'app',
        confidence: confidence ?? null,
      },
    });

    res.json({ id: event.id });
  } catch {
    res.status(500).json({ error: 'Failed to log health event' });
  }
});

// GET /health/vitals — recent heart rate, SpO2, and vitals readings
router.get('/vitals', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await prisma.healthEvent.findMany({
      where: {
        user_id: req.userId,
        type: { in: ['heart_rate', 'spo2', 'blood_pressure', 'temperature'] },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Group by type, return latest of each
    const latest: Record<string, unknown> = {};
    for (const e of events) {
      if (!latest[e.type]) {
        const parsed = JSON.parse(e.value) as Record<string, unknown>;
        latest[e.type] = { ...parsed, recorded_at: e.created_at, device: e.device, confidence: e.confidence };
      }
    }

    // Return structured vitals with mock fallback if no data yet
    res.json({
      heart_rate: latest['heart_rate'] ?? { bpm: 74, confidence: 0.89, recorded_at: null },
      spo2: latest['spo2'] ?? { percent: 97, confidence: 0.91, recorded_at: null },
      blood_pressure: latest['blood_pressure'] ?? null,
      temperature: latest['temperature'] ?? null,
      raw_recent: events.slice(0, 10),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

// GET /health/cycle — recent cycle data for the user
router.get('/cycle', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.cycleLog.findMany({
      where: { user_id: req.userId },
      orderBy: { created_at: 'desc' },
      take: 12,
    });

    const latest = logs[0] ?? null;
    const currentCycleDay = latest?.cycle_day ?? null;

    res.json({
      current_cycle_day: currentCycleDay,
      recent_logs: logs,
      cycle_count: logs.length,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycle data' });
  }
});

// GET /health/events — all recent health events
router.get('/events', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await prisma.healthEvent.findMany({
      where: { user_id: req.userId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch health events' });
  }
});

export { router as healthRouter };
