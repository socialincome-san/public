#!/bin/zsh

# Exit on error
set -e

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "Error: Flutter is not installed"
    exit 1
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