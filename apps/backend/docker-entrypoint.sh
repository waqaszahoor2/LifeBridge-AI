#!/usr/bin/env sh
set -eu

MODE="${1:-api}"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  alembic upgrade head
fi

case "$MODE" in
  api)
    exec uvicorn app.main:app \
      --host 0.0.0.0 \
      --port "${PORT:-8000}" \
      --proxy-headers \
      --forwarded-allow-ips="${FORWARDED_ALLOW_IPS:-*}" \
      --workers "${WEB_CONCURRENCY:-1}"
    ;;
  worker)
    exec python -m app.worker
    ;;
  refresh-once)
    exec python -m app.worker --once
    ;;
  *)
    exec "$@"
    ;;
esac
