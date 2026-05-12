# DermaAI.keras — 5-class output, softmax, 224x224 RGB input
# Model trained April 2025, Keras 3.8.0

# 5-class labels mapped from model output index → condition name
CONDITION_LABELS_5 = [
    "Acne",
    "Eczema",
    "Hyperpigmentation",
    "Razor Bumps",
    "Healthy",
]

# Keep broader lists for future model versions
CONDITION_LABELS_7 = [
    "Acne",
    "Eczema",
    "Hyperpigmentation",
    "Psoriasis",
    "Rosacea",
    "Seborrheic Dermatitis",
    "Healthy",
]

CONDITION_LABELS_14 = [
    "Acne",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Chickenpox",
    "Cowpox",
    "Eczema",
    "Healthy",
    "Hyperpigmentation",
    "Melanoma",
    "Monkeypox",
    "Psoriasis",
    "Razor Bumps",
    "Ringworm",
    "Vitiligo",
]

# Maps model output label → SANO internal condition ID
SANO_CONDITION_MAP: dict[str, str] = {
    "Acne":              "acne",
    "Eczema":            "eczema",
    "Hyperpigmentation": "hyperpigmentation",
    "Razor Bumps":       "razor_bumps",
    "Healthy":           "healthy_clear",
    # Extended
    "Psoriasis":         "psoriasis",
    "Rosacea":           "rosacea",
    "Seborrheic Dermatitis": "seborrheic_dermatitis",
    "Ringworm":          "fungal_ringworm",
    "Vitiligo":          "vitiligo",
    "Normal/Healthy":    "healthy_clear",
    "Melasma":           "melasma",
}


def estimate_severity(confidence: float) -> float:
    """Map prediction confidence to a 0–1 severity score."""
    if confidence > 0.90:
        return 0.85
    if confidence > 0.75:
        return 0.65
    if confidence > 0.60:
        return 0.45
    if confidence > 0.45:
        return 0.30
    return 0.15


def get_condition_labels(num_classes: int) -> list[str]:
    """Return the right label list for the given output dimension."""
    if num_classes == 5:
        return CONDITION_LABELS_5
    if num_classes == 7:
        return CONDITION_LABELS_7
    return CONDITION_LABELS_14
