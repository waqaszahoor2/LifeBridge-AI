# Deployment matrix

| Component | Local | Hosted deployment |
|---|---|---|
| Next.js web | `npm run dev` | Vercel with Root Directory `apps/web` |
| FastAPI API | Uvicorn or Docker | Docker-capable web service |
| Feed worker | `python -m app.worker` | Separate Docker worker/service |
| Database | SQLite or Docker PostgreSQL/PostGIS | Managed PostgreSQL/PostGIS with backups |
| Redis | Docker container/fallback disabled | Managed Redis for shared caching |
| Flutter | Chrome/emulator/phone | Signed APK or Play Store AAB |
| Model artifacts | `ml/models` | Included in backend image or controlled model storage |
| Notifications | Disabled by default | Firebase Cloud Messaging service account on backend |

Vercel hosts the web client. It does not produce an APK and is not the recommended place for a persistent model worker or scheduled source collector.
