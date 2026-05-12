from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import time
import random

router = APIRouter()


class VitalsResponse(BaseModel):
    bpm: int
    spo2: float
    confidence: float
    model_version: str
    processing_time_ms: int
    note: Optional[str] = None


@router.post("/heartrate", response_model=VitalsResponse)
async def measure_heart_rate(
    duration_seconds: float = Form(default=30.0),
    video_clip_path: Optional[str] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
) -> VitalsResponse:
    start = time.time()

    # Simulate rPPG signal extraction from video
    time.sleep(random.uniform(0.5, 1.5))

    # Realistic resting heart rate range: 60–100 bpm
    bpm = random.randint(62, 88)
    spo2 = round(random.uniform(95.5, 99.2), 1)
    confidence = round(random.uniform(0.81, 0.94), 2)

    processing_ms = int((time.time() - start) * 1000)

    return VitalsResponse(
        bpm=bpm,
        spo2=spo2,
        confidence=confidence,
        model_version="v0.1-mock",
        processing_time_ms=processing_ms,
        note="Mock rPPG. Real model requires 30-second face video under consistent lighting.",
    )


# Legacy alias
@router.post("/heart-rate", response_model=VitalsResponse)
async def measure_heart_rate_legacy(
    duration_seconds: float = Form(default=30.0),
    video_clip_path: Optional[str] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
) -> VitalsResponse:
    return await measure_heart_rate(duration_seconds=duration_seconds, video_clip_path=video_clip_path, image=image)
