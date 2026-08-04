# Infrastructure templates

- `render.yaml`: API + worker + PostgreSQL blueprint example.
- `railway.toml`: Docker deployment settings for the API service. Deploy a second service with command `./docker-entrypoint.sh worker` for scheduled collectors.
- `fly.toml.example`: Fly.io API template; store secrets with the provider CLI.
- `docker-compose.yml` at the repository root: local PostgreSQL/PostGIS, Redis, API, worker and optional web container.

Never commit production secrets. Set `APP_ENV=production`, replace all default keys, use HTTPS, restrict CORS/trusted hosts, disable demo data, and configure database backups.
