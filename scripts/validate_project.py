#!/usr/bin/env python3
"""Offline structural validation for the complete project package."""
from __future__ import annotations

import ast
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md",
    "apps/backend/app/main.py",
    "apps/backend/app/worker.py",
    "apps/backend/Dockerfile",
    "apps/web/app/page.tsx",
    "apps/web/package.json",
    "apps/mobile/lib/main.dart",
    "apps/mobile/pubspec.yaml",
    "config/apis.env.example",
    "config/api_sources.yaml",
    "datasets/seed/feed_items.csv",
    "ml/models/scam_classifier.joblib",
    "docs/COMPONENTS.md",
    "research/OFFICIAL_SOURCE_REVIEW.md",
]
PLACEHOLDER_PATTERNS = [
    re.compile(r"AIza[0-9A-Za-z_-]{20,}"),
    re.compile(r"sk-[0-9A-Za-z]{20,}"),
    re.compile(r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"),
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    global failed
    failed = True


def check_required() -> None:
    for rel in REQUIRED:
        if not (ROOT / rel).exists():
            fail(f"Missing required component: {rel}")


def check_python() -> None:
    for path in ROOT.rglob("*.py"):
        if any(part in {".venv", "__pycache__"} for part in path.parts):
            continue
        try:
            ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        except Exception as exc:
            fail(f"Python syntax: {path.relative_to(ROOT)}: {exc}")


def check_json() -> None:
    for path in ROOT.rglob("*.json"):
        if any(part in {"node_modules", ".next", "build"} for part in path.parts):
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"JSON syntax: {path.relative_to(ROOT)}: {exc}")


def check_csv() -> None:
    for path in ROOT.rglob("*.csv"):
        with path.open(newline="", encoding="utf-8-sig") as handle:
            rows = list(csv.reader(handle))
        if not rows or not rows[0]:
            fail(f"Empty CSV: {path.relative_to(ROOT)}")


def check_secrets() -> None:
    allowed = {"apis.env.example", ".env.example", "local.properties.example", "key.properties.example"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.name in allowed or path.suffix.lower() in {".png", ".joblib", ".zip"}:
            continue
        if any(part in {".git", ".venv", "node_modules", "build", "__pycache__"} for part in path.parts):
            continue
        try:
            data = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for pattern in PLACEHOLDER_PATTERNS:
            if pattern.search(data):
                fail(f"Possible embedded secret in {path.relative_to(ROOT)}")


if __name__ == "__main__":
    failed = False
    check_required()
    check_python()
    check_json()
    check_csv()
    check_secrets()
    if failed:
        sys.exit(1)
    print("PASS: structural files, Python, JSON, CSV and basic secret scan")
