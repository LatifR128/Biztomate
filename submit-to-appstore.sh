#!/bin/bash

# Submit to App Store script
# Run with: ./submit-to-appstore.sh

set -e

echo "📱 Submitting Biztomate Scanner to App Store..."

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

# Check if EAS CLI is available
if ! npx eas-cli --version &> /dev/null; then
    print_error "EAS CLI is not available."
    exit 1
fi

# Check if logged in to Expo
if ! npx eas-cli whoami &> /dev/null; then
    print_error "Not logged in to Expo. Please run: npx eas-cli login"
    exit 1
fi

print_status "Starting submission process..."

# Step 1: Submit to App Store
print_status "Submitting to App Store..."
npx eas-cli submit --platform ios --profile production

print_success "Submission completed successfully!"
print_status "Next steps:"
echo "1. Check App Store Connect for the submission status"
echo "2. Review the app metadata and screenshots"
echo "3. Wait for Apple's review process"
echo "4. Monitor for any review feedback"
echo ""
print_warning "Important reminders:"
echo "- Make sure subscription products are configured in App Store Connect"
echo "- Verify all app metadata is complete"
echo "- Check that screenshots are uploaded"
echo "- Ensure privacy policy and terms are linked" 