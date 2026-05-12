# SANO Demo Readiness Checklist

> Set `EXPO_PUBLIC_DEMO_MODE=true` in `.env` to enable all mock paths.
> Firebase is NOT initialised in demo mode — zero external calls.

---

## ✅ Works Now (Zero API Keys)

| Feature | Screen | Notes |
|---|---|---|
| Onboarding flow | `/(auth)/onboarding` | Slide transitions, confetti, "Not sure?" sheet |
| Welcome / splash | `/(auth)/welcome` | Purple gradient, phone/email/google/facebook buttons |
| Home dashboard | `/(tabs)/index` | Glow score, streak, scan history from MOCK_USER |
| Skin scan flow | `/scan/mannequin → camera → processing → results` | 3 s processing animation, mock result |
| Scan results | `/scan/results` | Condition, severity bar, what-helps/avoid, local products |
| WhatsApp share | `/scan/results` | ViewShot PNG capture + native share sheet |
| Routine checker | `/features/routine` | On-device conflict engine, live score 0–100 |
| Foundation matcher | `/features/foundation` | Idle → 2 s scan animation → shade results |
| AI chat | `/features/chat` | Keyword-matched local responses, bouncing typing dots |
| Heart rate (PPG) | `/(tabs)/health` | 30 s camera simulation, live BPM ticker |
| Cycle tracker | `/features/cycle` | Phase data, 5-day skin forecast from MOCK_CYCLE |
| Before/after compare | `/features/compare` | PanResponder slider, timeline chart |
| Community feed | `/(tabs)/community` | Posts from MOCK_COMMUNITY_POSTS, filter chips |
| My scans | `/features/dashboard` | Scan groups from MOCK_SCAN_GROUPS, search |
| Profile | `/(tabs)/profile` | Fitzpatrick type, streak, goals |
| Health hub | `/(tabs)/health` | Vitals strip from MOCK_VITALS, PPG modal |
| Local push notifications | `src/services/notifications` | Daily 8:30 AM, Sunday summary, cycle day 20, streak |
| Offline event queue | `src/hooks/useDataCollection` | SHA-256 hashed IDs, AsyncStorage queue |
| App icon + splash | `assets/` | Purple #7C3AED background, placeholder PNGs |

---

## 🔑 Needs Key / Setup

| Feature | What's Needed | Guide | Time |
|---|---|---|---|
| **Real auth** (Google, Phone, Email) | Firebase project | `FIREBASE_SETUP.md` | 20 min |
| **Real scan history** | Firestore | `FIREBASE_SETUP.md` | same |
| **Scan image upload** | Firebase Storage | `FIREBASE_SETUP.md` | same |
| **Rate-limited AI analysis** | Render backend + Firebase Admin SDK | `RENDER_SETUP.md` | 10 min |
| **Real AI skin analysis** | sano-ai on Render | `RENDER_SETUP.md` | same |
| **SANO AI chat (Claude)** | `ANTHROPIC_API_KEY` on Render backend | console.anthropic.com | 5 min |
| **Analytics (PostHog)** | `EXPO_PUBLIC_POSTHOG_KEY` | app.posthog.com | 5 min |
| **MoMo payments** | `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | dashboard.flutterwave.com | 15 min |

---

## Environment Variables — Production

```bash
# Mobile .env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sano-health.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sano-health
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sano-health.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=1:...
EXPO_PUBLIC_API_URL=https://sano-api.onrender.com
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...

# Render — sano-api env vars (never in mobile bundle)
NODE_ENV=production
FIREBASE_ADMIN_SDK_JSON={"type":"service_account",...}
RENDER_AI_URL=https://sano-ai.onrender.com
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Pre-Demo Checklist

```
□ .env has EXPO_PUBLIC_DEMO_MODE=true
□ npx expo start --clear runs without errors
□ QR code scans in Expo Go
□ Welcome screen loads (purple gradient, no crash)
□ Onboarding completes (confetti fires)
□ Home screen shows glow score + recent scans
□ Scan flow: mannequin → camera → 3s animation → results
□ Results: conditions shown, share button works
□ Routine checker: conflict score updates live
□ Foundation: animation plays → shade results shown
□ Chat: responds to "hyperpigmentation" or "sunscreen"
□ Heart rate: 30s simulation runs, BPM shown
□ Phone battery > 80%
□ Good lighting available (camera scan demo)
```

---

## Demo Script (5-minute walkthrough)

1. **Onboarding** — Select Fitzpatrick V, pick concerns (dark spots, uneven tone), watch confetti
2. **Scan** — Tap FAB → body mannequin → camera → 3s AI processing → results
3. **Results** — Show condition, severity bar, "what helps / what to avoid", Accra product picks, share to WhatsApp
4. **Routine** — Add a product, show conflict detection score dropping live
5. **Foundation** — Tap scan, watch animation, show shade matches across 4 brands with Accra store names
6. **Chat** — Ask "What's causing my hyperpigmentation?" — local AI responds with skin-aware context
7. **Heart Rate** — Tap card → start 30s measurement → live BPM ticking up
8. **Community** — Filter by "Melanin" condition, scroll posts

### Key talking points
- Works offline → important for Ghana's intermittent connectivity
- Ghana-specific: Accra product recommendations, MoMo payments, harmattan season tracking
- Privacy by design: no PII in analytics, scan images stored under random UUIDs, consent log is immutable
- Firebase handles 500k MAU on free tier before billing starts
- AI stubs are realistic — same response shape as real models — swappable without UI changes
