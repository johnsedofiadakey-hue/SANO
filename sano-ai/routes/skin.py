from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import uuid
import time
import random

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


@router.post("/skin", response_model=SkinAnalyseResponse)
async def analyse_skin(
    body_area: str = Form(default="face"),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> SkinAnalyseResponse:
    start = time.time()

    # Simulate model inference time
    time.sleep(random.uniform(0.5, 1.5))

    area_key = body_area.lower().replace(" ", "_")
    conditions = MOCK_CONDITIONS.get(area_key, MOCK_CONDITIONS["default"])

    # Skin tone varies slightly per call for realism
    skin_tone = random.choice([4, 5, 5, 5, 6])

    processing_ms = int((time.time() - start) * 1000)

    return SkinAnalyseResponse(
        scan_id=str(uuid.uuid4()),
        conditions=conditions,
        skin_tone=skin_tone,
        model_version="v0.1-mock",
        processing_time_ms=processing_ms,
    )


# Legacy endpoint alias
@router.post("/analyse", response_model=SkinAnalyseResponse)
async def analyse_skin_legacy(
    body_area: str = Form(default="face"),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> SkinAnalyseResponse:
    return await analyse_skin(body_area=body_area, image=image, image_base64=image_base64)
