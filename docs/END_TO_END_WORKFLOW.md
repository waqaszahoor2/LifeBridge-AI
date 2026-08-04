# End-to-End Workflow

```text
Official APIs / authorised feeds / admin records
                    ↓
          scheduled source collectors
                    ↓
 validation → normalisation → deduplication → expiry check
                    ↓
              PostgreSQL/PostGIS
                    ↓
 AI layer: skill matching + trust risk + disaster risk
                    ↓
              FastAPI REST API
                    ↓
       Next.js web + Flutter Android app
                    ↓
  feed cards, maps, explanations, saves and notifications
```

## Development order

1. Copy `config/apis.env.example` to `config/apis.env`.
2. Train or reuse the included synthetic model artifacts.
3. Start PostgreSQL/Redis/backend using Docker Compose or SQLite locally.
4. Start the Next.js web interface.
5. Test API endpoints and feed timestamps.
6. Configure optional keys and authorised scholarship feeds.
7. Configure Flutter with the deployed backend URL.
8. Build a signed release APK.
9. Run security, dependency and functional checks.
