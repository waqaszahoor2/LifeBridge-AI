def test_decision_graph_links_profile_to_sources(client):
    response = client.post(
        "/api/v1/ai/decision-graph",
        json={
            "skills": ["python", "sql"],
            "interests": ["scholarship"],
            "preferred_categories": ["job", "scholarship"],
            "country": "Pakistan",
            "max_items": 5,
        },
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["nodes"]
    assert any(edge["relation"] == "recommended" for edge in payload["edges"])
    assert payload["top_items"]
