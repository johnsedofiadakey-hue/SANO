#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SANO — Starting demo mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/sano-mobile"

# Ensure demo mode is on
echo "EXPO_PUBLIC_DEMO_MODE=true" > .env

echo ""
echo "Starting Expo with tunnel..."
echo "(Tunnel works even if your phone and laptop are on different networks)"
echo ""

# Clear cache and start with tunnel
npx expo start --tunnel --clear

echo ""
echo "Scan the QR code above with Expo Go"
echo "iOS:     Download 'Expo Go' from App Store, then use Camera app to scan"
echo "Android: Download 'Expo Go' from Play Store, then open app and scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
