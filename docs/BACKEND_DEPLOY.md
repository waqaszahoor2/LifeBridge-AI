# Backend deployment

Deploy two services from the same Docker image:

1. **API command:** `./docker-entrypoint.sh api`
2. **Worker command:** `./docker-entrypoint.sh worker`

## Required production variables

```text
APP_ENV=production
DEBUG=false
SECRET_KEY=<long random value>
ADMIN_API_KEY=<different long random value>
DATABASE_URL=<managed PostgreSQL TLS URL>
REDIS_URL=<managed Redis TLS URL when available>
ALLOWED_ORIGINS=https://your-vercel-domain
TRUSTED_HOSTS=your-backend-domain
FORCE_HTTPS=true
ENABLE_DEMO_SEED=false
ENABLE_SCHEDULER=false
```

Build locally:

```bash
docker build -f apps/backend/Dockerfile -t lifebridge-api .
docker run --env-file config/apis.env -e DATABASE_URL=... -p 8000:8000 lifebridge-api api
docker run --env-file config/apis.env -e DATABASE_URL=... lifebridge-api worker
```

The entrypoint runs Alembic migrations by default. Set `RUN_MIGRATIONS=false` on worker replicas. Keep one logical collector worker unless a distributed lock/queue is introduced.
