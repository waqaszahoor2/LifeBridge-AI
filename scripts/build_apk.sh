#!/usr/bin/env bash
set -euo pipefail
API_BASE_URL="${1:?Usage: scripts/build_apk.sh https://api.example.com}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/apps/mobile"
flutter create . --platforms=android,web
flutter clean
flutter pub get
flutter analyze
flutter test
flutter build apk --release --obfuscate --split-debug-info=build/debug-info \
  --dart-define="API_BASE_URL=$API_BASE_URL"
printf 'APK: apps/mobile/build/app/outputs/flutter-apk/app-release.apk\n'
