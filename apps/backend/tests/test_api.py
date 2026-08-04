def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_feed_is_seeded(client):
    response = client.get("/api/v1/feed")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    assert data[0]["category"] in {"disaster", "weather", "job", "scholarship", "service", "safety", "learning"}


def test_recommendations_are_explainable(client):
    response = client.post(
        "/api/v1/recommendations",
        json={
            "skills": ["python", "sql", "data science"],
            "preferred_categories": ["job", "scholarship"],
            "country": "Pakistan",
            "interests": ["fully funded"],
            "limit": 5,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data
    assert 0 <= data[0]["score"] <= 1
    assert data[0]["reasons"]


def test_admin_requires_key(client):
    response = client.post("/api/v1/admin/refresh")
    assert response.status_code == 401
