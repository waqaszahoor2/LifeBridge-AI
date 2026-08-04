import math
import re
from urllib.parse import urlparse

from app.core.config import get_settings
from app.services.model_loader import load_joblib

settings = get_settings()
MODEL_VERSION = "scam-tfidf-logreg-v1"

RULES: list[tuple[re.Pattern, float, str]] = [
    (re.compile(r"\b(otp|one[- ]time password|verification code|pin)\b", re.I), 0.22, "Requests a credential or verification code"),
    (re.compile(r"\b(urgent|immediately|final warning|account.*suspend|act now)\b", re.I), 0.16, "Uses urgent or threatening language"),
    (re.compile(r"\b(pay|fee|deposit|transfer|gift card|crypto|wallet)\b", re.I), 0.12, "Requests money or a transfer"),
    (re.compile(r"\b(congratulations|winner|prize|lottery|selected)\b", re.I), 0.10, "Promises an unexpected reward"),
    (re.compile(r"\b(password|bank details|card number|cvv)\b", re.I), 0.24, "Requests sensitive financial information"),
]


def _url_features(url: str | None) -> tuple[float, list[str]]:
    if not url:
        return 0.0, []
    evidence: list[str] = []
    score = 0.0
    parsed = urlparse(url if "://" in url else f"https://{url}")
    host = (parsed.hostname or "").lower()
    if not host:
        return 0.2, ["URL hostname is invalid"]
    if host.replace(".", "").isdigit():
        score += 0.24
        evidence.append("URL uses an IP address instead of a normal domain")
    if host.count(".") >= 4:
        score += 0.12
        evidence.append("URL contains many subdomains")
    if any(token in host for token in ("xn--", "login-", "verify-", "secure-", "account-")):
        score += 0.16
        evidence.append("URL contains impersonation-style domain tokens")
    if len(url) > 120:
        score += 0.08
        evidence.append("URL is unusually long")
    if parsed.scheme != "https":
        score += 0.08
        evidence.append("URL does not use HTTPS")
    return min(score, 0.5), evidence


def analyze(text: str, url: str | None = None) -> dict:
    evidence: list[str] = []
    rule_score = 0.0
    for pattern, weight, reason in RULES:
        if pattern.search(text):
            rule_score += weight
            evidence.append(reason)

    model = load_joblib(settings.scam_model_path)
    model_score = 0.0
    if model is not None:
        try:
            model_score = float(model.predict_proba([text])[0][1])
        except Exception:
            model_score = 0.0

    url_score, url_evidence = _url_features(url)
    evidence.extend(url_evidence)
    # Blend the trainable text model with transparent rules. The logarithmic cap avoids >1 scores.
    blended = 0.58 * model_score + 0.32 * min(rule_score, 1.0) + 0.10 * min(url_score * 2, 1.0)
    risk_score = round(1 - math.exp(-1.5 * blended), 3)
    if risk_score >= 0.68:
        risk_level, label = "high", "likely_scam"
    elif risk_score >= 0.38:
        risk_level, label = "medium", "suspicious"
    else:
        risk_level, label = "low", "likely_legitimate"
    if not evidence:
        evidence.append("No strong rule-based scam indicator was detected")
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "label": label,
        "evidence": evidence[:8],
        "safe_actions": [
            "Do not share passwords, OTPs or payment details",
            "Open the organisation's official website independently",
            "Verify the sender using an official phone number or account",
        ],
        "model_version": MODEL_VERSION,
    }
