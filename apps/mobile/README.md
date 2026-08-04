# LifeBridge Flutter client

Included screens: personalised feed, opportunities, SkillBridge CV analysis, DisasterLink, VerifyLink, ServiceLink/accessible places and profile/theme controls.

```bash
flutter create . --platforms=android,web
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8000
```

Android emulator:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

Release helper:

```powershell
..\..\scripts\build_apk.ps1 -ApiBaseUrl "https://your-api.example"
```

Private provider keys must remain in the backend. Read `../../docs/APK_SETUP.md` and `../../docs/FIREBASE_SETUP.md`.
