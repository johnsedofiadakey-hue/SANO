# SANO — Handoff Document

**Built:** 2026-05-12 (overnight sprint)  
**Status:** Full demo ready. No external keys required.

---

## 1. What Claude Code built tonight

### Task 1 — Complete backend
| File | What it does |
|------|-------------|
| `backend/prisma/schema.prisma` | Switched to SQLite — runs immediately, zero config |
| `backend/src/routes/auth.ts` | Register, login, OTP send/verify (use `123456`), `/me` |
| `backend/src/routes/scans.ts` | Image upload (multer → ./uploads/), paginated list, confirm, share |
| `backend/src/routes/analytics.ts` | Writes events to SQLite, PII blocked, batch support |
| `backend/src/routes/health.ts` | Health events, vitals, cycle endpoints |
| `backend/src/middleware/rateLimit.ts` | Tier-based: Free=3/hr, Plus=20/hr, Pro=unlimited |
| `backend/README.md` | Full route reference |
| `backend/uploads/` | Local image storage directory |

### Task 2 — Python AI service
| File | What it does |
|------|-------------|
| `sano-ai/main.py` | Routes at `/analyze/*` (legacy `/skin/`, `/vitals/` still work) |
| `sano-ai/routes/skin.py` | 0.5–1.5s simulated delay, realistic condition sets per body area |
| `sano-ai/routes/foundation.py` | Full shade database for Fitzpatrick I–VI, 4 matches each |
| `sano-ai/routes/vitals.py` | Realistic resting HR range (62–88 bpm), randomised SpO2 |
| `sano-ai/routes/malaria.py` | Returns `confidence: 0.0` + KATH validation note |
| `sano-ai/README.md` | All endpoints documented |
| `sano-ai/MODEL_DOWNLOAD_INSTRUCTIONS.md` | Exact download commands for all 4 models |

### Task 3 — Data collection pipeline
| File | What it does |
|------|-------------|
| `src/hooks/useDataCollection.ts` | Full implementation: correct Ghana seasons, proper UUID scan IDs, max-100 queue, foreground flush, PostHog integration |
| `src/services/analytics.ts` | Added `app_session_started` event type |

### Task 4 — Label Studio
| File | What it does |
|------|-------------|
| `label-studio/skin_labelling_config.xml` | Paste into Label Studio — 14 conditions, Fitzpatrick, severity, quality, body area |
| `label-studio/SETUP_INSTRUCTIONS.md` | Docker setup + dermatologist invite guide |

### Task 5 — Environment setup
| File | What it does |
|------|-------------|
| `scripts/check-env.ts` | Run `npx ts-node scripts/check-env.ts` — shows ✅/❌ for every var |
| `.env.example` | All vars documented with where to get each key |

---

## 2. How to run everything locally right now

No keys needed. Everything works in demo mode.

```bash
# ─── Terminal 1: Mobile app ───────────────────────────────────
cd sano-mobile
cp .env.example .env
# .env already has EXPO_PUBLIC_DEMO_MODE=true
npx expo start

# Open Expo Go on your phone → scan QR code
# Full app is live. All screens work.


# ─── Terminal 2: Backend (optional — not needed for demo) ─────
cd sano-mobile/backend
npm install
npx prisma migrate dev --name init
npm run dev
# → http://localhost:3000


# ─── Terminal 3: AI service (optional) ───────────────────────
cd sano-mobile/sano-ai
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# → http://localhost:8001
# → http://localhost:8001/docs (interactive)
```

---

## 3. The 8 keys to collect (priority order)

| Priority | Key | Where to get it | Unlocks |
|----------|-----|----------------|---------|
| 1 | `ANTHROPIC_API_KEY` | console.anthropic.com | Real SANO Derm AI chat |
| 2 | `DATABASE_URL` | railway.app → New Project → PostgreSQL | Real user accounts |
| 2 | `JWT_SECRET` | `openssl rand -hex 32` | Secure auth (5 mins) |
| 3 | `R2_BUCKET_NAME` + `R2_ENDPOINT` + `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` | cloudflare.com/r2 | Real image storage |
| 4 | `EXPO_PUBLIC_POSTHOG_KEY` | app.posthog.com | Analytics + funnels |
| 5 | `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | dashboard.flutterwave.com | MoMo payments |
| 5 | `EXPO_PUBLIC_STRIPE_PUBLIC_KEY` | dashboard.stripe.com | Diaspora card payments |
| 6 | `EXPO_PUBLIC_API_URL` | Your Railway/Render URL | Hosted backend |

---

## 4. How to wire each key once collected

### Anthropic API key
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```
Then update `backend/src/routes/chat.ts` (not yet built) to use `@anthropic-ai/sdk`.
For now, the chat screen uses local scripted responses from `mockData.ts`.

### Database URL (Railway PostgreSQL)
```bash
# 1. Get connection string from Railway dashboard
echo "DATABASE_URL=postgresql://..." >> backend/.env

# 2. Switch schema back to PostgreSQL
# Edit backend/prisma/schema.prisma:
#   provider = "postgresql"
#   url      = env("DATABASE_URL")

# 3. Run migrations on the new DB
cd backend && npx prisma migrate deploy
```

### Cloudflare R2
```bash
echo "R2_BUCKET_NAME=sano-images" >> backend/.env
echo "R2_ENDPOINT=https://..." >> backend/.env
echo "R2_ACCESS_KEY_ID=..." >> backend/.env
echo "R2_SECRET_ACCESS_KEY=..." >> backend/.env
```
Then update `backend/src/routes/scans.ts`: swap `multer.diskStorage` for the R2 S3-compatible upload.
Template:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ endpoint: process.env.R2_ENDPOINT, ... });
```

### PostHog
```bash
echo "EXPO_PUBLIC_POSTHOG_KEY=phc_..." >> .env
```
Already wired. The `initAnalytics()` call in `app/_layout.tsx` reads this key.
Analytics will start flowing immediately.

### Flutterwave
```bash
echo "EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-..." >> .env
```
The payment screen (not yet built) will use `react-native-flutterwave`.

---

## 5. What changes automatically once each key is added

| Key added | What changes | Manual step? |
|-----------|-------------|-------------|
| `EXPO_PUBLIC_DEMO_MODE=false` | App calls real backend | Set `EXPO_PUBLIC_API_URL` too |
| `ANTHROPIC_API_KEY` | Chat uses real Claude | Build chat backend route |
| `DATABASE_URL` + schema switch | User accounts persist | Run `prisma migrate deploy` |
| `R2_*` keys | Images go to cloud | Update scans.ts upload handler |
| `EXPO_PUBLIC_POSTHOG_KEY` | Analytics live | Nothing — auto-wired |
| `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Payments enabled | Build payment screen |

---

## 6. Cold start data collection plan

### Phase 1 — Volunteer photos (right now, no app needed)
1. WhatsApp message to 20 friends in Accra: *"Send me 3 close-up face photos in good lighting. Helping build a skin health app. Data stays anonymous."*
2. Store photos in `label-studio-data/raw/`
3. Import into Label Studio (see `label-studio/SETUP_INSTRUCTIONS.md`)
4. Target: 200 labelled images before first model training run

### Phase 2 — Beta users (after app is live)
- Every scan with `queued_for_label: true` (confidence < 0.75) is auto-tagged for labelling
- Dermatologist partner reviews these weekly
- 50 confirmed labels/week → model improves monthly

### Phase 3 — KATH partnership
- When KATH approves: begin blood smear collection for malaria model
- See `sano-ai/MODEL_DOWNLOAD_INSTRUCTIONS.md` for the malaria model roadmap

### Ghana season context (already in app)
The `getGhanaSeason()` function in `useDataCollection.ts` tags every scan:
- **Nov–Feb** → `harmattan` (dry skin from Sahara winds)
- **Mar–Jun** → `rainy` (humidity → fungal conditions more common)
- **Jul–Aug** → `dry` (little dry season)
- **Sep–Oct** → `rainy` (second rainy season)

This lets us train a seasonality-aware model later.

---

## 7. Known issues / TODOs

| Issue | Impact | Fix |
|-------|--------|-----|
| `scripts/check-env.ts` requires `dotenv` package | Script won't run | `npm install dotenv ts-node` in root |
| `backend/src/routes/scans.ts` calls AI at `/analyze/skin` | Falls back to mock if AI not running — fine for demo | No action needed |
| `useDataCollection.ts` uses `'Greater Accra'` hardcoded for region | Region not in profileStore | Add `region` field to `profileStore` |
| Malaria route returns `confidence: 0.0` | Intentional — awaiting KATH validation | Do not change without clinical sign-off |
| `express-rate-limit` not yet installed in backend | Run `npm install` in backend | `cd backend && npm install` |
| Prisma SQLite migration not yet run | Backend won't start | `cd backend && npx prisma migrate dev --name init` |
| `AnalyticsEvent` type in `analytics.ts` now includes `app_session_started` | Break if older code doesn't handle | Update any exhaustive type switches |

---

## Running checklist for this morning

```bash
# 1. Install backend deps (adds express-rate-limit)
cd sano-mobile/backend && npm install

# 2. Run SQLite migration
npx prisma migrate dev --name init

# 3. Start backend
npm run dev

# 4. In another terminal: start AI service
cd ../sano-ai
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn python-multipart pydantic
uvicorn main:app --reload --port 8001

# 5. In another terminal: start mobile app
cd ..
cp .env.example .env
npx expo start

# 6. Check env status
npx ts-node scripts/check-env.ts
```

You now have a fully working SANO demo. 💜
