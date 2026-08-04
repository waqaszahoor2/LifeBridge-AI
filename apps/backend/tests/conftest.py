import os
from pathlib import Path

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_lifebridge.db")
os.environ.setdefault("TRUSTED_HOSTS", "testserver,localhost,127.0.0.1")
os.environ.setdefault("ALLOWED_ORIGINS", "http://testserver")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session", autouse=True)
def cleanup_database():
    path = Path("test_lifebridge.db")
    if path.exists():
        try:
            path.unlink()
        except PermissionError:
            pass
    yield
    if path.exists():
        try:
            path.unlink()
        except PermissionError:
            pass


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
