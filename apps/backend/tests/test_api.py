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


def test_feed_for_you_cursor_pagination(client):
    res1 = client.get("/api/v1/feed/for-you?limit=5")
    assert res1.status_code == 200
    body1 = res1.json()
    assert "items" in body1
    assert len(body1["items"]) <= 5
    assert body1["has_more"] is True
    assert body1["next_cursor"] is not None

    next_cursor = body1["next_cursor"]
    res2 = client.get(f"/api/v1/feed/for-you?limit=5&cursor={next_cursor}")
    assert res2.status_code == 200
    body2 = res2.json()
    assert "items" in body2
    # Ensure no duplicates between page 1 and page 2
    p1_ids = {i["id"] for i in body1["items"]}
    p2_ids = {i["id"] for i in body2["items"]}
    assert p1_ids.isdisjoint(p2_ids)


def test_feed_refresh_endpoint(client):
    res = client.post("/api/v1/feed/refresh")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "queued"
    assert "Feed refresh started" in data["message"]


def test_feed_report_endpoint(client):
    feed = client.get("/api/v1/feed?limit=1").json()
    item_id = feed[0]["id"]
    res = client.post(f"/api/v1/feed/{item_id}/report")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "received"

