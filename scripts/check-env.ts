#!/usr/bin/env ts-node
/**
 * SANO Environment Check
 * Run: npx ts-node scripts/check-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const LINE   = '━'.repeat(50);

interface EnvVar {
  key: string;
  description: string;
  required: boolean;
  priority: number;        // 1 = get this first
  getAt: string;           // where to obtain the key
  enablesWhat: string;     // what lights up when set
  fallback?: string;       // what happens when missing
}

const VARS: EnvVar[] = [
  {
    key: 'EXPO_PUBLIC_DEMO_MODE',
    description: 'Demo mode flag',
    required: false,
    priority: 0,
    getAt: 'Set manually in .env',
    enablesWhat: 'Full app demo without any backend',
    fallback: 'false (live mode attempted)',
  },
  {
    key: 'EXPO_PUBLIC_API_URL',
    description: 'Backend API URL',
    required: false,
    priority: 5,
    getAt: 'http://localhost:3000 for local dev',
    enablesWhat: 'Real scan upload + user accounts',
    fallback: 'Demo mode (no backend needed)',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    description: 'Claude AI key',
    required: false,
    priority: 1,
    getAt: 'console.anthropic.com',
    enablesWhat: 'Real AI chat (SANO Derm)',
    fallback: 'Local scripted responses',
  },
  {
    key: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    required: false,
    priority: 2,
    getAt: 'railway.app (free tier)',
    enablesWhat: 'Real user accounts + scan history',
    fallback: 'SQLite local dev DB',
  },
  {
    key: 'JWT_SECRET',
    description: 'JWT signing secret',
    required: false,
    priority: 2,
    getAt: 'Generate: openssl rand -hex 32',
    enablesWhat: 'Secure auth tokens',
    fallback: '"dev-secret" (never use in prod)',
  },
  {
    key: 'R2_BUCKET_NAME',
    description: 'Cloudflare R2 bucket',
    required: false,
    priority: 3,
    getAt: 'cloudflare.com/r2',
    enablesWhat: 'Real image storage',
    fallback: 'Images stored in backend/uploads/',
  },
  {
    key: 'R2_ENDPOINT',
    description: 'R2 endpoint URL',
    required: false,
    priority: 3,
    getAt: 'cloudflare.com/r2 → bucket settings',
    enablesWhat: 'R2 image uploads',
    fallback: 'Local disk storage',
  },
  {
    key: 'R2_ACCESS_KEY_ID',
    description: 'R2 access key ID',
    required: false,
    priority: 3,
    getAt: 'Cloudflare dashboard → R2 → Manage API tokens',
    enablesWhat: 'R2 authentication',
    fallback: 'Local disk storage',
  },
  {
    key: 'R2_SECRET_ACCESS_KEY',
    description: 'R2 secret key',
    required: false,
    priority: 3,
    getAt: 'Cloudflare dashboard → R2 → Manage API tokens',
    enablesWhat: 'R2 authentication',
    fallback: 'Local disk storage',
  },
  {
    key: 'EXPO_PUBLIC_POSTHOG_KEY',
    description: 'PostHog analytics key',
    required: false,
    priority: 4,
    getAt: 'app.posthog.com (free tier — 1M events/month)',
    enablesWhat: 'User analytics + funnel tracking',
    fallback: 'Analytics disabled (events queued locally)',
  },
  {
    key: 'EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY',
    description: 'Flutterwave public key',
    required: false,
    priority: 5,
    getAt: 'dashboard.flutterwave.com',
    enablesWhat: 'MoMo + card payments (Ghana)',
    fallback: 'Payments disabled',
  },
  {
    key: 'EXPO_PUBLIC_STRIPE_PUBLIC_KEY',
    description: 'Stripe publishable key',
    required: false,
    priority: 5,
    getAt: 'dashboard.stripe.com',
    enablesWhat: 'Card payments (diaspora)',
    fallback: 'Payments disabled',
  },
  {
    key: 'AI_SERVICE_URL',
    description: 'Python AI service URL',
    required: false,
    priority: 6,
    getAt: 'http://localhost:8001 when running sano-ai',
    enablesWhat: 'Real AI skin analysis',
    fallback: 'Mock scan results',
  },
];

function check(key: string): { set: boolean; value: string | undefined } {
  const value = process.env[key];
  const set = value !== undefined && value !== '' && value !== `your_${key.toLowerCase()}_here`;
  return { set, value: set ? value : undefined };
}

function tick(set: boolean): string {
  return set ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
}

console.log('');
console.log(`${BOLD}${CYAN}${LINE}${RESET}`);
console.log(`${BOLD}${CYAN}  SANO Environment Check${RESET}`);
console.log(`${BOLD}${CYAN}${LINE}${RESET}`);
console.log('');

const results = VARS.map(v => ({ ...v, ...check(v.key) }));
const setCount = results.filter(r => r.set).length;

for (const r of results) {
  const val = r.set ? `${DIM}= ${String(r.value).slice(0, 12)}...${RESET}` : `${DIM}NOT SET — ${r.fallback}${RESET}`;
  console.log(`${tick(r.set)} ${BOLD}${r.key.padEnd(38)}${RESET} ${val}`);
}

console.log('');
console.log(`${BOLD}${CYAN}${LINE}${RESET}`);

const demoMode = check('EXPO_PUBLIC_DEMO_MODE').value === 'true';
const statusLabel = demoMode ? `${GREEN}DEMO MODE ✅${RESET}` : `${YELLOW}LIVE MODE (partial config)${RESET}`;
console.log(`${BOLD}Status: ${statusLabel}`);

if (demoMode || setCount < 3) {
  console.log(`${DIM}You can demo the full app without any keys set.${RESET}`);
}

console.log(`${BOLD}${CYAN}${LINE}${RESET}`);
console.log('');

// Priority guide
const missing = results.filter(r => !r.set && r.priority > 0).sort((a, b) => a.priority - b.priority);
if (missing.length > 0) {
  console.log(`${BOLD}Next keys to add (priority order):${RESET}`);
  console.log('');
  let currentPriority = 0;
  missing.forEach((r, i) => {
    if (r.priority !== currentPriority) {
      currentPriority = r.priority;
    }
    console.log(`  ${BOLD}${i + 1}. ${r.key}${RESET}`);
    console.log(`     ${DIM}Enables: ${r.enablesWhat}${RESET}`);
    console.log(`     ${DIM}Get at:  ${r.getAt}${RESET}`);
    console.log('');
  });
}

console.log(`${BOLD}${CYAN}${LINE}${RESET}`);
console.log('');
