#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "backend"))

from app.worker import refresh_once  # noqa: E402

if __name__ == "__main__":
    print(asyncio.run(refresh_once()))
