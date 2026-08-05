import pytest

def test_assistant_chat_endpoint(client):
    response = client.post(
        "/api/v1/assistant/chat",
        json={
            "messages": [
                {"role": "user", "content": "How do I start learning Data Science with Python?"}
            ],
            "temperature": 0.7,
            "max_tokens": 512,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 5
    assert "model_used" in data
    assert "status" in data


def test_assistant_chat_multi_turn(client):
    response = client.post(
        "/api/v1/assistant/chat",
        json={
            "messages": [
                {"role": "user", "content": "I want to learn Python."},
                {"role": "assistant", "content": "Python is a great choice! What level are you starting from?"},
                {"role": "user", "content": "I am a complete beginner."}
            ],
            "temperature": 0.5,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["status"] in ["success", "fallback"]
