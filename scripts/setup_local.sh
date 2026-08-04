#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v python3 >/dev/null || { echo 'Python 3 is required.' >&2; exit 1; }
command -v node >/dev/null || { echo 'Node.js is required.' >&2; exit 1; }
[ -f "$ROOT/config/apis.env" ] || python3 "$ROOT/scripts/generate_secrets.py"
python3 -m venv "$ROOT/apps/backend/.venv"
"$ROOT/apps/backend/.venv/bin/pip" install --upgrade pip
"$ROOT/apps/backend/.venv/bin/pip" install -r "$ROOT/apps/backend/requirements.txt" -r "$ROOT/apps/backend/requirements-dev.txt"
(cd "$ROOT/apps/backend" && .venv/bin/alembic upgrade head)
(cd "$ROOT/apps/web" && npm install && { [ -f .env.local ] || cp .env.example .env.local; })
python3 "$ROOT/scripts/validate_project.py"
printf 'Setup complete. Review config/apis.env, then run scripts/run_local.sh.\n'
