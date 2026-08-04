#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -x "$ROOT/apps/backend/.venv/bin/uvicorn" ] || { echo 'Run scripts/setup_local.sh first.' >&2; exit 1; }
trap 'kill 0' EXIT
(cd "$ROOT/apps/backend" && .venv/bin/uvicorn app.main:app --reload --port 8000) &
(cd "$ROOT/apps/web" && npm run dev) &
wait
