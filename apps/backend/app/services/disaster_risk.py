from app.core.config import get_settings
from app.services.model_loader import load_joblib

settings = get_settings()
MODEL_VERSION = "disaster-rf-v1"
FEATURES = ["rainfall_mm", "river_level_m", "soil_moisture", "slope_degrees", "temperature_c", "wind_kph"]


def predict(payload: dict) -> dict:
    values = [[float(payload[name]) for name in FEATURES]]
    model = load_joblib(settings.disaster_model_path)
    if model is not None:
        try:
            probability = float(model.predict_proba(values)[0][-1])
        except Exception:
            probability = _rules(payload)
    else:
        probability = _rules(payload)

    drivers: list[str] = []
    if payload["rainfall_mm"] >= 100:
        drivers.append("Very high rainfall")
    elif payload["rainfall_mm"] >= 50:
        drivers.append("High rainfall")
    if payload["river_level_m"] >= 7:
        drivers.append("Elevated river level")
    if payload["soil_moisture"] >= 0.75:
        drivers.append("Saturated soil")
    if payload["wind_kph"] >= 80:
        drivers.append("Damaging wind")
    if payload["temperature_c"] >= 45:
        drivers.append("Extreme heat")
    score = round(max(0.0, min(1.0, probability)), 3)
    level = "critical" if score >= 0.85 else "high" if score >= 0.65 else "medium" if score >= 0.35 else "low"
    return {"risk_score": score, "risk_level": level, "drivers": drivers or ["No dominant risk driver"], "model_version": MODEL_VERSION}


def _rules(p: dict) -> float:
    score = (
        min(p["rainfall_mm"] / 180, 1) * 0.28
        + min(p["river_level_m"] / 10, 1) * 0.23
        + p["soil_moisture"] * 0.18
        + min(p["wind_kph"] / 140, 1) * 0.14
        + max(0, min((p["temperature_c"] - 32) / 18, 1)) * 0.12
        + max(0, min((20 - p["slope_degrees"]) / 20, 1)) * 0.05
    )
    return score
