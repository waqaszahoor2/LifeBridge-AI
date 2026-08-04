$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Push-Location "$Root\apps\mobile"
flutter create . --platforms=android,web
flutter pub get
flutter analyze
Pop-Location
Write-Host "Flutter platform files created. Open apps\mobile in Android Studio."
