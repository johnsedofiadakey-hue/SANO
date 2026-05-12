# SANO — Viewing Status

**Date:** 2026-05-12  
**Expo SDK:** 55.0.23  
**Status:** Ready to run on device

---

## To see the app RIGHT NOW

```bash
cd /Users/truth/Developer/SANO/sano-mobile
npx expo start --clear
```

Then:
- Press `i` → opens iOS Simulator (fastest)
- Scan QR with Expo Go on your phone

---

## ✅ What works in demo mode

All screens load with realistic Ghanaian demo data. No API keys required.

| Screen | Status | Notes |
|--------|--------|-------|
| Welcome / splash | ✅ | Logo, 4 login buttons, gradient |
| Onboarding | ✅ | Skin tone picker, confetti animation |
| Home | ✅ | "Good morning, Abena", glow score 74, quick actions |
| Scan (mannequin) | ✅ | SVG body, tap to select zone |
| Scan (camera) | ✅ | Camera opens, capture button, guide overlay |
| Scan (results) | ✅ | Condition card, severity bar, products, share |
| Routine checker | ✅ | 5 steps, conflict detection, score 0–100 |
| Foundation match | ✅ | Shade animation, 4 brands, Accra stores |
| AI chat | ✅ | Keyword responses, typing animation |
| Cycle tracker | ✅ | 28-day calendar, skin forecast |
| Before/after compare | ✅ | Slider comparison |
| Community feed | ✅ | Posts, filter chips, challenge banner |
| Scan history | ✅ | Grouped scans, search |
| Health hub | ✅ | Vitals grid, PPG heart rate simulation |
| Profile | ✅ | Fitzpatrick type, stats, log out |

---

## ⚠️ Known limitations in demo mode

| Limitation | Reason | Production fix |
|-----------|--------|---------------|
| Login buttons don't auth | DEMO_MODE=true bypasses Firebase | Set up Firebase (20 min, see FIREBASE_SETUP.md) |
| Camera scan sends mock result | No real AI model | Real AI via sano-ai on Render |
| Scans don't persist across sessions | No Firestore | Enable Firebase (same setup) |
| Google sign-in shows alert | Needs expo-auth-session + Google credentials | Will implement with Firebase setup |
| Phone OTP not working | Needs Firebase + custom dev client | Use email login for demo |

---

## Package alignment status (Expo SDK 55)

| Package | Status |
|---------|--------|
| expo | ✅ 55.0.23 |
| expo-router | ✅ 55.0.14 |
| react-native | ✅ 0.83.6 |
| react | ✅ 19.2.0 |
| All expo-* packages | ✅ 55.x |
| @shopify/react-native-skia | ⚠️ 2.6.2 (expected 2.4.18 — newer, fine) |

---

## Build commands (once expo.dev account is created)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to expo.dev
eas login

# Android APK (no Apple account needed, ~15 min cloud build)
eas build --profile preview --platform android

# iOS (needs Apple Developer account, $99/yr)
eas build --profile preview --platform ios
```

---

## Three commands to run right now

```bash
cd /Users/truth/Developer/SANO/sano-mobile
npx expo start --clear
# Press 'i' for iOS Simulator
```
