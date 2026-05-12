from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import skin, foundation, vitals, malaria

app = FastAPI(title="SANO AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Primary routes at /analyze/* (spec)
app.include_router(skin.router,       prefix="/analyze",    tags=["skin"])
app.include_router(foundation.router, prefix="/analyze",    tags=["foundation"])
app.include_router(vitals.router,     prefix="/analyze",    tags=["vitals"])
app.include_router(malaria.router,    prefix="/analyze",    tags=["malaria"])

# Legacy aliases (keep working for any existing callers)
app.include_router(skin.router,       prefix="/skin",       tags=["skin-legacy"])
app.include_router(foundation.router, prefix="/foundation", tags=["foundation-legacy"])
app.include_router(vitals.router,     prefix="/vitals",     tags=["vitals-legacy"])
app.include_router(malaria.router,    prefix="/malaria",    tags=["malaria-legacy"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sano-ai", "version": "0.1.0"}
