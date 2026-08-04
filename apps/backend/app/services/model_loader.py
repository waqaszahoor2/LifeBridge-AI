from functools import lru_cache
from pathlib import Path
import logging

import joblib

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache(maxsize=8)
def load_joblib(relative_path: str):
    path = settings.resolve_project_path(relative_path)
    if not path.exists():
        logger.warning("Model artifact not found: %s", path)
        return None
    try:
        return joblib.load(path)
    except Exception:
        logger.exception("Failed to load model artifact: %s", path)
        return None
