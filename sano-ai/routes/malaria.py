from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import time
import random

router = APIRouter()


class MalariaResponse(BaseModel):
    result: str
    confidence: float
    note: str
    model_version: str
    processing_time_ms: int


@router.post("/malaria", response_model=MalariaResponse)
async def screen_malaria(
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> MalariaResponse:
    start = time.time()
    time.sleep(random.uniform(0.5, 1.5))
    processing_ms = int((time.time() - start) * 1000)

    return MalariaResponse(
        result="negative",
        confidence=0.0,
        note="Model not yet loaded — awaiting KATH validation",
        model_version="v0.1-mock",
        processing_time_ms=processing_ms,
    )


# Legacy alias
@router.post("/screen", response_model=MalariaResponse)
async def screen_malaria_legacy(
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> MalariaResponse:
    return await screen_malaria(image=image, image_base64=image_base64)
