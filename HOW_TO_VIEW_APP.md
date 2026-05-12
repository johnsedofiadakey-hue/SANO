# How to view SANO right now

---

## Option 1 — iOS Simulator (RECOMMENDED — you have Xcode)
### Takes 2 minutes. No phone needed. No account needed.

```bash
cd /Users/truth/Developer/SANO
./run-ios-simulator.sh
```

SANO opens in iPhone Simulator on your Mac. Full app, all screens.

If Simulator doesn't launch automatically:
1. Open Xcode
2. Xcode menu → Open Developer Tool → Simulator
3. Run `./run-ios-simulator.sh` again

---

## Option 2 — Expo Go on your phone (works on any phone)
### Takes 5 minutes. Works on iPhone or Android.

```bash
cd /Users/truth/Developer/SANO
./start-demo.sh
```

Then:
1. iPhone: use **Camera app** to scan the QR code
2. Android: use **Expo Go app** to scan (download from Play Store first)

The `--tunnel` flag means it works even if your laptop and phone are on different WiFi networks.

---

## Option 3 — EAS Preview Build (shareable .apk / TestFlight link)
### Takes 20-30 minutes. Anyone can install it. No USB needed.

Prerequisites: free account at expo.dev

```bash
cd /Users/truth/Developer/SANO/sano-mobile
npm install -g eas-cli
eas login          # enter your expo.dev credentials
eas build --profile preview --platform android   # Android APK — no Apple account needed
```

EAS builds it in the cloud (~15 min). You get a URL:
`https://expo.dev/artifacts/eas/...`

Anyone with Android can download and install it directly.

For iOS: needs Apple Developer account ($99/yr) or share via TestFlight.

---

## Option 4 — Quick browser preview (layout check only)
### 30 seconds. Some features won't work (camera, BLE).

```bash
cd /Users/truth/Developer/SANO/sano-mobile
npx expo start --web
# Press 'w' in terminal → opens at http://localhost:8081
```

---

## Recommended order:
1. **Right now** → Option 1 (iOS Simulator, 2 min)
2. **For investor demo on a phone** → Option 2 (tunnel, 5 min)
3. **To share a link others can install** → Option 3 (EAS, 30 min setup)
