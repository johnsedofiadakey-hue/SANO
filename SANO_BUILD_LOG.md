# SANO Build Log

**Built:** 2026-05-11  
**Stack:** React Native + Expo SDK 54, TypeScript, Expo Router, Zustand, TanStack Query

---

## ✅ COMPLETED

### Phase 1 — Foundation
- [x] Project scaffolded with `create-expo-app --template blank-typescript`
- [x] All dependencies installed (expo-router, expo-camera, expo-linear-gradient, expo-notifications, expo-blur, expo-haptics, expo-image-picker, expo-constants, expo-device, expo-file-system, expo-crypto)
- [x] npm packages: zustand, @tanstack/react-query, axios, react-native-svg, react-native-reanimated, react-native-gesture-handler, @react-native-async-storage/async-storage, react-native-ble-plx, posthog-react-native, react-native-safe-area-context, @shopify/react-native-skia
- [x] Directory structure created

### Phase 2 — Design System
- [x] `src/theme/colors.ts` — Full color palette (purple, pink, semantic, text, camera)
- [x] `src/theme/typography.ts` — Font sizes 10–54, weights 400–800, text style presets
- [x] `src/theme/spacing.ts` — 4px base unit, xs–xxxl scale + radius presets
- [x] `src/theme/index.ts` — Barrel export

### Phase 3 — UI Components (11/11)
- [x] `GradientButton` — primary/outline/ghost/pink variants, animated press scale
- [x] `GradientCard` — purple→pink gradient with decorative circles
- [x] `Card` — white/tint/sand variants
- [x] `Chip` — animated on/off with interpolated color
- [x] `GradientRing` — SVG circular progress with animated gradient stroke
- [x] `SeverityBar` — animated gradient progress bar
- [x] `Avatar` — gradient background with initials or image
- [x] `BodyMannequin` — SVG tappable body zones (7 zones) with glow
- [x] `ScanResultCard` — shareable gradient card with severity ring
- [x] `TopBar` — screen header with safe area
- [x] `Divider` + `Label` — utility components

### Phase 4 — Data Layer
- [x] `src/types/scan.ts` — Scan, ScanCondition, ScanResult types
- [x] `src/types/user.ts` — User, Fitzpatrick, SkinConcern, SkinGoal
- [x] `src/types/health.ts` — HealthEvent, CycleLog, Symptom, CyclePhase
- [x] `src/store/authStore.ts` — Zustand: JWT token, user, hydrate
- [x] `src/store/scanStore.ts` — Zustand: scan history, current result, body area
- [x] `src/store/profileStore.ts` — Zustand: fitzpatrick, concerns, goal, glow score
- [x] `src/store/cycleStore.ts` — Zustand: cycle logs, phase, symptoms
- [x] `src/services/api.ts` — Axios + JWT interceptors
- [x] `src/services/auth.ts` — Login/register/Google
- [x] `src/services/scan.ts` — Upload + history
- [x] `src/services/analytics.ts` — PostHog wrapper
- [x] `src/hooks/useDataCollection.ts` — **Critical**: offline queue, SHA256 hashing, no-PII enforcement
- [x] `src/hooks/useCamera.ts` — Camera permissions + capture
- [x] `src/hooks/useScanUpload.ts` — Upload orchestration
- [x] `src/hooks/useHeartRate.ts` — PPG stub
- [x] `src/utils/logger.ts` — Dev-only console wrapper
- [x] `src/utils/gradients.ts` — Gradient presets
- [x] `src/utils/permissions.ts` — Camera/notification/media permissions

### Phase 5 — Sprint 1 Screens (6/6)
- [x] `app/_layout.tsx` — Root layout (QueryClient, SafeArea, store hydration)
- [x] `app/(tabs)/_layout.tsx` — Tab navigator with floating FAB scan button
- [x] `app/(auth)/welcome.tsx` — SANO logo, tagline, feature chips, social logins
- [x] `app/(auth)/onboarding.tsx` — 3-step: skin tone picker, concerns, goals
- [x] `app/(tabs)/index.tsx` — Home: glow score hero, cycle alert, quick actions, recent scans, tip
- [x] `app/scan/mannequin.tsx` — Body part selector with SVG mannequin
- [x] `app/scan/camera.tsx` — Full-screen camera with guide overlay, flash, capture
- [x] `app/scan/results.tsx` — Scan results: shareable card, AI explanation, what helps/avoid, Accra products

### Phase 6 — Sprint 2 Screens (5/5)
- [x] `app/features/routine.tsx` — Routine checker with conflict detection + AI analysis
- [x] `app/features/cycle.tsx` — 28-day calendar, skin forecast bars, symptom logger
- [x] `app/features/foundation.tsx` — Foundation match (Fenty, MAC, Black Opal, L'Oreal)
- [x] `app/features/chat.tsx` — AI chat with context (scan + cycle), quick replies
- [x] `app/features/dashboard.tsx` — Scan history with search, filter, family profiles
- [x] `app/features/compare.tsx` — Before/after slider with timeline bar chart

### Phase 7 — Sprint 3 Screens (4/4)
- [x] `app/(tabs)/health.tsx` — Vitals strip + diagnostics hub + hardware kit CTA
- [x] `app/(tabs)/community.tsx` — Challenge banner, glow-up post feed, filter chips
- [x] `app/(tabs)/profile.tsx` — Gradient hero, stats, subscription, settings, research opt-in
- [x] `app/features/product.tsx` — Product checker with ingredient analysis, dark skin notes

### Phase 8 — Backend (scaffold)
- [x] `backend/prisma/schema.prisma` — Full schema: User, Scan, HealthEvent, ConsentLog, Product, Routine, CycleLog
- [x] `backend/src/index.ts` — Express app with all routers
- [x] `backend/src/middleware/auth.ts` — JWT verification
- [x] `backend/src/middleware/rateLimit.ts` — 3 scans/hour free tier
- [x] `backend/src/routes/auth.ts` — Register, login (PII hashed)
- [x] `backend/src/routes/scans.ts` — Upload (AI proxy + mock fallback), history
- [x] `backend/src/routes/users.ts` — Profile CRUD
- [x] `backend/src/routes/health.ts` — Health event logging
- [x] `backend/src/routes/products.ts` — Product check
- [x] `backend/src/routes/analytics.ts` — Event ingestion (PII blocked)
- [x] `backend/package.json`

### Phase 9 — AI Service (scaffold)
- [x] `sano-ai/main.py` — FastAPI app
- [x] `sano-ai/routes/skin.py` — Mock skin analysis
- [x] `sano-ai/routes/foundation.py` — Mock foundation match
- [x] `sano-ai/routes/vitals.py` — Mock PPG heart rate
- [x] `sano-ai/routes/malaria.py` — Symptom risk scoring
- [x] `sano-ai/requirements.txt`
- [x] `sano-ai/models/README.md`

### Phase 10 — Config
- [x] `app.json` — SANO branding, purple splash, iOS/Android permissions
- [x] `.env.example` — All required env vars documented
- [x] `.gitignore` — Excludes .env, node_modules, model weights
- [x] `tsconfig.json` — Strict mode, path aliases

---

## Decisions made

1. **expo-crypto** used for SHA256 hashing instead of Node's `crypto` — runs on device, no Node dependency.
2. **Offline queue** in `useDataCollection` uses AsyncStorage with background flush — handles poor connectivity in Ghana.
3. **AI mock fallback** in scan upload route — backend returns plausible mock data when AI service unreachable, preventing UI crash.
4. **PII protection** enforced at two layers: (1) `useDataCollection` hashes image URIs and uses anon IDs, (2) analytics route rejects payloads with forbidden field names.
5. **`expo-router/entry`** used as `main` in package.json per Expo Router v3+ requirements.
6. **Tab FAB** implemented as `tabBarButton` override with `LinearGradient` — floats 18px above nav bar with purple shadow.
7. **BodyMannequin** uses TouchableOpacity wrapping SVG paths — React Native SVG doesn't natively support `onPress` on `Path`, so paths are positioned as absolute overlays.
8. **Cycle screen** calendar renders 28 days in a 7-col grid with phase-colour backgrounds and today highlighted with a ring.
9. **Before/after compare** uses `PanResponder` for the slider — avoids adding another gesture library dependency.
10. **Backend routes** scaffold only — auth + scan endpoints are functional stubs (PrismaClient + JWT), but production-ready error handling is present.

---

---

## ✅ SPRINT 2 — Infrastructure & Backend (2026-05-12)

### Task 1 — Complete backend
- [x] `backend/prisma/schema.prisma` — Switched to SQLite; added `share_count` to Scan; added `AnalyticEvent` model
- [x] `backend/src/routes/auth.ts` — OTP send/verify (dev: `123456`), GET /auth/me, password-hash login
- [x] `backend/src/routes/scans.ts` — multer file upload to `./uploads/`, paginated GET, PATCH confirm, POST share
- [x] `backend/src/routes/analytics.ts` — writes to SQLite `AnalyticEvent` table; `/event` + `/events` + `/batch`
- [x] `backend/src/routes/health.ts` — POST /health/event, GET /health/vitals, GET /health/cycle
- [x] `backend/src/middleware/rateLimit.ts` — tier-based via express-rate-limit: free=3, plus=20, pro=unlimited
- [x] `backend/package.json` — added express-rate-limit ^7.4.1
- [x] `backend/README.md` — complete route reference + Prisma commands
- [x] `backend/uploads/.gitkeep` — local image storage directory

### Task 2 — Python AI service
- [x] `sano-ai/main.py` — routes at `/analyze/*`; legacy paths preserved
- [x] `sano-ai/routes/skin.py` — 0.5–1.5s delay; per-body-area condition sets; multipart form support
- [x] `sano-ai/routes/foundation.py` — full Fitzpatrick I–VI shade DB; 4 brands; Accra store availability
- [x] `sano-ai/routes/vitals.py` — realistic resting HR (62–88 bpm), SpO2, confidence randomised
- [x] `sano-ai/routes/malaria.py` — returns negative + KATH note; awaiting clinical validation
- [x] `sano-ai/README.md` — all endpoints documented
- [x] `sano-ai/MODEL_DOWNLOAD_INSTRUCTIONS.md` — DermNet, Fitzpatrick classifier, rPPG, malaria model

### Task 3 — Data collection pipeline
- [x] `src/hooks/useDataCollection.ts` — full rewrite: EVENTS constants, correct Ghana seasons, UUID scan IDs, max-100 offline queue, foreground AppState flush, PostHog integration, `getAnonymisedUserId()`
- [x] `src/services/analytics.ts` — added `app_session_started` event type

### Task 4 — Label Studio
- [x] `label-studio/skin_labelling_config.xml` — 14 conditions, Fitzpatrick I–VI, severity 1–10, 5 quality states, 10 body areas
- [x] `label-studio/SETUP_INSTRUCTIONS.md` — Docker setup, project creation, dermatologist invite, export workflow

### Task 5 — Environment setup
- [x] `scripts/check-env.ts` — coloured ✅/❌ status for all env vars; priority guide for which keys to get first
- [x] `.env.example` — all vars documented with source URLs and explanations

### Task 6 — Handoff
- [x] `SANO_HANDOFF.md` — complete morning brief: what was built, how to run, 8 keys to collect, wiring guide, cold start plan, known issues
- [x] `DEMO_READY_CHECKLIST.md` — pre-demo checklist, demo script, talking points

---

## Decisions made (Sprint 2)

1. **SQLite for local dev**: Zero-config. `npx prisma migrate dev --name init` is the only step. Switch back to PostgreSQL by changing 2 lines in schema.prisma when Railway URL is ready.
2. **express-rate-limit with async max**: Tier limits are looked up from DB per request. Memory store for now — Redis can be swapped in by changing the `store` option.
3. **`/analyze/*` prefix for AI routes**: Matches spec. Legacy `/skin/`, `/foundation/` etc. preserved to avoid breaking existing backend calls.
4. **`share_count` on Scan model**: Added as `Int @default(0)` — incremented via Prisma's atomic `{ increment: 1 }` to avoid race conditions.
5. **`AnalyticEvent` model**: New table separate from `HealthEvent`. PII blocked at route level. Ready for batch export to training pipeline.
6. **`getGhanaSeason()` fix**: Previous impl missed March (mapped to 'dry'). Fixed: Mar–Jun rainy, Jul–Aug dry, Sep–Oct rainy, Nov–Feb harmattan.
7. **Offline queue max**: 100 events, oldest dropped first. No TTL — events survive indefinitely until flushed.
8. **Foreground flush**: `AppState.addEventListener('change')` fires `flushQueue()` on every app foreground. Handles Ghana's patchy connectivity.
9. **OTP dev stub**: Uses in-memory `Map<phone, {otp, expiresAt}>`. Dev mode always accepts `123456`. Production path scaffolded (Twilio/AfricasTalking comment).

---

## Next steps (not yet built)

- [ ] Real-time AI model integration (replace mock responses)
- [ ] Flutterwave MoMo payment flow
- [ ] Stripe payment flow (diaspora)
- [ ] Push notification scheduling (cycle reminders, scan follow-up)
- [ ] Doctor consultation booking flow
- [ ] PDF report generation
- [ ] BLE peripheral connection (SANO wristband)
- [ ] Google/Facebook OAuth implementation
- [ ] End-to-end test suite
- [ ] CI/CD pipeline (EAS Build)
