# Flutter and APK setup

The archive contains Android and web scaffold files. Run `flutter create . --platforms=android,web` once to repair/update generated files for your installed stable Flutter version.

## Bootstrap

```bash
cd apps/mobile
flutter create . --platforms=android,web
flutter pub get
flutter analyze
```

Open `apps/mobile` in Android Studio, not only its `android` subfolder.

## Run

```bash
# Android emulator
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000

# Real phone or deployed API
flutter run --dart-define=API_BASE_URL=https://YOUR-BACKEND-DOMAIN
```

## Signing

For direct project demonstrations the Gradle file can fall back to the debug certificate. Before public distribution, create and safely back up a private upload key:

```powershell
.\scripts\generate_android_keystore.ps1
```

Never commit `android/key.properties` or the `.jks` file.

## Release APK

```bash
flutter build apk --release --obfuscate --split-debug-info=build/debug-info \
  --dart-define=API_BASE_URL=https://YOUR-BACKEND-DOMAIN
```

Output:

```text
apps/mobile/build/app/outputs/flutter-apk/app-release.apk
```

Keep `build/debug-info` privately for symbolication. For Google Play, use `flutter build appbundle --release` with the same define/obfuscation settings.
