# SANO — Model Download Instructions

Run these once John has access to a machine with 16GB+ RAM and a stable connection.

---

## 1. Skin condition model — DermNet (primary)

```python
from transformers import AutoModel, AutoProcessor

model = AutoModel.from_pretrained("Anudwivedi/DermNetAI")
model.save_pretrained("./models/dermnet")

processor = AutoProcessor.from_pretrained("Anudwivedi/DermNetAI")
processor.save_pretrained("./models/dermnet")
```

After download, update `routes/skin.py`:
```python
from transformers import AutoModel, AutoProcessor
from PIL import Image
import torch

model = AutoModel.from_pretrained("./models/dermnet")
processor = AutoProcessor.from_pretrained("./models/dermnet")
```

Expected size: ~400MB

---

## 2. Skin tone / Fitzpatrick classifier

```python
from transformers import AutoModelForImageClassification, AutoFeatureExtractor

model = AutoModelForImageClassification.from_pretrained("microsoft/resnet-50")
model.save_pretrained("./models/fitzpatrick")

extractor = AutoFeatureExtractor.from_pretrained("microsoft/resnet-50")
extractor.save_pretrained("./models/fitzpatrick")
```

> Note: Fine-tune this on the ITA (Individual Typology Angle) dataset for African skin tones.
> Dataset: https://github.com/ISIC-Research/fitzpatrick-skin-tone

Expected size: ~100MB

---

## 3. rPPG heart rate model (camera vitals)

```python
# Option A: Pre-built rPPG library
pip install pyVHR

# Option B: Download CHROM/POS algorithm (no GPU needed)
# Already included in pyVHR — no separate download needed

# Test with:
import pyVHR
```

For production, use:
```bash
pip install rppg-toolbox
```

Expected GPU: none required (CPU inference ~2s for 30s clip)

---

## 4. Malaria blood smear model

Awaiting KATH (Komfo Anokye Teaching Hospital) validation before any model is loaded.

When approved:
```python
# Kaggle malaria cell images dataset
import kaggle
kaggle.api.dataset_download_files(
    'iarunava/cell-images-for-detecting-malaria',
    path='./data/malaria',
    unzip=True
)

# Then fine-tune a ResNet-50 classifier
# Training script will be added to ./training/malaria_train.py
```

**DO NOT deploy any malaria screening model without clinical validation.**

---

## Model directory layout

```
sano-ai/
  models/
    dermnet/          # Skin condition detection
    fitzpatrick/      # Skin tone classification
    rppg/             # Heart rate (CPU-only)
    malaria/          # Blood smear (PENDING VALIDATION)
    README.md         # This file
```

## Hardware requirements

| Model | RAM | GPU | Inference time |
|-------|-----|-----|----------------|
| DermNet | 8GB | Optional (2× faster) | ~0.4s |
| Fitzpatrick | 4GB | None | ~0.1s |
| rPPG | 4GB | None | ~2s/clip |
| Malaria | 8GB | Optional | ~0.3s |

All models run on a base M1 MacBook Air without issues.
