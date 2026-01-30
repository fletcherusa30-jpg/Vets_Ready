#!/bin/bash
#
# Build Rally Forge iOS Application
# Requires macOS with Xcode installed
#

set -e

# Colors
INFO='\033[0;36m'
SUCCESS='\033[0;32m'
ERROR='\033[0;31m'
WARNING='\033[0;33m'
NC='\033[0m'

function step() { echo -e "\n${INFO}[STEP] $1${NC}"; }
function success() { echo -e "${SUCCESS}✓ $1${NC}"; }
function error() { echo -e "${ERROR}✗ $1${NC}"; exit 1; }
function warning() { echo -e "${WARNING}⚠ $1${NC}"; }

# Configuration
BUILD_CONFIG="${1:-Release}"
SKIP_SYNC="${SKIP_SYNC:-false}"
SKIP_PODS="${SKIP_PODS:-false}"

echo -e "\n${INFO}====================================================="
echo "     Rally Forge iOS Build"
echo "====================================================="
echo "Build Configuration: $BUILD_CONFIG"
echo "=====================================================${NC}\n"

# Verify macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    error "iOS builds require macOS"
fi

# Verify Xcode
step "Verifying Xcode..."
if ! command -v xcodebuild &> /dev/null; then
    error "Xcode not found. Please install from App Store."
fi
XCODE_VERSION=$(xcodebuild -version | head -n 1)
success "$XCODE_VERSION installed"

# Verify Node.js
step "Verifying Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js not found. Please install Node.js 18+"
fi
NODE_VERSION=$(node --version)
success "Node.js $NODE_VERSION installed"

# Verify CocoaPods
step "Verifying CocoaPods..."
if ! command -v pod &> /dev/null; then
    warning "CocoaPods not found. Installing..."
    sudo gem install cocoapods
fi
POD_VERSION=$(pod --version)
success "CocoaPods $POD_VERSION installed"

# Install frontend dependencies
step "Installing frontend dependencies..."
cd rally-forge-frontend
npm install
success "Frontend dependencies installed"

# Build frontend
step "Building frontend for production..."
export VITE_API_URL="https://api.RallyForge.com"
npm run build
success "Frontend built successfully"
cd ..

# Sync Capacitor (unless skipped)
if [ "$SKIP_SYNC" != "true" ]; then
    step "Syncing Capacitor with iOS..."
    cd rally-forge-mobile
    npx cap sync ios
    success "Capacitor synced"
    cd ..
fi

# Install CocoaPods (unless skipped)
if [ "$SKIP_PODS" != "true" ]; then
    step "Installing iOS dependencies (CocoaPods)..."
    cd ios/App
    pod install --repo-update
    success "CocoaPods installed"
    cd ../..
fi

# Clean build
step "Cleaning previous builds..."
cd ios/App
xcodebuild clean \
    -workspace App.xcworkspace \
    -scheme App \
    -configuration $BUILD_CONFIG
success "Build cleaned"

# Build iOS app
step "Building iOS application..."
xcodebuild archive \
    -workspace App.xcworkspace \
    -scheme App \
    -configuration $BUILD_CONFIG \
    -archivePath ./build/RallyForge.xcarchive \
    CODE_SIGN_STYLE=Automatic \
    -allowProvisioningUpdates

if [ $? -ne 0 ]; then
    warning "Archive build failed. This often requires:"
    echo "  1. Valid Apple Developer account"
    echo "  2. Provisioning profiles configured"
    echo "  3. Code signing certificates installed"
    echo "  4. Bundle ID registered on developer.apple.com"
    cd ../..
    exit 1
fi

success "iOS archive created"

# Export IPA
step "Exporting IPA..."

# Create export options plist
cat > ExportOptions.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF

xcodebuild -exportArchive \
    -archivePath ./build/RallyForge.xcarchive \
    -exportPath ./build \
    -exportOptionsPlist ExportOptions.plist

if [ $? -eq 0 ]; then
    success "IPA exported successfully"

    IPA_PATH="./build/App.ipa"
    if [ -f "$IPA_PATH" ]; then
        IPA_SIZE=$(du -h "$IPA_PATH" | cut -f1)
        echo -e "${INFO}  Location: $IPA_PATH${NC}"
        echo -e "${INFO}  Size: $IPA_SIZE${NC}"
    fi
else
    warning "IPA export failed. Update ExportOptions.plist with your Team ID."
fi

cd ../..

# Summary
echo -e "\n${SUCCESS}====================================================="
echo "     Build Complete!"
echo "=====================================================${NC}\n"

echo -e "${INFO}Output locations:${NC}"
echo -e "${WARNING}  Archive: ios/App/build/RallyForge.xcarchive${NC}"
echo -e "${WARNING}  IPA: ios/App/build/App.ipa${NC}"

echo -e "\n${INFO}Next steps:${NC}"
echo -e "${WARNING}  1. Test on simulator:${NC}"
echo -e "${WARNING}     cd ios/App && xcodebuild test -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15'${NC}"
echo -e "${WARNING}  2. Upload to App Store Connect:${NC}"
echo -e "${WARNING}     xcrun altool --upload-app --type ios --file ios/App/build/App.ipa --username YOUR_APPLE_ID --password YOUR_APP_SPECIFIC_PASSWORD${NC}"
echo -e "${WARNING}  3. Configure code signing and provisioning profiles${NC}"


