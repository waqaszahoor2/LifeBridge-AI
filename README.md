# LifeBridge AI — Complete End-to-End Project

LifeBridge AI is a final-year data science platform that combines a personalised LinkedIn-style feed, jobs and scholarship discovery, disaster/weather awareness, accessibility-aware services, scam/trust checks, skill matching and Android delivery.

The package is designed to run in four modes:

1. **Local development:** FastAPI + SQLite + Next.js.
2. **Full local stack:** Docker Compose + PostgreSQL/PostGIS + Redis + API + worker + optional web container.
3. **Cloud web:** Next.js on Vercel with the FastAPI API/worker on a Docker host.
4. **Android:** Flutter release APK/AAB using the same backend.

## What is included

```text
apps/web       Responsive Next.js 16.3 frontend for Vercel
apps/mobile    Flutter Android/web client with system/light/dark themes
apps/backend   FastAPI API, authentication, collectors, AI services and worker
ml             Training pipelines, metrics and baseline model artifacts
config         One central API/environment configuration file
infra          Docker-host deployment templates
postman        Importable API collection
research       Official-source review, registry and evaluation method
datasets       Synthetic test data, schemas and admin-import templates
docs           Architecture, setup, security, deployment and user/admin guides
scripts        Setup, validation, training, refresh, signing and APK helpers
```

See `COMPONENT_INDEX.md` and `COMPONENT_INDEX.csv` for the complete component inventory.

## Core product modules

- **LifeBridge Feed:** jobs, scholarships, disasters, weather, services, safety and learning posts with published/collected/last-checked timestamps.
- **SkillBridge:** CV skill extraction, role matching and explainable recommendation scores.
- **DisasterLink:** NASA EONET, GDACS, ReliefWeb and Open-Meteo integrations plus a test risk model.
- **AccessLink / ServiceLink:** nearby hospitals, clinics, shelters and essential services through OpenStreetMap/Overpass.
- **VerifyLink:** message and URL risk analysis with evidence and safe-action guidance.
- **Opportunity Hub:** API-based jobs, authorised RSS/Atom feeds and admin-verified scholarship/job imports.
- **Notifications:** optional Firebase Cloud Messaging backend integration.

## API policy

The core demo needs no paid API key. No-key sources are enabled by default where appropriate. Optional services use placeholders in one file:

```text
config/apis.env
```

Create it safely:

```bash
python scripts/generate_secrets.py
```

Then add only the credentials you have obtained from the official providers. Never place secrets in Flutter, Next.js client code or Git.

## Fastest local start

### Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope Process Bypass
python scripts\generate_secrets.py
.\scripts\setup_local.ps1
.\scripts\run_local.ps1
```

### Linux/macOS

```bash
python3 scripts/generate_secrets.py
./scripts/setup_local.sh
./scripts/run_local.sh
```

Open:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Readiness: `http://localhost:8000/api/v1/health/ready`

The local API uses SQLite by default and seeds synthetic demo records.

## Full Docker stack

```bash
python scripts/generate_secrets.py
# Review config/apis.env and replace local defaults before public deployment.
docker compose up --build
```

To include the containerised web client:

```bash
docker compose --profile full up --build
```

The worker is a separate process so multiple API workers do not poll data providers repeatedly.

## Model training

```bash
python ml/scripts/train_all.py
```

The bundled models are reproducible baselines trained on synthetic test data. They are suitable for demonstrations and pipeline testing, not real-world safety claims.

## Vercel deployment

Deploy only `apps/web` to Vercel:

```text
Root Directory: apps/web
Environment variable:
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.example
```

Deploy `apps/backend` and its worker separately using Docker. Templates are under `infra/`.

## Android APK

Open `apps/mobile` in Android Studio after Flutter setup, or run:

```powershell
.\scripts\bootstrap_flutter.ps1
.\scripts\build_apk.ps1 -ApiBaseUrl "https://your-api-domain.example"
```

The APK is written to:

```text
apps/mobile/build/app/outputs/flutter-apk/app-release.apk
```

For public distribution, generate a private upload keystore first:

```powershell
.\scripts\generate_android_keystore.ps1
```

## Testing and validation

```bash
python scripts/validate_project.py
cd apps/backend && pytest
cd ../web && npm install && npm run lint && npm run build
cd ../mobile && flutter analyze && flutter test
```

The package includes CI, dependency updates, CodeQL, dependency review and secret scanning. Security controls reduce common risks but do not make any application impossible to hack. Production operation still requires timely updates, HTTPS, backups, monitoring, key rotation, least privilege and an independent security review.

## Data and research limits

“Research every website” is not a technically or legally supportable claim. The included research focuses on official APIs, government/institutional sources, authorised feeds and documented open datasets. The project deliberately excludes unauthorised Google result-page and social-media scraping. Review `research/OFFICIAL_SOURCE_REVIEW.md` and `research/source_registry.csv`.

## Licence

Project source is provided under the repository `LICENSE`. External data, models, APIs, logos and provider names remain subject to their own licences and terms. Read `THIRD_PARTY_NOTICES.md` before public or commercial use.
