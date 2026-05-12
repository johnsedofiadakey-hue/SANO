# Firebase Setup — SANO (20 minutes)

After this you'll have real auth, real database, and real image storage — all on Firebase free tier.

---

## Step 1 — Create Firebase project (3 min)

1. Go to **console.firebase.google.com**
2. Click **"Add project"** → name: `sano-health`
3. Disable Google Analytics for now (enable later)
4. Click **"Create project"** → wait ~30s

---

## Step 2 — Register your app + get config (2 min)

5. In the project overview, click the **Web icon** (`</>`)
6. App nickname: `SANO Mobile`
7. **Do NOT** check "Firebase Hosting"
8. Click **"Register app"**
9. You'll see `const firebaseConfig = { ... }` — copy each value into your `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sano-health.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sano-health
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sano-health.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

---

## Step 3 — Enable Authentication (3 min)

10. Left sidebar → **Authentication** → **Get started**
11. **Sign-in method** tab → enable:
    - ✅ **Phone** → toggle on → under "Phone numbers for testing" add:
      - Phone: `+233000000000` | Code: `123456`  
      *(use this in Expo Go — native phone auth needs custom dev client)*
    - ✅ **Email/Password** → toggle on
    - ✅ **Google** → toggle on → add your support email
12. Click **Save**

---

## Step 4 — Set up Firestore (3 min)

13. Left sidebar → **Firestore Database** → **Create database**
14. Select **"Start in test mode"** (we'll add rules after)
15. Location: **`europe-west1`** (closest to Ghana with low latency)
16. Click **"Enable"** → wait ~30s

### Deploy security rules:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your sano-health project
# When asked for rules file: press Enter (uses firestore.rules)
cp firestore.rules .  # already created by Claude
firebase deploy --only firestore:rules
```

---

## Step 5 — Set up Storage (2 min)

17. Left sidebar → **Storage** → **Get started**
18. **"Start in test mode"**
19. Location: **`europe-west1`** (same as Firestore — required)
20. Click **"Done"**

### Deploy storage rules:
```bash
firebase init storage
# Press Enter to use storage.rules
firebase deploy --only storage
```

---

## Step 6 — Get Admin SDK for backend (2 min)

21. **Project settings** (gear icon) → **Service accounts** tab
22. Click **"Generate new private key"** → confirm → download JSON
23. Open the JSON file → copy its entire contents
24. In your backend's Render environment variables, set:
    ```
    FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"sano-health",...}
    ```
    (Paste the entire JSON on one line — remove all actual newlines)

---

## Step 7 — Go live

25. In your mobile `.env`:
    ```env
    EXPO_PUBLIC_DEMO_MODE=    # remove this line or set to false
    ```
26. Restart Expo: `npx expo start --clear`

**You now have real Firebase auth, Firestore database, and image storage.**

---

## Enabling phone auth in Expo Go

Firebase phone auth with the web SDK in Expo Go requires the **invisible reCAPTCHA** which is browser-based. In Expo Go (managed workflow):

- Use the **test phone number** you added: `+233000000000` code `123456`
- For real phone auth in production: build a **custom dev client** with `expo prebuild` and add `@react-native-firebase/auth`

For the demo and investor meetings: email login works perfectly with no extra setup.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Firebase: Error (auth/invalid-api-key)` | Check `EXPO_PUBLIC_FIREBASE_API_KEY` in .env |
| `Missing or insufficient permissions` | Deploy `firestore.rules` with `firebase deploy --only firestore:rules` |
| `storage/unauthorized` | Deploy `storage.rules` with `firebase deploy --only storage` |
| Phone OTP not arriving | Add test number in Firebase console first |
