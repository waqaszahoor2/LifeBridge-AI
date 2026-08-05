import pytest

def test_assistant_health_endpoint(client):
    response = client.get("/api/v1/assistant/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "provider" in data
    assert "configured" in data
    assert "provider_verified" in data
    assert "model" in data
    assert "last_verified_at" in data
    assert "api_key" not in data  # Ensure secrets are never leaked


def test_assistant_chat_endpoint(client):
    response = client.post(
        "/api/v1/assistant/chat",
        json={
            "messages": [
                {"role": "user", "content": "How do I start learning Data Science with Python?"}
            ],
            "mode": "skill_coach",
            "temperature": 0.7,
            "max_tokens": 512,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"]["role"] == "assistant"
    assert len(data["message"]["content"]) > 5
    assert "reply" in data
    assert "model" in data
    assert "conversation_id" in data


def test_assistant_chat_multi_turn(client):
    response = client.post(
        "/api/v1/assistant/chat",
        json={
            "messages": [
                {"role": "user", "content": "I want to learn Python."},
                {"role": "assistant", "content": "Python is a great choice! What level are you starting from?"},
                {"role": "user", "content": "I am a complete beginner."}
            ],
            "mode": "lifebridge_assistant",
            "temperature": 0.5,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["status"] in ["success", "fallback"]
