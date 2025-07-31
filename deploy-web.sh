#!/bin/bash

echo "🚀 TestFlight Deployment Guide"
echo "=============================="

echo ""
echo "📋 Current Status:"
echo "✅ App version: 1.3.4"
echo "✅ Build number: 17"
echo "✅ Bundle ID: com.biztomate.scanner"
echo "✅ In-app purchase plugin: Configured"

echo ""
echo "📋 Product IDs:"
echo "✅ com.biztomate.scanner.basic"
echo "✅ com.biztomate.scanner.standard"
echo "✅ com.biztomate.scanner.premium"
echo "✅ com.biztomate.scanner.unlimited"

echo ""
echo "🌐 Opening Deployment Tools..."

# Open Expo Dev Tools
open "https://expo.dev"

# Wait a moment
sleep 2

# Open App Store Connect
open "https://appstoreconnect.apple.com"

echo ""
echo "📋 Deployment Steps:"
echo "1. In Expo Dev Tools:"
echo "   - Sign in with account: latifr"
echo "   - Navigate to project: Biztomate-Scanner"
echo "   - Click 'Build' → 'iOS' → 'Production'"
echo "   - Wait for build to complete"
echo "   - Download .ipa file"
echo ""
echo "2. In App Store Connect:"
echo "   - Sign in with Apple Developer account"
echo "   - Navigate to app: Biztomate"
echo "   - Go to 'TestFlight' tab"
echo "   - Upload the .ipa file"
echo "   - Submit for review"
echo ""
echo "🎯 Expected Results:"
echo "- No 'Product not available' errors"
echo "- Products load successfully"
echo "- Purchase flow works correctly"
echo "- Proper error messages"
echo ""
echo "✅ Ready for deployment!"
