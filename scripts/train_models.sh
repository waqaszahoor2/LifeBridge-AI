#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
python3 ml/scripts/train_all.py
printf 'Models written to ml/models. Bundled datasets are synthetic and for testing only.\n'
