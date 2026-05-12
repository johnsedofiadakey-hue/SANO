import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { scanRateLimit } from '../middleware/rateLimit';

const router = Router();
const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8001';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `scan_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

const MOCK_RESULT = {
  conditions: [
    { name: 'hyperpigmentation', location: 'jawline', severity: 0.62, confidence: 0.88, doctor_confirmed: false },
    { name: 'acne_marks', location: 'cheeks', severity: 0.28, confidence: 0.79, doctor_confirmed: false },
  ],
  skin_tone: 5,
  model_version: 'v0.1-mock',
  processing_time_ms: 312,
};

// POST /scans/upload — multipart image, store locally, return AI or mock result
router.post('/upload', authMiddleware, scanRateLimit, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body_area = (req.body?.body_area as string | undefined) ?? 'face';
    const imageKey = req.file?.filename ?? `scan_${Date.now()}`;

    // Try AI service, fall back to mock
    const aiResult = await fetch(`${AI_SERVICE_URL}/analyze/skin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body_area, image_base64: null }),
      signal: AbortSignal.timeout(5000),
    })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    const result = aiResult ?? { ...MOCK_RESULT, scan_id: crypto.randomUUID() };

    if (req.userId) {
      const scan = await prisma.scan.create({
        data: {
          user_id: req.userId,
          image_key: imageKey,
          skin_tone: result.skin_tone,
          conditions: JSON.stringify(result.conditions),
          model_version: result.model_version,
          region: req.body?.region ?? null,
        },
      });
      result.scan_id = scan.id;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Scan processing failed' });
  }
});

// GET /scans — paginated list for current user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string ?? '1'));
    const limit = Math.min(50, parseInt(req.query.limit as string ?? '20'));
    const skip = (page - 1) * limit;

    const [rawScans, total] = await Promise.all([
      prisma.scan.findMany({
        where: { user_id: req.userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scan.count({ where: { user_id: req.userId } }),
    ]);

    const scans = rawScans.map(s => ({
      ...s,
      conditions: JSON.parse(s.conditions),
      products_in_use: JSON.parse(s.products_in_use),
    }));

    res.json({ scans, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

// GET /scans/:id — single scan (must belong to user)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scan = await prisma.scan.findFirst({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }
    res.json({
      ...scan,
      conditions: JSON.parse(scan.conditions),
      products_in_use: JSON.parse(scan.products_in_use),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

// PATCH /scans/:id/confirm — doctor marks scan as confirmed
router.patch('/:id/confirm', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scan = await prisma.scan.findFirst({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    const updated = await prisma.scan.update({
      where: { id: req.params.id },
      data: { doctor_confirmed: true },
    });

    res.json({ ok: true, scan: updated });
  } catch {
    res.status(500).json({ error: 'Failed to confirm scan' });
  }
});

// POST /scans/:id/share — increment share count
router.post('/:id/share', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scan = await prisma.scan.findFirst({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    const updated = await prisma.scan.update({
      where: { id: req.params.id },
      data: { share_count: { increment: 1 } },
    });

    res.json({ ok: true, share_count: updated.share_count });
  } catch {
    res.status(500).json({ error: 'Failed to log share' });
  }
});

export { router as scansRouter };
