from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
import time
import random
import os

router = APIRouter()


class SkinCondition(BaseModel):
    name: str
    severity: float
    confidence: float
    location: str
    doctor_confirmed: bool = False


class SkinAnalyseResponse(BaseModel):
    scan_id: str
    conditions: list[SkinCondition]
    skin_tone: int
    model_version: str
    processing_time_ms: int


MOCK_CONDITIONS: dict[str, list[SkinCondition]] = {
    "face": [
        SkinCondition(name="hyperpigmentation", severity=0.68, confidence=0.91, location="jawline"),
        SkinCondition(name="post_inflammatory_hyperpigmentation", severity=0.55, confidence=0.84, location="cheeks"),
        SkinCondition(name="mild_oiliness", severity=0.32, confidence=0.77, location="t-zone"),
    ],
    "face_jawline": [
        SkinCondition(name="razor_bumps_pfb", severity=0.71, confidence=0.89, location="jawline"),
        SkinCondition(name="hyperpigmentation", severity=0.48, confidence=0.82, location="jawline"),
    ],
    "face_forehead": [
        SkinCondition(name="acne_active", severity=0.44, confidence=0.86, location="forehead"),
        SkinCondition(name="oiliness", severity=0.58, confidence=0.81, location="forehead"),
    ],
    "neck": [
        SkinCondition(name="razor_bumps_pfb", severity=0.54, confidence=0.85, location="neck"),
        SkinCondition(name="hyperpigmentation", severity=0.38, confidence=0.74, location="neck"),
    ],
    "chest": [
        SkinCondition(name="acne_marks", severity=0.41, confidence=0.80, location="chest"),
        SkinCondition(name="eczema", severity=0.22, confidence=0.71, location="chest"),
    ],
    "arms_forearm": [
        SkinCondition(name="eczema", severity=0.38, confidence=0.83, location="inner forearm"),
        SkinCondition(name="dryness", severity=0.52, confidence=0.88, location="forearm"),
    ],
    "default": [
        SkinCondition(name="hyperpigmentation", severity=0.45, confidence=0.82, location="general"),
        SkinCondition(name="dryness", severity=0.31, confidence=0.75, location="general"),
    ],
}


MODEL_PATH = "models/DermaAI.keras"

@router.post("/skin", response_model=SkinAnalyseResponse)
async def analyse_skin(
    body_area: str = Form(default="face"),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> SkinAnalyseResponse:
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=503, detail="Model file not found. Service unavailable.")
        
    # TODO: Implement real model inference.
    # We return a 501 Not Implemented instead of fake data to reflect production readiness.
    raise HTTPException(status_code=501, detail="Model inference not yet implemented. Real analysis unavailable.")


# Legacy endpoint alias
@router.post("/analyse", response_model=SkinAnalyseResponse)
async def analyse_skin_legacy(
    body_area: str = Form(default="face"),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> SkinAnalyseResponse:
    return await analyse_skin(body_area=body_area, image=image, image_base64=image_base64)
