import logging
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
_firebase_app = None


def firebase_ready() -> bool:
    return bool(settings.firebase_enabled and settings.firebase_service_account_path)


def _get_app():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app
    if not firebase_ready():
        return None
    try:
        import firebase_admin
        from firebase_admin import credentials
        path = settings.resolve_project_path(settings.firebase_service_account_path)
        if not Path(path).exists():
            return None
        _firebase_app = firebase_admin.initialize_app(credentials.Certificate(str(path)))
        return _firebase_app
    except Exception:
        logger.exception("Firebase initialization failed")
        return None


def send_topic_notification(topic: str, title: str, body: str, data: dict[str, str] | None = None) -> str | None:
    app = _get_app()
    if app is None:
        return None
    from firebase_admin import messaging
    message = messaging.Message(
        notification=messaging.Notification(title=title[:120], body=body[:500]),
        data=data or {},
        topic=topic,
    )
    return messaging.send(message, app=app)
