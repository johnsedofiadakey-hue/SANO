/**
 * SANO payments — Paystack (Ghana: MoMo, Visa, Mastercard, Verve)
 *
 * SECURITY:
 *   Public key  → mobile app .env (safe to expose)
 *   Secret key  → backend Render env ONLY (never here)
 */

const PAYSTACK_READY = !!process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY;

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const SUBSCRIPTION_PLANS = {
  plus: {
    name: 'SANO Plus',
    amount: 4500,          // Paystack uses pesewas: 4500 = GHS 45.00
    currency: 'GHS',
    period: '/month',
    description: 'Glow Tracker, Cycle Calendar, Routine Builder, AI Chat',
    badge: 'Most Popular',
    features: [
      '✦ Glow Up Tracker',
      '🌙 Cycle Skin Calendar',
      '🌿 AI Routine Builder',
      '💬 Doctor Chat (3/month)',
      '👥 Community Access',
      '📊 Skin Progress Reports',
    ],
  },
  pro: {
    name: 'SANO Pro',
    amount: 15000,         // GHS 150.00
    currency: 'GHS',
    period: '/month',
    description: 'Full diagnostics + all Plus features',
    badge: 'Full Access',
    features: [
      '🔬 Malaria Screening',
      '🩸 Blood Group Detection',
      '👁 Eye Health Scan',
      '🧬 Sickle Cell Tracker',
      '🫁 TB Cough Analysis',
      '💬 Unlimited Doctor Chat',
      '✦ Everything in Plus',
    ],
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

export interface PaystackConfig {
  paystackKey: string;
  amount: number;
  billingEmail: string;
  billingName: string;
  billingMobile: string;
  currency: string;
  refNumber: string;
  onCancel: () => void;
  onSuccess: (res: { transactionRef: string }) => void;
  activityIndicatorColor: string;
  subaccount?: string;
}

/**
 * Returns Paystack config for PaystackWebView component,
 * or calls onSuccess with a demo ref if key not present.
 */
export const initiatePaystackPayment = async (
  plan: PlanKey,
  user: { email: string; phone?: string; name?: string },
  onSuccess: (reference: string) => void,
  onError: (error: string) => void,
): Promise<PaystackConfig | null> => {
  if (!PAYSTACK_READY) {
    // Demo: simulate 2-second processing, always succeeds
    await delay(2000);
    onSuccess(`demo_ref_${plan}_${Date.now()}`);
    return null;
  }

  const planData = SUBSCRIPTION_PLANS[plan];
  const refNumber = `sano_${plan}_${Date.now()}`;

  return {
    paystackKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    amount: planData.amount,
    billingEmail: user.email,
    billingName: user.name ?? '',
    billingMobile: user.phone ?? '',
    currency: planData.currency,
    refNumber,
    onCancel: () => onError('Payment cancelled'),
    onSuccess: (res) => onSuccess(res.transactionRef ?? refNumber),
    activityIndicatorColor: '#7C3AED',
  };
};

/** Legacy alias used by existing screens — keeps API surface stable */
export const initiatePayment = initiatePaystackPayment;
