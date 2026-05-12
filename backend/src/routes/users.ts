import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ id: user.id, region: user.region, fitzpatrick: user.fitzpatrick, subscription: user.subscription });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fitzpatrick, region, primary_concern, research_opt_in } = req.body as Record<string, unknown>;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(fitzpatrick !== undefined && { fitzpatrick: Number(fitzpatrick) }),
        ...(region !== undefined && { region: String(region) }),
        ...(primary_concern !== undefined && { primary_concern: String(primary_concern) }),
        ...(research_opt_in !== undefined && { research_opt_in: Boolean(research_opt_in) }),
      },
    });
    res.json({ id: updated.id });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
});

export { router as usersRouter };
