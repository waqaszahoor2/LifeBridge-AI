# Testing

## Backend

```bash
cd apps/backend
pip install -r requirements.txt -r requirements-dev.txt
pytest -q
```

## Web

```bash
cd apps/web
npm install
npm run lint
npm run build
```

## Flutter

```bash
cd apps/mobile
flutter create . --platforms=android,web
flutter pub get
flutter analyze
flutter test
```

## Manual acceptance tests

- resize web view to 360px, 768px, 1024px and 1440px;
- verify default theme follows the system;
- switch light/dark/system and reload;
- filter every feed category;
- stop backend and confirm the web fallback feed still renders;
- verify timestamps and source labels;
- verify urgent disasters appear above ordinary content;
- confirm admin endpoints reject missing or incorrect `X-Admin-Key`;
- confirm secrets are absent from browser bundles and APK source.
