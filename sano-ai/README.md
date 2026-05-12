# SANO AI Service

FastAPI service serving skin analysis, foundation matching, vitals, and malaria screening.
All endpoints are realistic stubs with 0.5–1.5s simulated processing delays.

## Quick start

```bash
# 1. Enter directory
cd sano-ai

# 2. Create and activate virtualenv
python -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start server
uvicorn main:app --reload --port 8001
```

AI service running at **http://localhost:8001**

Interactive docs at **http://localhost:8001/docs**

---

## Endpoints

### Skin analysis
```
POST /analyze/skin
Content-Type: multipart/form-data

Fields:
  body_area  string   e.g. "face", "neck", "chest", "arms_forearm"
  image      file     optional — not used by mock
```

Returns: `{ scan_id, conditions[], skin_tone, model_version, processing_time_ms }`

### Foundation matching
```
POST /analyze/foundation
Content-Type: multipart/form-data

Fields:
  fitzpatrick  int    1–6 (optional, detected from image in production)
  image        file   optional
```

Returns: `{ fitzpatrick_detected, undertone, matches[], model_version, processing_time_ms }`

### Heart rate / vitals
```
POST /analyze/heartrate
Content-Type: multipart/form-data

Fields:
  duration_seconds   float   default 30.0
  video_clip_path    string  path to 30-second video (production only)
```

Returns: `{ bpm, spo2, confidence, model_version, processing_time_ms }`

### Malaria screening
```
POST /analyze/malaria
Content-Type: multipart/form-data

Fields:
  image  file  blood smear image (production only)
```

Returns: `{ result, confidence, note, model_version, processing_time_ms }`

> **Note:** Malaria screening returns `confidence: 0.0` until the model is validated by KATH.

---

## Legacy endpoints

All routes are also available at their original paths:
- `/skin/analyse`
- `/foundation/match`
- `/vitals/heart-rate`
- `/malaria/screen`

---

## Health check

```
GET /health
→ { "status": "ok", "service": "sano-ai", "version": "0.1.0" }
```
