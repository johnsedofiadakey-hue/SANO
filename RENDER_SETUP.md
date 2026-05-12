# Render Setup — SANO (10 minutes)

After this you'll have the Express API and Python AI service live on Render's free tier.

---

## What lives on Render

| Service | Name | Purpose |
|---------|------|---------|
| Express (Node) | `sano-api` | Rate limiting + AI proxy |
| FastAPI (Python) | `sano-ai` | Skin/foundation/vitals stubs (→ real models later) |

Firebase handles auth, database, and storage — Render only does compute.

---

## Step 1 — Push your code to GitHub (2 min)

If you haven't already:

```bash
cd /Users/truth/Developer/SANO/sano-mobile
git init
git add .
git commit -m "initial commit"
gh repo create sano-mobile --private --source=. --push
```

---

## Step 2 — Deploy the Express backend (4 min)

1. Go to **dashboard.render.com** → **New** → **Web Service**
2. Connect your GitHub repo → select `sano-mobile`
3. Set these fields:

| Field | Value |
|-------|-------|
| **Name** | `sano-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. Under **Environment Variables**, add:

```
NODE_ENV=production
FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"sano-health",...}
RENDER_AI_URL=https://sano-ai.onrender.com
```

> `FIREBASE_ADMIN_SDK_JSON` must be the entire JSON on **one line** — no real newlines inside the value.

5. Click **Create Web Service** → wait ~3 minutes for first deploy

Your API will be at: `https://sano-api.onrender.com`

---

## Step 3 — Deploy the Python AI service (3 min)

1. **New** → **Web Service** again
2. Same repo, different settings:

| Field | Value |
|-------|-------|
| **Name** | `sano-ai` |
| **Root Directory** | `sano-ai` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free |

3. Under **Environment Variables**, add:

```
ENVIRONMENT=production
```

4. Click **Create Web Service** → wait ~3 minutes

Your AI service will be at: `https://sano-ai.onrender.com`

---

## Step 4 — Update your mobile .env (1 min)

```env
EXPO_PUBLIC_API_URL=https://sano-api.onrender.com
```

Then restart Expo: `npx expo start --clear`

---

## Step 5 — Keep-warm (prevents 50s cold starts)

Free Render services spin down after 15 min of inactivity. Set up an external pinger:

1. Go to **cron-job.org** → create free account
2. Add two cron jobs, both set to **every 10 minutes**:
   - URL: `https://sano-api.onrender.com/health`
   - URL: `https://sano-ai.onrender.com/health`
3. Both should return `200 OK` with `{"status":"ok"}`

> The backend also self-pings internally via `keepWarm.ts`, but cron-job.org is the safety net.

---

## Verify everything works

```bash
# Check backend health
curl https://sano-api.onrender.com/health

# Check AI service health
curl https://sano-ai.onrender.com/health

# Test a proxied scan (no auth in local dev)
curl -X POST https://sano-api.onrender.com/scans/analyze \
  -H "Content-Type: application/json" \
  -d '{"area":"face"}'
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Deploy fails with `Cannot find module` | Check `rootDir` is set to `backend` (not repo root) |
| `FIREBASE_ADMIN_SDK_JSON` parse error | Remove all real newlines — the JSON must be one line |
| 50s cold start despite pinger | cron-job.org free tier may have delays; upgrade to paid or use UptimeRobot |
| AI service returns 500 | Check Render logs — likely a missing Python dependency in `requirements.txt` |
| `sano-ai` URL wrong in backend | Set `RENDER_AI_URL=https://sano-ai.onrender.com` in `sano-api` env vars |

---

## Environment variable summary

### `sano-api` (Render env vars)
```
NODE_ENV=production
FIREBASE_ADMIN_SDK_JSON=<full JSON on one line>
RENDER_AI_URL=https://sano-ai.onrender.com
```

### `sano-ai` (Render env vars)
```
ENVIRONMENT=production
```

### Mobile `.env`
```
EXPO_PUBLIC_API_URL=https://sano-api.onrender.com
```
