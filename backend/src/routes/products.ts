import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode, name } = req.query as { barcode?: string; name?: string };

    if (!barcode && !name) {
      res.status(400).json({ error: 'Provide barcode or name' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          ...(barcode ? [{ barcode }] : []),
          ...(name ? [{ name: { contains: name, mode: 'insensitive' as const } }] : []),
        ],
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Product check failed' });
  }
});

export { router as productsRouter };
