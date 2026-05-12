/**
 * Paystack payment routes.
 *
 * SECURITY: PAYSTACK_SECRET_KEY lives ONLY in backend/.env and
 * Render environment variables — never in any frontend file.
 */

import crypto from 'crypto';
import express from 'express';

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_READY = !!PAYSTACK_SECRET;

// ── Webhook signature verification middleware ────────────────────────────────

function verifyWebhook(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!PAYSTACK_READY) {
    return next(); // demo mode — skip verification
  }

  const sig = req.headers['x-paystack-signature'] as string;
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== sig) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
}

// ── Webhook: Paystack posts here after payment ────────────────────────────────

router.post('/webhook', verifyWebhook, async (req, res) => {
  const { event, data } = req.body as {
    event: string;
    data: {
      reference: string;
      customer: { email: string };
      metadata?: { plan?: string };
    };
  };

  if (event === 'charge.success') {
    const { reference, customer, metadata } = data;
    const plan = metadata?.plan ?? 'plus';
    console.log(`✓ Payment: ${customer.email} → ${plan} (ref: ${reference})`);

    // TODO: update Firestore subscription record
    // await firestoreAdmin.collection('users').where('email', '==', customer.email)
    //   .get().then(snap => snap.docs[0]?.ref.update({ plan, subscriptionRef: reference }));
  }

  res.sendStatus(200);
});

// ── Verify a payment reference ────────────────────────────────────────────────

router.get('/verify/:reference', async (req, res) => {
  if (!PAYSTACK_READY) {
    return res.json({ status: true, data: { status: 'success', demo: true } });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(req.params.reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── Create Paystack subscription plan (one-off setup call) ───────────────────

router.post('/create-plan', async (req, res) => {
  if (!PAYSTACK_READY) {
    return res.json({ status: true, data: { plan_code: 'demo_plan', demo: true } });
  }

  const { name, amount, interval = 'monthly' } = req.body as {
    name: string;
    amount: number;
    interval?: string;
  };

  try {
    const response = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, amount, interval, currency: 'GHS' }),
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Plan creation failed' });
  }
});

export default router;
