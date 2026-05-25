#!/bin/bash
set -e
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SANO AI Service — Starting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p models

# Prefer TFLite (23 MB, faster cold start) over Keras (274 MB)
if [ ! -f "models/DermaAI.tflite" ]; then
  echo "📥 DermaAI.tflite not found — downloading from Hugging Face..."
  curl -L --fail -o models/DermaAI.tflite \
    https://huggingface.co/sedofia/DermaAI/resolve/main/DermaAI.tflite \
    || echo "⚠  TFLite download failed — will try Keras fallback"
fi

if [ -f "models/DermaAI.tflite" ]; then
  echo "✓ DermaAI.tflite ready ($(du -sh models/DermaAI.tflite | cut -f1))"
else
  # Keras fallback
  if [ ! -f "models/DermaAI.keras" ]; then
    echo "📥 DermaAI.keras not found — downloading from Hugging Face..."
    curl -L --fail -o models/DermaAI.keras \
      https://huggingface.co/sedofia/DermaAI/resolve/main/DermaAI.keras \
      || echo "⚠  Keras download also failed — running in mock mode"
  fi
  if [ -f "models/DermaAI.keras" ]; then
    echo "✓ DermaAI.keras ready ($(du -sh models/DermaAI.keras | cut -f1))"
  else
    echo "⚠  No model found — running in mock mode until next restart"
  fi
fi

exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8001}"
