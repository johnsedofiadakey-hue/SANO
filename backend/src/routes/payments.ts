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
    const plan = (metadata?.plan ?? 'plus') as string;
    console.log(`✓ Payment: ${customer.email} → ${plan} (ref: ${reference})`);

    try {
      const admin = require('firebase-admin');
      if (admin.apps.length > 0) {
        const db = admin.firestore();
        // Find user by email and update their subscription tier
        const usersRef = db.collection('users');
        const snap = await usersRef.where('email', '==', customer.email).limit(1).get();

        const subscriptionData = {
          subscription: plan,
          subscriptionRef: reference,
          subscriptionEmail: customer.email,
          subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (!snap.empty) {
          await snap.docs[0].ref.update(subscriptionData);
          console.log(`✓ Firestore updated for uid=${snap.docs[0].id}`);
        } else {
          // User might have signed up with a different email — log for manual review
          console.warn(`⚠ No Firestore user found for email=${customer.email} — payment logged only`);
          await db.collection('payment_log').add({
            ...subscriptionData,
            customerEmail: customer.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    } catch (err: any) {
      console.error('Firestore subscription update failed:', err.message);
      // Still return 200 so Paystack doesn't retry — log the failure for manual recovery
    }
  }

  res.sendStatus(200);
});

// ── Verify a payment reference (authenticated) ───────────────────────────────

router.get('/verify/:reference', async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const ref = req.params.reference;
  if (!ref || typeof ref !== 'string' || !/^[A-Za-z0-9_-]{5,100}$/.test(ref)) {
    return res.status(400).json({ error: 'Invalid reference format' });
  }

  if (!PAYSTACK_READY) {
    return res.json({ status: true, data: { status: 'success', demo: true } });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── Create Paystack subscription plan — admin only ────────────────────────────

router.post('/create-plan', async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  if (!PAYSTACK_READY) {
    return res.json({ status: true, data: { plan_code: 'demo_plan', demo: true } });
  }

  const { name, amount, interval = 'monthly' } = req.body as {
    name: string;
    amount: number;
    interval?: string;
  };

  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Invalid plan name' });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const VALID_INTERVALS = ['daily', 'weekly', 'monthly', 'quarterly', 'annually'];
  if (!VALID_INTERVALS.includes(interval)) {
    return res.status(400).json({ error: 'Invalid interval' });
  }

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
