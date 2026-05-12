from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import time
import random

router = APIRouter()


class ShadeMatch(BaseModel):
    brand: str
    shade: str
    code: str
    match_confidence: float
    swatch_hex: str
    available_accra: bool
    accra_store: Optional[str] = None


class FoundationResponse(BaseModel):
    fitzpatrick_detected: int
    undertone: str
    matches: list[ShadeMatch]
    model_version: str
    processing_time_ms: int


SHADE_DATABASE: dict[int, list[ShadeMatch]] = {
    1: [
        ShadeMatch(brand="Fenty Beauty", shade="100N", code="100N", match_confidence=0.97, swatch_hex="#F5DEB3", available_accra=False),
        ShadeMatch(brand="MAC", shade="NW10", code="NW10", match_confidence=0.94, swatch_hex="#FAEBD7", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W1 Ivory", code="W1", match_confidence=0.91, swatch_hex="#FAF0E6", available_accra=True, accra_store="Melcom Plus, Accra Mall"),
        ShadeMatch(brand="Black Opal", shade="Porcelain", code="PRC", match_confidence=0.88, swatch_hex="#FFF5EE", available_accra=True, accra_store="Ernest Chemists, Osu"),
    ],
    2: [
        ShadeMatch(brand="Fenty Beauty", shade="130N", code="130N", match_confidence=0.96, swatch_hex="#E8C99A", available_accra=False),
        ShadeMatch(brand="MAC", shade="NC15", code="NC15", match_confidence=0.93, swatch_hex="#EDD5A3", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W2 Vanilla", code="W2", match_confidence=0.90, swatch_hex="#E3C390", available_accra=True, accra_store="Melcom Plus, Tema"),
        ShadeMatch(brand="Black Opal", shade="Creamy Natural", code="CN1", match_confidence=0.87, swatch_hex="#DEB887", available_accra=True, accra_store="Ernest Chemists, Osu"),
    ],
    3: [
        ShadeMatch(brand="Fenty Beauty", shade="230N", code="230N", match_confidence=0.97, swatch_hex="#C9956C", available_accra=False),
        ShadeMatch(brand="MAC", shade="NC30", code="NC30", match_confidence=0.94, swatch_hex="#C68642", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W4 Natural Beige", code="W4", match_confidence=0.91, swatch_hex="#C19A6B", available_accra=True, accra_store="Melcom Plus, Accra Mall"),
        ShadeMatch(brand="Black Opal", shade="Natural Tan", code="NT2", match_confidence=0.89, swatch_hex="#B5784B", available_accra=True, accra_store="Ernest Chemists, Osu"),
    ],
    4: [
        ShadeMatch(brand="Fenty Beauty", shade="335N", code="335N", match_confidence=0.98, swatch_hex="#A0522D", available_accra=False),
        ShadeMatch(brand="MAC", shade="NC40", code="NC40", match_confidence=0.95, swatch_hex="#9C6B47", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W6 Sun Beige", code="W6", match_confidence=0.92, swatch_hex="#A0714F", available_accra=True, accra_store="Melcom Plus, Tema"),
        ShadeMatch(brand="Black Opal", shade="Warm Caramel", code="WC3", match_confidence=0.90, swatch_hex="#8B5E3C", available_accra=True, accra_store="Ernest Chemists, Osu"),
    ],
    5: [
        ShadeMatch(brand="Fenty Beauty", shade="430W", code="430W", match_confidence=0.98, swatch_hex="#8B5E3C", available_accra=False),
        ShadeMatch(brand="Black Opal", shade="Hazelnut", code="HZ-4", match_confidence=0.96, swatch_hex="#7A4428", available_accra=True, accra_store="Ernest Chemists, Osu — GHS 185"),
        ShadeMatch(brand="MAC", shade="NC45", code="NC45", match_confidence=0.94, swatch_hex="#9C6B47", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W8 Caramel", code="W8", match_confidence=0.91, swatch_hex="#724025", available_accra=True, accra_store="Melcom Plus, Tema — GHS 142"),
    ],
    6: [
        ShadeMatch(brand="Fenty Beauty", shade="498N", code="498N", match_confidence=0.97, swatch_hex="#5C3317", available_accra=False),
        ShadeMatch(brand="Black Opal", shade="Rich Ebony", code="RE-6", match_confidence=0.95, swatch_hex="#4A2311", available_accra=True, accra_store="Ernest Chemists, Osu — GHS 185"),
        ShadeMatch(brand="MAC", shade="NC50", code="NC50", match_confidence=0.93, swatch_hex="#6B3A2A", available_accra=False),
        ShadeMatch(brand="L'Oreal", shade="W10 Espresso", code="W10", match_confidence=0.90, swatch_hex="#3B1E08", available_accra=True, accra_store="Melcom Plus, Tema — GHS 142"),
    ],
}

UNDERTONES = ["warm", "cool", "neutral", "warm-neutral", "cool-neutral"]


@router.post("/foundation", response_model=FoundationResponse)
async def match_foundation(
    fitzpatrick: Optional[int] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> FoundationResponse:
    start = time.time()
    time.sleep(random.uniform(0.5, 1.5))

    tone = fitzpatrick if fitzpatrick and 1 <= fitzpatrick <= 6 else random.choice([4, 5, 5, 6])
    undertone = random.choice(UNDERTONES[:3])
    matches = SHADE_DATABASE.get(tone, SHADE_DATABASE[5])

    processing_ms = int((time.time() - start) * 1000)

    return FoundationResponse(
        fitzpatrick_detected=tone,
        undertone=undertone,
        matches=matches,
        model_version="v0.1-mock",
        processing_time_ms=processing_ms,
    )


# Legacy alias
@router.post("/match", response_model=FoundationResponse)
async def match_foundation_legacy(
    fitzpatrick: Optional[int] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
    image_base64: Optional[str] = Form(default=None),
) -> FoundationResponse:
    return await match_foundation(fitzpatrick=fitzpatrick, image=image, image_base64=image_base64)
