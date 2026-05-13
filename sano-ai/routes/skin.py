import asyncio
import base64
import time
import uuid
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import tensorflow as tf
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel

from class_labels import (
    SANO_CONDITION_MAP,
    estimate_severity,
    get_condition_labels,
)

router = APIRouter()

# ── Model state (loaded once at startup) ─────────────────────────────────────
MODEL = None
IS_TFLITE = False
MODEL_INPUT_SIZE = (224, 224)
CONDITION_LABELS: list[str] = []


def load_model() -> None:
    global MODEL, MODEL_INPUT_SIZE, CONDITION_LABELS, IS_TFLITE

    base_dir = Path(__file__).resolve().parent.parent
    tflite_path = base_dir / "models" / "DermaAI.tflite"
    model_path = base_dir / "models" / "DermaAI.keras"

    print(f"DEBUG: __file__ = {__file__}")
    print(f"DEBUG: base_dir = {base_dir}")
    print(f"DEBUG: Checking for tflite at {tflite_path}")
    
    import os
    try:
        print(f"DEBUG: Files in base_dir: {os.listdir(str(base_dir))}")
        if (base_dir / "models").exists():
            print(f"DEBUG: Files in models: {os.listdir(str(base_dir / 'models'))}")
    except Exception as e:
        print(f"DEBUG: Failed to list dirs: {e}")

    if tflite_path.exists():
        try:
            print(f"Loading {tflite_path} …")
            MODEL = tf.lite.Interpreter(model_path=str(tflite_path))
            MODEL.allocate_tensors()
            IS_TFLITE = True
            
            input_details = MODEL.get_input_details()
            output_details = MODEL.get_output_details()
            
            shape = input_details[0]['shape']
            MODEL_INPUT_SIZE = (int(shape[1]), int(shape[2]))
            
            num_classes = int(output_details[0]['shape'][-1])
            CONDITION_LABELS = get_condition_labels(num_classes)
            
            print(f"✓ DermaAI TFLite loaded — input {MODEL_INPUT_SIZE}, {num_classes} classes: {CONDITION_LABELS}")
            return
        except Exception as exc:
            print(f"✗ TFLite load failed: {exc}. Trying Keras model...")

    if not model_path.exists():
        print(f"⚠  No model file found. Checked: {tflite_path} and {model_path}")
        import os
        if os.environ.get("ENV") == "production" or os.environ.get("NODE_ENV") == "production":
            raise RuntimeError(f"Model file not found in production! Checked: {tflite_path} and {model_path}")
        print("Running in mock mode")
        return

    try:
        print(f"Loading {model_path} …")
        MODEL = tf.keras.models.load_model(str(model_path))

        input_shape = MODEL.input_shape          # (None, H, W, C)
        if len(input_shape) == 4:
            _, h, w, _ = input_shape
            MODEL_INPUT_SIZE = (int(h), int(w))

        num_classes = int(MODEL.output_shape[-1])
        CONDITION_LABELS = get_condition_labels(num_classes)

        print(
            f"✓ DermaAI loaded — input {MODEL_INPUT_SIZE}, "
            f"{num_classes} classes: {CONDITION_LABELS}"
        )
    except Exception as exc:
        print(f"✗ Model load failed: {exc}")
        MODEL = None


load_model()


# ── Request / response schemas ────────────────────────────────────────────────

class ScanRequest(BaseModel):
    image_base64: str
    skin_tone: Optional[int] = 5
    area: Optional[str] = "face"


# ── Image processing ──────────────────────────────────────────────────────────

def preprocess_image(image_base64: str, target_size: tuple) -> np.ndarray:
    img_bytes = base64.b64decode(image_base64)
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, target_size)
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0)


def apply_dark_skin_correction(
    predictions: np.ndarray, skin_tone: int
) -> np.ndarray:
    """
    Boost hyperpigmentation sensitivity for Fitzpatrick 4–6.
    Most CNN dermatology models were trained on majority light-skin
    datasets and systematically underdetect conditions on dark skin.
    """
    if skin_tone < 4:
        return predictions

    corrected = predictions.copy()
    for i, label in enumerate(CONDITION_LABELS):
        if "Hyperpigmentation" in label or "Razor" in label:
            boost = 0.12 * (skin_tone - 3) / 3
            corrected[0][i] = min(corrected[0][i] + boost, 1.0)

    corrected[0] = corrected[0] / corrected[0].sum()
    return corrected


# ── Mock fallback ─────────────────────────────────────────────────────────────

def get_mock_result(area: str) -> dict:
    return {
        "conditions": [
            {
                "name": "hyperpigmentation",
                "display_name": "Hyperpigmentation",
                "confidence": 0.91,
                "severity": 0.68,
                "location": area,
                "doctor_confirmed": False,
            }
        ],
        "skin_tone": 5,
        "skin_tone_detected": 5,
        "model_version": "v0.1-mock",
        "mock": True,
        "processing_time_ms": 800,
    }


# ── Helper function ───────────────────────────────────────────────────────────

def is_demo_mode() -> bool:
    return os.getenv("SANO_DEMO_MODE") == "true" or os.getenv("ENVIRONMENT") != "production"


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/skin")
async def analyze_skin(request: ScanRequest):
    start = time.time()

    if MODEL is None and not is_demo_mode():
        raise HTTPException(status_code=503, detail="AI model not loaded")

    try:
        img = preprocess_image(request.image_base64, MODEL_INPUT_SIZE)
        
        if IS_TFLITE:
            input_details = MODEL.get_input_details()
            output_details = MODEL.get_output_details()
            MODEL.set_tensor(input_details[0]['index'], img)
            MODEL.invoke()
            raw = MODEL.get_tensor(output_details[0]['index'])
        else:
            raw = MODEL.predict(img, verbose=0)
            
        preds = apply_dark_skin_correction(raw, request.skin_tone or 5)
        flat = preds[0]

        conditions = []
        for i, conf in enumerate(flat):
            if conf > 0.10 and i < len(CONDITION_LABELS):
                raw_name = CONDITION_LABELS[i]
                sano_name = SANO_CONDITION_MAP.get(
                    raw_name,
                    raw_name.lower().replace(" ", "_"),
                )
                if sano_name != "healthy_clear":
                    conditions.append(
                        {
                            "name": sano_name,
                            "display_name": raw_name,
                            "confidence": float(conf),
                            "severity": estimate_severity(float(conf)),
                            "location": request.area,
                            "doctor_confirmed": False,
                        }
                    )

        conditions.sort(key=lambda x: x["confidence"], reverse=True)

        if not conditions:
            conditions = [
                {
                    "name": "healthy_clear",
                    "display_name": "Healthy Skin",
                    "confidence": float(flat.max()),
                    "severity": 0.0,
                    "location": request.area,
                    "doctor_confirmed": False,
                }
            ]

        ms = int((time.time() - start) * 1000)
        top = conditions[0]

        return {
            "scan_id": str(uuid.uuid4()),
            "conditions": conditions[:3],
            "skin_tone": request.skin_tone,
            "skin_tone_detected": request.skin_tone,
            "model_version": "DermaAI-v1.0",
            "confidence": top["confidence"],
            "queued_for_label": top["confidence"] < 0.75,
            "mock": False,
            "processing_time_ms": ms,
        }

    except Exception as exc:
        if is_demo_mode():
            result = get_mock_result(request.area or "face")
            result["scan_id"] = str(uuid.uuid4())
            return result
        else:
            raise HTTPException(status_code=500, detail=str(exc))


# ── Legacy alias ─────────────────────────────────────────────────────────────

@router.post("/analyze/skin")
async def analyze_skin_legacy(
    request: ScanRequest,
):
    return await analyze_skin(request=request)
