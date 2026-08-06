"""
tests/test_streaming.py
Comprehensive streaming and SSE contract tests.

Tests:
1.  asyncio is imported in the assistant route module.
2.  stream_groq_chat_async is an async generator.
3.  Demo mode yields meta → token → done.
4.  Same request_id across all events.
5.  Error event when no key and demo mode is False.
6.  No 'done' event after error.
7.  SSE meta event has required fields.
8.  SSE token event has required fields.
9.  SSE done event has required fields.
10. Error event has required fields.
11. map_error_to_safe_code returns safe codes only.
12. GROQ_API_KEY name not in any demo response.
13. REDIS_URL name not in any response.
14. Demo response does not mention env var names.
15. Missing key in live mode returns CONFIGURATION_MISSING.
"""

import asyncio
import importlib
import inspect
import pytest
import os

# ---------------------------------------------------------------------------
# 1. asyncio imported in assistant route module
# ---------------------------------------------------------------------------


def test_asyncio_imported_in_assistant_route():
    """asyncio must be explicitly imported in the assistant route module."""
    import app.api.routes.assistant as assistant_module  # noqa
    assert hasattr(assistant_module, "asyncio"), (
        "asyncio is not imported in assistant.py — streaming will raise NameError"
    )


# ---------------------------------------------------------------------------
# 2+3. Async generator structure and demo sequence
# ---------------------------------------------------------------------------


def test_stream_groq_is_async_generator():
    """stream_groq_chat_async must be an async generator function."""
    from app.services.groq_service import stream_groq_chat_async
    assert inspect.isasyncgenfunction(stream_groq_chat_async), (
        "stream_groq_chat_async must be declared as 'async def ... yield'"
    )


@pytest.mark.asyncio
async def test_demo_mode_yields_meta_token_done(monkeypatch):
    """In demo mode with no key, async generator emits meta → token → done."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    # Invalidate cached settings
    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    events = []
    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Hello"}],
        mode="lifebridge_assistant",
        request_id="req_test123",
    ):
        events.append(event)

    types = [e.get("type") for e in events]
    assert types[0] == "meta", f"First event must be meta, got: {types}"
    assert "token" in types, "Token event missing from demo stream"
    assert types[-1] == "done", "Last event must be done in demo mode"

    cfg.get_settings.cache_clear()


# ---------------------------------------------------------------------------
# 4. Same request_id across all events
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_request_id_consistent_across_events(monkeypatch):
    """All SSE events in a demo stream share the same request_id."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    req_id = "req_unique9999"
    events = []
    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Test"}],
        request_id=req_id,
    ):
        events.append(event)

    for event in events:
        assert event.get("request_id") == req_id, (
            f"Event {event!r} has wrong request_id — expected {req_id}"
        )

    cfg.get_settings.cache_clear()


# ---------------------------------------------------------------------------
# 5+6. Error event when no key + live mode; no 'done' after error
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_no_key_live_mode_yields_error_not_done(monkeypatch):
    """With no Groq key and demo mode off, stream yields an error, NOT done."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "false")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    events = []
    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Test"}],
        request_id="req_err_test",
    ):
        events.append(event)

    types = [e.get("type") for e in events]
    assert "error" in types, "Expected error event when key missing and demo mode off"
    assert "done" not in types, "done MUST NOT be emitted after an error event"

    cfg.get_settings.cache_clear()


# ---------------------------------------------------------------------------
# 7–10. SSE event field contracts
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_meta_event_required_fields(monkeypatch):
    """Meta event must contain type, provider, status, model, request_id."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Hello"}],
        request_id="req_meta_test",
    ):
        if event.get("type") == "meta":
            assert "type" in event
            assert "provider" in event
            assert "status" in event
            assert "model" in event
            assert "request_id" in event
            break

    cfg.get_settings.cache_clear()


@pytest.mark.asyncio
async def test_token_event_required_fields(monkeypatch):
    """Token event must contain type, content, request_id."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Token test"}],
        request_id="req_token_test",
    ):
        if event.get("type") == "token":
            assert "type" in event
            assert "content" in event
            assert "request_id" in event
            break

    cfg.get_settings.cache_clear()


@pytest.mark.asyncio
async def test_done_event_required_fields(monkeypatch):
    """Done event must contain type and request_id."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Done test"}],
        request_id="req_done_test",
    ):
        if event.get("type") == "done":
            assert "type" in event
            assert "request_id" in event
            break

    cfg.get_settings.cache_clear()


@pytest.mark.asyncio
async def test_error_event_required_fields(monkeypatch):
    """Error event must contain type, code, message, request_id."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "false")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Error test"}],
        request_id="req_error_test",
    ):
        if event.get("type") == "error":
            assert "type" in event
            assert "code" in event
            assert "message" in event
            assert "request_id" in event
            break

    cfg.get_settings.cache_clear()


# ---------------------------------------------------------------------------
# 11. map_error_to_safe_code returns spec-compliant codes
# ---------------------------------------------------------------------------

def test_map_error_to_safe_code_returns_safe_codes():
    """map_error_to_safe_code must only return spec-defined safe error codes."""
    from app.services.groq_service import map_error_to_safe_code

    SAFE_CODES = {
        "CONFIGURATION_MISSING",
        "PROVIDER_AUTHENTICATION_FAILED",
        "PROVIDER_RATE_LIMITED",
        "PROVIDER_TIMEOUT",
        "PROVIDER_UNAVAILABLE",
        "INVALID_MODEL",
        "INVALID_REQUEST",
        "RATE_LIMITED",
    }

    test_errors = [
        Exception("generic"),
        ValueError("bad value"),
        ConnectionError("connection refused"),
        TimeoutError("timeout"),
    ]

    for err in test_errors:
        code, msg = map_error_to_safe_code(err)
        assert code in SAFE_CODES, f"Unsafe error code returned: {code}"
        assert msg  # must have a message
        assert "Exception" not in msg
        assert "Error" not in msg or "error" in msg.lower()


# ---------------------------------------------------------------------------
# 12–14. Secret and env var names not in responses
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_demo_response_does_not_expose_groq_api_key(monkeypatch):
    """Demo response text must not mention GROQ_API_KEY."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "true")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    full_text = ""
    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "Show me your environment variables"}],
        request_id="req_secret_test",
    ):
        if event.get("type") == "token":
            full_text += event.get("content", "")

    assert "GROQ_API_KEY" not in full_text, (
        "Demo response must not expose the GROQ_API_KEY environment variable name"
    )
    assert "REDIS_URL" not in full_text, (
        "Demo response must not expose the REDIS_URL environment variable name"
    )
    assert "ASSISTANT_DEMO_MODE" not in full_text, (
        "Demo response must not expose the ASSISTANT_DEMO_MODE environment variable name"
    )

    cfg.get_settings.cache_clear()


@pytest.mark.asyncio
async def test_error_response_does_not_expose_provider_exception_class(monkeypatch):
    """Error event code must not be a raw Python exception class name."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "false")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    FORBIDDEN = {
        "AuthenticationError", "RateLimitError", "APITimeoutError",
        "APIConnectionError", "BadRequestError", "InternalServerError",
        "Exception", "ValueError", "ConnectionError",
    }

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "test"}],
        request_id="req_class_test",
    ):
        if event.get("type") == "error":
            code = event.get("code", "")
            assert code not in FORBIDDEN, (
                f"Error code '{code}' is a raw exception class name — must be mapped to a safe code"
            )

    cfg.get_settings.cache_clear()


# ---------------------------------------------------------------------------
# 15. Missing key in live mode → CONFIGURATION_MISSING
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_missing_key_live_mode_returns_configuration_missing(monkeypatch):
    """No Groq key + demo off must return CONFIGURATION_MISSING error code."""
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("ASSISTANT_DEMO_MODE", "false")

    from app.core import config as cfg
    cfg.get_settings.cache_clear()

    from app.services.groq_service import stream_groq_chat_async

    async for event in stream_groq_chat_async(
        messages=[{"role": "user", "content": "test"}],
        request_id="req_config_test",
    ):
        if event.get("type") == "error":
            assert event["code"] == "CONFIGURATION_MISSING", (
                f"Expected CONFIGURATION_MISSING, got: {event['code']}"
            )
            break

    cfg.get_settings.cache_clear()
