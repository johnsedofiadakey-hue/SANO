# SANO Backend

Express + Prisma + SQLite API. Runs locally with zero external services.

## Quick start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Run database migrations (creates dev.db)
npx prisma migrate dev --name init

# 3. Generate Prisma client
npx prisma generate

# 4. Start dev server
npm run dev
```

Backend running at **http://localhost:3000**

---

## Routes

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Create account, returns JWT |
| POST | /auth/login | Login, returns JWT |
| POST | /auth/otp/send | Send OTP (logged to console in dev) |
| POST | /auth/otp/verify | Verify OTP — use `123456` in dev |
| GET  | /auth/me | Current user from JWT |

### Scans
| Method | Path | Description |
|--------|------|-------------|
| POST | /scans/upload | Upload image (multipart/form-data), returns AI result |
| GET  | /scans | Paginated scan history |
| GET  | /scans/:id | Single scan |
| PATCH | /scans/:id/confirm | Mark as doctor confirmed |
| POST | /scans/:id/share | Increment share count |

### Health
| Method | Path | Description |
|--------|------|-------------|
| POST | /health/event | Store health event |
| GET  | /health/vitals | Recent vitals (heart rate, SpO2) |
| GET  | /health/cycle | Cycle logs |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| POST | /analytics/event | Store event (PII blocked) |
| POST | /analytics/events | Same (frontend alias) |
| POST | /analytics/batch | Batch event ingestion |

### System
| Method | Path | Description |
|--------|------|-------------|
| GET | /healthz | Health check |

---

## Scan rate limits

| Plan | Scans per hour |
|------|---------------|
| Free | 3 |
| Plus / Glow | 20 |
| Pro | Unlimited |

---

## Environment variables

```env
JWT_SECRET=change_this_in_production
AI_SERVICE_URL=http://localhost:8001
PORT=3000
```

SQLite database is at `backend/prisma/dev.db` — no DATABASE_URL needed for local dev.

---

## Prisma commands

```bash
npx prisma studio          # Visual DB browser
npx prisma migrate dev     # Apply new migrations
npx prisma db push         # Push schema without migration
npx prisma generate        # Regenerate client after schema change
```

## File uploads

Images are stored in `backend/uploads/`. This directory is gitignored.
For production, swap multer disk storage for Cloudflare R2.
