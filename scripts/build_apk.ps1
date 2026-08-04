param([Parameter(Mandatory=$true)][string]$ApiBaseUrl)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Push-Location "$Root\apps\mobile"
flutter create . --platforms=android,web
flutter clean
flutter pub get
flutter analyze
flutter test
flutter build apk --release --obfuscate --split-debug-info=build/debug-info --dart-define="API_BASE_URL=$ApiBaseUrl"
Pop-Location
Write-Host "APK: apps\mobile\build\app\outputs\flutter-apk\app-release.apk"
Write-Host "Keep apps\mobile\build\debug-info for crash symbolication."
