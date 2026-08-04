#!/usr/bin/env python3
"""Create strong local secret values without printing private provider keys."""
from __future__ import annotations

import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "config" / "apis.env.example"
target = ROOT / "config" / "apis.env"

if target.exists():
    raise SystemExit(f"Refusing to overwrite {target}. Delete it explicitly to regenerate.")

text = source.read_text(encoding="utf-8")
text = text.replace("CHANGE_TO_A_RANDOM_64_CHARACTER_SECRET", secrets.token_urlsafe(64))
text = text.replace("CHANGE_TO_A_DIFFERENT_RANDOM_ADMIN_KEY", secrets.token_urlsafe(48))
target.write_text(text, encoding="utf-8")
print(f"Created {target}. Add optional provider credentials manually and never commit it.")
