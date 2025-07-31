#!/bin/bash

# Biztomate Scanner - TestFlight Deployment Script
# This script builds and deploys the app to TestFlight automatically

set -e  # Exit on any error

echo "🚀 Starting Biztomate Scanner TestFlight Deployment..."

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
if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
    print_error "This script must be run from the Biztomate Scanner project root directory"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI is not installed. Please install it with: npm install -g @expo/eas-cli"
    exit 1
fi

# Check if logged in to EAS
print_status "Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    print_error "Not logged in to EAS. Please run: eas login"
    exit 1
fi

# Clean up any existing processes
print_status "Cleaning up existing processes..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run Expo doctor to check for issues
print_status "Running Expo doctor..."
npx expo-doctor || {
    print_warning "Expo doctor found some issues, but continuing with build..."
}

# Update version and build number
print_status "Updating version information..."
CURRENT_VERSION=$(node -p "require('./app.json').expo.version")
CURRENT_BUILD=$(node -p "require('./app.json').expo.ios.buildNumber")
NEW_BUILD=$((CURRENT_BUILD + 1))

# Update app.json with new build number
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
appJson.expo.ios.buildNumber = '$NEW_BUILD';
fs.writeFileSync('./app.json', JSON.stringify(appJson, null, 2));
"

print_success "Updated build number to $NEW_BUILD"

# Build for production
print_status "Building for production..."
eas build --platform ios --profile production --non-interactive

# Wait for build to complete
print_status "Waiting for build to complete..."
BUILD_ID=$(eas build:list --platform ios --limit 1 --json | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8'))[0].id")

print_status "Build ID: $BUILD_ID"

# Poll build status
while true; do
    STATUS=$(eas build:view $BUILD_ID --json | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).status")
    
    case $STATUS in
        "finished")
            print_success "Build completed successfully!"
            break
            ;;
        "errored")
            print_error "Build failed!"
            eas build:view $BUILD_ID
            exit 1
            ;;
        "in-queue"|"in-progress")
            print_status "Build in progress... (Status: $STATUS)"
            sleep 30
            ;;
        *)
            print_warning "Unknown build status: $STATUS"
            sleep 30
            ;;
    esac
done

# Submit to TestFlight
print_status "Submitting to TestFlight..."
eas submit --platform ios --non-interactive

print_success "🎉 Deployment to TestFlight completed successfully!"
print_success "Build Number: $NEW_BUILD"
print_success "Version: $CURRENT_VERSION"
print_status "The app should appear in TestFlight within 10-30 minutes"

# Clean up
print_status "Cleaning up..."
rm -rf node_modules/.cache || true

print_success "✅ Deployment script completed!" 