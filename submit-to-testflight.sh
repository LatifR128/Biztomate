#!/bin/bash

echo "🚀 TestFlight Submission Script"
echo "================================"

# Check if we're logged in
if ! npx expo whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Expo. Please run: npx expo login"
    exit 1
fi

echo "✅ Logged in to Expo"

# Try to build using EAS
echo "📋 Attempting EAS build..."
if npx eas build --platform ios --profile production --non-interactive; then
    echo "✅ EAS build successful!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Wait for build to complete on EAS"
    echo "2. Download the .ipa file"
    echo "3. Upload to App Store Connect"
    echo "4. Submit for TestFlight review"
else
    echo "⚠️  EAS build failed"
    echo ""
    echo "📋 Manual build required:"
    echo "1. Go to https://expo.dev"
    echo "2. Sign in with your account"
    echo "3. Navigate to your project"
    echo "4. Click 'Build' → 'iOS' → 'Production'"
    echo "5. Wait for build to complete"
    echo "6. Download and submit to TestFlight"
fi

echo ""
echo "🧪 Testing Instructions:"
echo "1. Use sandbox Apple ID for testing"
echo "2. Test all subscription plans:"
echo "   - com.biztomate.scanner.basic"
echo "   - com.biztomate.scanner.standard"
echo "   - com.biztomate.scanner.premium"
echo "   - com.biztomate.scanner.unlimited"
echo "3. Verify in-app purchases work"
echo "4. Test restore purchases functionality"

echo ""
echo "📋 App Store Connect Setup:"
echo "1. Ensure products are configured with exact IDs"
echo "2. Set up subscription groups"
echo "3. Configure app-specific shared secret"
echo "4. Create sandbox testers"

echo ""
echo "🎯 Expected Results:"
echo "- No 'Product not available' errors"
echo "- Products load successfully"
echo "- Purchase flow works correctly"
echo "- Proper error messages"

echo ""
echo "✅ In-app purchase fixes are ready for testing!"
