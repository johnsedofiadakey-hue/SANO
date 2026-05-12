# SANO — Handoff Document

**Built:** 2026-05-12 (overnight sprint, two phases)
**Status:** Full demo ready. No external keys required. Firebase + Render architecture.

---

## 1. Architecture overview

```
Mobile (Expo Go)
  ├── Firebase Auth        → handles all sign-in (Google, Phone, Email)
  ├── Firestore            → all user data (scans, health events, routines)
  ├── Firebase Storage     → scan images (UUID-keyed, authenticated only)
  └── sano-api (Render)    → rate limiting + AI proxy only
        └── sano-ai (Render) → skin / foundation / vitals analysis
```

Firebase is the source of truth. The Render backend is a thin compute layer — it verifies Firebase ID tokens, enforces rate limits by tier, and proxies requests to the Python AI service. It holds no database.

---

## 2. What was built

### Mobile services (src/)
| File | What it does |
|------|-------------|
| `src/config/firebase.ts` | Firebase init with DEMO_MODE guard |
| `src/services/auth.ts` | Google, Phone OTP, Email/Password, Magic Link — all Firebase Auth |
| `src/services/firestore.ts` | All Firestore reads/writes: scans, health events, cycle logs, routines, consent, analytics |
| `src/services/storageService.ts` | Firebase Storage upload with progress, UUID-keyed filenames |
| `src/services/api.ts` | Axios with Firebase ID token interceptor |
| `src/store/authStore.ts` | Zustand: Firebase User object (no JWT) |
| `src/hooks/useDataCollection.ts` | Offline queue → Firestore flush; Ghana seasons; PostHog |

### Backend (backend/)
| File | What it does |
|------|-------------|
| `backend/src/index.ts` | Express app — only `/scans` router + health endpoints |
| `backend/src/routes/scans.ts` | POST /analyze → rate check → forward to sano-ai |
| `backend/src/middleware/auth.ts` | Firebase Admin ID token verification |
| `backend/src/middleware/rateLimit.ts` | Tier-based: free=3/hr, plus=20/hr, pro=unlimited |
| `backend/src/keepWarm.ts` | Pings own /health + sano-ai /health every 10 min in production |
| `backend/render.yaml` | Render deploy config |

### AI service (sano-ai/)
| File | What it does |
|------|-------------|
| `sano-ai/main.py` | FastAPI — routes at `/analyze/*` |
| `sano-ai/routes/skin.py` | 0.5–1.5s simulated delay, condition sets per body area |
| `sano-ai/routes/foundation.py` | Full Fitzpatrick I–VI shade DB, 4 brands, Accra availability |
| `sano-ai/routes/vitals.py` | Realistic HR range (62–88 bpm), SpO2, confidence |
| `sano-ai/routes/malaria.py` | Returns `confidence: 0.0` + KATH validation note |
| `sano-ai/render.yaml` | Render deploy config |

### Config / docs
| File | What it does |
|------|-------------|
| `firestore.rules` | Firestore security rules — users own their data, no delete on scans |
| `storage.rules` | Storage rules — auth only, max 10 MB, images only |
| `.env.example` | All vars documented |
| `FIREBASE_SETUP.md` | 7-step Firebase setup guide (~20 min) |
| `RENDER_SETUP.md` | Render deploy guide (~10 min) |
| `scripts/check-env.ts` | `npx ts-node scripts/check-env.ts` → coloured status for all vars |

---

## 3. How to run locally right now

No keys needed. Demo mode is on by default.

```bash
# Terminal 1 — Mobile app
cd sano-mobile
cp .env.example .env          # already has EXPO_PUBLIC_DEMO_MODE=true
npx expo start
# Open Expo Go on your phone → scan QR code
# Full app works. All screens. All mock data.


# Terminal 2 — Backend (optional, not needed for demo)
cd sano-mobile/backend
npm install
npm run dev
# → http://localhost:3000


# Terminal 3 — AI service (optional)
cd sano-mobile/sano-ai
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# → http://localhost:8001
# → http://localhost:8001/docs  (interactive docs)
```

---

## 4. Keys to collect (priority order)

| Priority | Key | Where to get it | Time | Unlocks |
|----------|-----|----------------|------|---------|
| **1** | Firebase project (6 vars) | console.firebase.google.com | 20 min | Real auth, real DB, real storage |
| **2** | `FIREBASE_ADMIN_SDK_JSON` | Firebase → Project settings → Service accounts | 2 min | Backend token verification |
| **3** | `ANTHROPIC_API_KEY` | console.anthropic.com | 5 min | Real AI chat |
| **4** | `EXPO_PUBLIC_POSTHOG_KEY` | app.posthog.com | 5 min | Live analytics |
| **5** | Render deploy | dashboard.render.com | 10 min | Hosted backend + AI service |
| **6** | `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | dashboard.flutterwave.com | 15 min | MoMo payments |

---

## 5. Going live — step by step

### Step 1: Firebase (20 min)
Follow `FIREBASE_SETUP.md` — creates project, enables auth, Firestore, Storage, gets Admin SDK.

```bash
# After setup, add to .env:
EXPO_PUBLIC_DEMO_MODE=            # remove or set to false
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sano-health.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sano-health
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sano-health.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_ID=123...
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

### Step 2: Deploy security rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
firebase init storage
firebase deploy --only storage
```

### Step 3: Deploy backend to Render (10 min)
Follow `RENDER_SETUP.md` — deploys Express + Python services, adds env vars, sets up keep-warm pinger.

```bash
# After Render deploy, update .env:
EXPO_PUBLIC_API_URL=https://sano-api.onrender.com
```

### Step 4: Restart and verify
```bash
npx expo start --clear
```

---

## 6. Phone auth note

Firebase phone OTP requires reCAPTCHA (browser-based). In Expo Go (managed workflow):
- Use the **test number** configured in Firebase console: `+233000000000` / code `123456`
- For real OTP in production: build a custom dev client (`expo prebuild`) and add `@react-native-firebase/auth`
- For demos/investors: **email login works perfectly with no extra setup**

---

## 7. Data collection (cold start plan)

### Phase 1 — Volunteer photos (start now, no app needed)
1. WhatsApp 20 friends in Accra: *"Send me 3 face photos in good lighting — helping build a skin health app. Anonymous."*
2. Import into Label Studio (see `label-studio/SETUP_INSTRUCTIONS.md`)
3. Target: 200 labelled images before first model training run

### Phase 2 — Beta users
- Every scan with `confidence < 0.75` is tagged `queued_for_label: true`
- Dermatologist partner reviews weekly
- 50 labels/week → model improves monthly

### Phase 3 — KATH partnership
- Malaria route returns `confidence: 0.0` until KATH clinical validation is complete
- Do not change this without clinical sign-off

### Ghana seasons (already in app)
The `getGhanaSeason()` function in `useDataCollection.ts` tags every scan:
- **Nov–Feb** → `harmattan` (dry skin, Sahara winds)
- **Mar–Jun** → `rainy` (humidity → fungal conditions)
- **Jul–Aug** → `dry` (little dry season)
- **Sep–Oct** → `rainy` (second rainy season)

---

## 8. Known issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Google sign-in requires `idToken` from expo-auth-session | Google button shows alert in Expo Go | Implement `expo-auth-session` flow or build custom dev client |
| Phone auth uses reCAPTCHA (browser-only) | OTP works only via test number in Expo Go | Use test number `+233000000000 / 123456` for demos |
| `scripts/check-env.ts` requires `dotenv` + `ts-node` | Script won't run if not installed | `npm install -D dotenv ts-node` in root |
| `useDataCollection.ts` hardcodes `'Greater Accra'` for region | Minor — region not in profileStore yet | Add `region` field to `profileStore` |
| Malaria route returns `confidence: 0.0` | Intentional — awaiting KATH | Do not change without clinical approval |
| Render free tier: 50s cold start on first request | Slow first load | Set up cron-job.org pinger (see RENDER_SETUP.md) |
