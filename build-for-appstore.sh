#!/bin/bash

# Build script for App Store submission
# Run with: ./build-for-appstore.sh

set -e

echo "🚀 Building Biztomate Scanner for App Store submission..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if EAS CLI is available via npx
if ! npx eas-cli --version &> /dev/null; then
    print_error "EAS CLI is not available. Please install it with: npm install -g eas-cli"
    exit 1
fi

# Check if logged in to Expo
if ! npx eas-cli whoami &> /dev/null; then
    print_error "Not logged in to Expo. Please run: npx eas-cli login"
    exit 1
fi

print_status "Starting build process..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install

# Step 2: Run type checking
print_status "Running TypeScript type checking..."
npx tsc --noEmit

# Step 3: Build for iOS
print_status "Building for iOS..."
npx eas-cli build --platform ios --profile production

print_success "Build completed successfully!"
print_status "Next steps:"
echo "1. Upload the build to App Store Connect"
echo "2. Test with TestFlight"
echo "3. Submit for App Store review"
echo ""
print_warning "Make sure you have configured the subscription products in App Store Connect:"
echo "- com.biztomate.scanner.basic"
echo "- com.biztomate.scanner.standard"
echo "- com.biztomate.scanner.premium"
echo "- com.biztomate.scanner.unlimited" 