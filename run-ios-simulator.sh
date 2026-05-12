#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SANO — iOS Simulator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/sano-mobile"

# Ensure demo mode is on
echo "EXPO_PUBLIC_DEMO_MODE=true" > .env

echo ""
echo "Opening iOS Simulator..."
echo "(If Simulator doesn't open: launch Xcode → Xcode menu → Open Developer Tool → Simulator)"
echo ""

# Start Expo Go compatible (no custom native build needed)
npx expo start --ios --clear

echo ""
echo "If you see 'Unable to install Expo Go':"
echo "  1. Open Simulator manually"
echo "  2. Run: npx expo start --clear"
echo "  3. Press 'i' to open in iOS Simulator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
