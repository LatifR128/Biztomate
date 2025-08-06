#!/bin/bash

echo "Setting up Firebase Swift Package Manager for iOS..."

# Create ios directory if it doesn't exist
mkdir -p ios

# Check if GoogleService-Info.plist exists
if [ ! -f "ios/GoogleService-Info.plist" ]; then
    echo "❌ GoogleService-Info.plist not found in ios/ directory"
    echo "Please download it from Firebase Console and place it in ios/GoogleService-Info.plist"
    exit 1
fi

echo "✅ GoogleService-Info.plist found"

# Instructions for manual Xcode setup
echo ""
echo "📱 Manual Xcode Setup Required:"
echo ""
echo "1. Open your project in Xcode:"
echo "   npx expo prebuild --platform ios"
echo "   open ios/Biztomate.xcworkspace"
echo ""
echo "2. Add Firebase Swift Package Manager dependencies:"
echo "   - In Xcode, go to File > Add Package Dependencies"
echo "   - Enter URL: https://github.com/firebase/firebase-ios-sdk"
echo "   - Select the following products:"
echo "     • FirebaseAnalytics"
echo "     • FirebaseAuth"
echo "     • FirebaseFirestore"
echo "     • FirebaseStorage"
echo ""
echo "3. Configure your target:"
echo "   - Select your app target"
echo "   - Go to Build Phases > Link Binary With Libraries"
echo "   - Add the Firebase frameworks"
echo ""
echo "4. Update Info.plist (if needed):"
echo "   - Add any required permissions for Firebase services"
echo ""
echo "5. Build and test:"
echo "   npx expo run:ios"
echo ""

echo "🎉 Firebase iOS setup instructions completed!"
echo "Follow the manual steps above to complete the configuration." 