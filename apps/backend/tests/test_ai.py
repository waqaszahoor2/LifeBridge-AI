def test_trust_check_returns_evidence(client):
    response = client.post(
        "/api/v1/ai/trust-check",
        json={"text": "URGENT send your OTP and pay a fee immediately", "url": "http://verify-account.example.com/login"},
    )
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["risk_score"] <= 1
    assert data["evidence"]
    assert data["risk_level"] in {"low", "medium", "high"}


def test_cv_analysis_extracts_skills(client):
    response = client.post(
        "/api/v1/ai/cv/analyze",
        json={"text": "Data analyst with 2 years experience using Python, SQL, Power BI, pandas and statistics. Contact test@example.com."},
    )
    assert response.status_code == 200
    data = response.json()
    assert "python" in data["extracted_skills"]
    assert data["recommended_roles"]


def test_disaster_risk_endpoint(client):
    response = client.post(
        "/api/v1/ai/disaster-risk",
        json={
            "rainfall_mm": 150,
            "river_level_m": 8,
            "soil_moisture": 0.9,
            "slope_degrees": 5,
            "temperature_c": 35,
            "wind_kph": 70,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 0.4
    assert data["drivers"]


def test_source_status(client):
    response = client.get("/api/v1/sources")
    assert response.status_code == 200
    keys = {item["key"] for item in response.json()}
    assert {"nasa_eonet", "gdacs", "open_meteo", "openstreetmap"}.issubset(keys)
