#!/bin/bash
echo "🚀 Building and submitting to TestFlight..."
echo "Using EAS CLI to build and submit..."
npx eas build --platform ios --profile production --non-interactive --auto-submit
