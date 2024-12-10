#!/bin/zsh

# Exit on error
set -e

# Check if Flutter is installed
echo "Verify Flutter is installed..."
if ! command -v flutter &> /dev/null; then
    echo "Error: Flutter is not installed"
    exit 1
fi

# Verify Flutter version
echo "Verify Flutter version..."
REQUIRED_VERSION=$(grep flutter .tool-versions | awk '{print $2}')
CURRENT_VERSION=$(flutter --version | head -n 1 | awk '{print $2}')
if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "Error: Flutter version $REQUIRED_VERSION is required (current: $CURRENT_VERSION)"
    exit 1
else
    echo "Required version: $REQUIRED_VERSION == Current version: $CURRENT_VERSION"
    echo "Flutter version is correct"
fi

echo "Cleaning Flutter build..."
flutter clean

echo "Getting dependencies..."
flutter pub get

echo "Running build runner..."
dart run build_runner build --delete-conflicting-outputs

echo "Generating localizations..."
flutter gen-l10n

echo "Build completed successfully!"
