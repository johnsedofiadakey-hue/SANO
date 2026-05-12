# SANO Demo Readiness Checklist

> Set `EXPO_PUBLIC_DEMO_MODE=true` in `.env` to enable all mock paths.

## ✅ Works Now (Zero API Keys)

| Feature | Screen | Notes |
|---|---|---|
| Onboarding flow | `/(auth)/onboarding` | Slide transitions, confetti, "Not sure?" sheet |
| Welcome / splash | `/(auth)/welcome` | Purple gradient, no external call |
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

## 🔑 Needs API Key / Backend

| Feature | What's Needed | Why |
|---|---|---|
| **Real AI skin analysis** | Google Vision or custom ML model | Camera image → condition detection |
| **SANO AI chat (Claude)** | `ANTHROPIC_API_KEY` | Full conversational AI (keyword fallback active in demo) |
| **User auth (OTP)** | Twilio or Firebase Auth | Phone number verification |
| **Scan history sync** | PostgreSQL + Node.js backend | `backend/` scaffold ready |
| **Analytics (PostHog)** | `EXPO_PUBLIC_POSTHOG_KEY` | Event tracking live (queue ready, events dropped until keyed) |
| **Push notifications (remote)** | Expo Push Token + server | Local scheduling works; server-triggered needs endpoint |
| **PDF report export** | PDF generation service | UI button present, `onPress={() => {}}` placeholder |
| **Community posts (live)** | Backend CMS or Supabase | Static mock posts shown in demo |
| **Foundation ML matcher** | Skin tone ML model | 2 s animation + mock matches shown; no real model |

---

## Environment Variables Required for Production

```bash
EXPO_PUBLIC_DEMO_MODE=false          # Set true for demo
EXPO_PUBLIC_API_URL=https://api.getsano.com
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
ANTHROPIC_API_KEY=sk-ant-...         # Backend only, never in app bundle
DATABASE_URL=postgresql://...        # Backend only
```

---

## Demo Script (5-minute walkthrough)

1. **Onboarding** — Select Fitzpatrick V, pick concerns, watch confetti
2. **Scan** — Tap FAB → mannequin → camera → processing animation → results
3. **Results** — Show severity bar, AI explanation, share to WhatsApp
4. **Routine** — Show conflict detection score live
5. **Foundation** — Tap scan, watch animation, show shade matches
6. **Chat** — Ask "What causes hyperpigmentation?" — local AI responds
7. **Heart Rate** — Tap Heart Rate card → start measurement → 30 s simulation
8. **Community** — Filter by condition, show posts
