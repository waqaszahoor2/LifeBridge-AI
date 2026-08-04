# Local Setup

## Prerequisites

- Python 3.12+
- Node.js 20.9+
- npm
- Flutter stable and Android Studio for APK work
- Docker Desktop (optional)

## Option A: SQLite, fastest

Backend terminal:

```bash
cp config/apis.env.example config/apis.env
cd apps/backend
python -m venv .venv
# activate environment
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Web terminal:

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

## Option B: PostgreSQL through Docker

```bash
cp config/apis.env.example config/apis.env
docker compose up --build
```

Then run the web frontend separately with `npm run dev`.

## URLs

- web: http://localhost:3000
- backend: http://localhost:8000
- API docs: http://localhost:8000/docs
- health: http://localhost:8000/api/v1/health
