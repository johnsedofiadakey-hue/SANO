import express from 'express';

const router = express.Router();

// ── Label queue Firestore helpers ─────────────────────────────────────────────

async function getDb() {
  const admin = require('firebase-admin');
  if (!admin.apps.length) return null;
  return admin.firestore();
}

// POST /labelling/queue — auto-called by scans route when confidence < 0.75
router.post('/queue', async (req: any, res) => {
  const { scanId, imageStoragePath, condition, confidence, skinTone, area } = req.body;

  if (!scanId || !imageStoragePath || confidence === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await getDb();
    if (!db) return res.json({ queued: false, reason: 'Firebase Admin not configured' });

    const admin = require('firebase-admin');
    await db.collection('label_queue').add({
      scanId,
      imageStoragePath,
      condition: condition ?? 'unknown',
      confidence: Number(confidence),
      skinTone: Number(skinTone ?? 5),
      area: area ?? 'face',
      status: 'pending',
      labelStudioTaskId: null,
      labeledBy: null,
      labeledAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ queued: true });
  } catch (err: any) {
    console.error('Label queue error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /labelling/queue — admin: fetch pending items
router.get('/queue', async (req: any, res) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = await getDb();
    if (!db) return res.json([]);

    const snap = await db
      .collection('label_queue')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();

    const items = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString(),
    }));

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /labelling/queue/:id — mark item as labelled (called by Label Studio webhook or sync script)
router.patch('/queue/:id', async (req: any, res) => {
  const { label, labeledBy, labelStudioTaskId } = req.body;

  if (!label) return res.status(400).json({ error: 'label required' });

  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: 'Firebase Admin not configured' });

    const admin = require('firebase-admin');
    await db.collection('label_queue').doc(req.params.id).update({
      status: 'labeled',
      label,
      labeledBy: labeledBy ?? 'label_studio',
      labelStudioTaskId: labelStudioTaskId ?? null,
      labeledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ updated: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /labelling/stats — queue counts for admin dashboard
router.get('/stats', async (req: any, res) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ pending: 0, labeled: 0, total: 0 });

    const [pending, labeled] = await Promise.all([
      db.collection('label_queue').where('status', '==', 'pending').count().get(),
      db.collection('label_queue').where('status', '==', 'labeled').count().get(),
    ]);

    res.json({
      pending: pending.data().count,
      labeled: labeled.data().count,
      total: pending.data().count + labeled.data().count,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
