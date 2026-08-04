from datetime import UTC

from app.services.collectors.common import parse_datetime, stable_id, text
from app.services.collectors.open_meteo import weather_severity


def test_collector_helpers_are_deterministic():
    assert stable_id("source", "a", "b") == stable_id("source", "a", "b")
    assert len(text("  hello   world  ", 20)) <= 20
    assert parse_datetime("2026-08-04T10:00:00Z").tzinfo == UTC


def test_weather_severity_flags_extremes():
    severity, reasons = weather_severity(
        {"wind_speed_10m": 75, "precipitation": 30, "apparent_temperature": 46}
    )
    assert severity == "high"
    assert len(reasons) >= 2
