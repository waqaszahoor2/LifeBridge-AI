from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_analyze_skill_goal():
    payload = {
        "raw_goal": "I know basic Python and SQL. I want to learn Data Science in 6 months.",
        "current_level": "Beginner",
        "known_skills": ["Python", "SQL"],
        "hours_per_day": 1.5,
        "days_per_week": 5
    }
    response = client.post("/api/v1/skills/mentor/analyze-goal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_skill"] == "Data Science"
    assert data["hours_per_week"] == 7.5


def test_generate_roadmap():
    payload = {
        "raw_goal": "I want to become a Python developer in 3 months",
        "target_skill": "Python",
        "current_level": "Beginner",
        "hours_per_day": 2,
        "days_per_week": 5
    }
    response = client.post("/api/v1/skills/mentor/generate-roadmap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "roadmap_id" in data
    assert len(data["phases"]) == 7
    assert len(data["ai_workflows"]) >= 1
    assert len(data["tools"]) >= 1
    assert "weeks" in data["schedule"]


def test_mentor_chat():
    payload = {
        "roadmap_id": "rm_demo123",
        "user_message": "Give me a practice exercise for Python",
        "current_phase_number": 1
    }
    response = client.post("/api/v1/skills/mentor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "disclaimer" in data
