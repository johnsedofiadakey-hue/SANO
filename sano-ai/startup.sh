#!/bin/bash
set -e
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SANO AI Service — Starting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "models/DermaAI.keras" ]; then
  echo "📥 DermaAI.keras not found — downloading from Hugging Face..."
  mkdir -p models
  curl -L -o models/DermaAI.keras https://huggingface.co/Siraja704/DermaAI/resolve/main/DermaAI.keras
fi

if [ -f "models/DermaAI.keras" ]; then
  echo "✓ DermaAI.keras found ($(du -sh models/DermaAI.keras | cut -f1))"
  python3 model_inspector.py || echo "⚠  Inspector failed — continuing anyway"
else
  echo "⚠  DermaAI.keras not found after download — running in mock mode"
fi

exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8001}"
