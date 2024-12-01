#!/bin/zsh

flutter clean
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter gen-l10n