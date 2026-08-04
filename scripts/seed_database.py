#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "backend"))

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.services.seed import seed_if_empty  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        print({"created": seed_if_empty(db)})
