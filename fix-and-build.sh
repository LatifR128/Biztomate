#!/bin/bash
echo "Fixing Node.js configuration and building..."
export NODE_OPTIONS="--experimental-loader ts-node/esm"
export CI=1
npx eas build --platform ios --profile production --non-interactive --auto-submit
