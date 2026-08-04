# Complete component inventory

## Product clients

| Component | Directory | Main responsibility |
|---|---|---|
| Responsive web | `apps/web` | LinkedIn-style feed, opportunities, disaster, trust, services, profile, saved, themes |
| Flutter client | `apps/mobile` | Android/web screens, API client, responsive navigation, APK/AAB setup |

## Backend services

| Component | Main files | Responsibility |
|---|---|---|
| API application | `app/main.py`, `app/api/` | REST endpoints and lifecycle |
| Feed worker | `app/worker.py` | Scheduled source refresh outside web workers |
| Authentication | `core/security.py`, `routes/auth.py` | Argon2, JWT, users/admin access |
| Security middleware | `core/middleware.py` | rate limit, body size, request IDs and headers |
| Database | `models.py`, `core/database.py`, `alembic/` | feed, user, saved, notifications, sources and audit data |
| Recommendations | `services/recommendation.py` | relevance, location, freshness, trust and urgency ranking |
| Trust analysis | `services/scam_detection.py` | baseline message/URL risk evidence |
| CV analysis | `services/cv_analysis.py` | skill extraction and role matches |
| Disaster risk | `services/disaster_risk.py` | baseline risk inference |
| Nearby services | `services/nearby_services.py` | OpenStreetMap/Overpass service queries |
| Notifications | `services/notifications.py` | optional Firebase topic messages |
| Admin ingestion | `routes/admin.py` | single post, validated CSV import and source refresh |

## Data collectors

- NASA EONET
- GDACS
- Open-Meteo
- ReliefWeb
- USAJOBS
- Adzuna
- authorised RSS/Atom feeds

Configuration and source terms are separated from code under `config/` and `research/`.

## ML and research

- reproducible training scripts in `ml/scripts`;
- persisted baseline artifacts and metrics in `ml/models`;
- model cards in `ml/model_cards`;
- synthetic dataset cards and templates in `datasets`;
- official-source registry and review method in `research`;
- claim/evidence policy and paper outline in `docs`.

## Deployment and operations

- Dockerfiles for API and web;
- Docker Compose for PostgreSQL/PostGIS, Redis, API, worker and optional web;
- Vercel-ready Next.js config;
- Render, Railway and Fly.io examples under `infra`;
- Android signing and APK scripts;
- OpenAPI and Postman collection;
- CI, CodeQL, dependency review, Dependabot and secret scanning;
- structural validation, model training, source refresh and database seed scripts.
