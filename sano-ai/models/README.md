# SANO AI Models

Model weights go here. Not committed to git (add `models/*.pt` to .gitignore).

## Model inventory

| Model             | File                    | Size  | Status      |
|-------------------|-------------------------|-------|-------------|
| Skin condition    | sano_skin_v1.pt         | ~85MB | In training |
| Foundation match  | sano_foundation_v1.pt   | ~22MB | Planned     |
| PPG heart rate    | sano_ppg_v1.pt          | ~8MB  | Planned     |
| Malaria screening | sano_malaria_v1.pt      | ~45MB | Planned     |

## Training data

- Skin model: Fitzpatrick 4-6 labelled dataset (target 50,000 images)
- Labels: condition name, severity (0–1), location, body area
- Collection via SANO app with informed consent + doctor verification

## Download (when available)

```bash
python scripts/download_models.py
```
