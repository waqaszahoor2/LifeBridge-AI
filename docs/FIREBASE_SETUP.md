# Firebase Cloud Messaging setup

Firebase is optional. The feed works without it.

1. Create a Firebase project.
2. Register the Android app using package `com.lifebridge.ai`.
3. Place the public Android configuration at `apps/mobile/android/app/google-services.json`.
4. Generate a backend service account and store it outside source control, for example `config/secrets/firebase-service-account.json`.
5. Set in `config/apis.env`:

```env
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=config/secrets/firebase-service-account.json
```

6. Run `flutterfire configure` if using FlutterFire-generated options.
7. Request notification permission in the mobile user flow and register tokens through `/api/v1/notifications/tokens`.

The service-account JSON is private. Never embed it in Flutter, Next.js or a public repository.
