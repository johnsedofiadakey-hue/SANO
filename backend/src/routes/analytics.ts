import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const FORBIDDEN_FIELDS = ['email', 'phone', 'name', 'address', 'location_precise'];

async function storeEvent(type: string, payload: Record<string, unknown>, queued_at?: string) {
  const hasPII = FORBIDDEN_FIELDS.some(k => k in payload);
  if (hasPII) throw new Error('PII detected');

  await prisma.analyticEvent.create({
    data: { event_type: type, payload: JSON.stringify(payload), queued_at: queued_at ?? null },
  });

  if (type === 'scan_data') {
    // TODO: enqueue to training pipeline (SQS / Pub-Sub) when available
  }
}

// POST /analytics/event (singular — spec)
router.post('/event', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, payload, queued_at } = req.body as {
      type: string;
      payload: Record<string, unknown>;
      queued_at?: string;
    };

    await storeEvent(type, payload ?? {}, queued_at);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'PII detected') {
      res.status(400).json({ error: 'PII detected in event payload' });
      return;
    }
    res.status(500).json({ error: 'Event logging failed' });
  }
});

// POST /analytics/events (plural — frontend compat)
router.post('/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, payload, queued_at } = req.body as {
      type: string;
      payload: Record<string, unknown>;
      queued_at?: string;
    };

    await storeEvent(type, payload ?? {}, queued_at);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'PII detected') {
      res.status(400).json({ error: 'PII detected in event payload' });
      return;
    }
    res.status(500).json({ error: 'Event logging failed' });
  }
});

// POST /analytics/batch — accept array of events
router.post('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const events = req.body as Array<{ type: string; payload: Record<string, unknown>; queued_at?: string }>;
    if (!Array.isArray(events)) {
      res.status(400).json({ error: 'Expected array of events' });
      return;
    }

    const results = await Promise.allSettled(
      events.map(e => storeEvent(e.type, e.payload ?? {}, e.queued_at))
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    res.json({ ok: true, stored: results.length - failed, failed });
  } catch {
    res.status(500).json({ error: 'Batch event logging failed' });
  }
});

export { router as analyticsRouter };
