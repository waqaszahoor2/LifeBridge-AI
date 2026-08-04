def test_register_login_and_profile(client):
    payload = {
        "email": "student@example.com",
        "password": "StrongPassword!42",
        "display_name": "Student User",
        "country": "Pakistan",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    profile = client.get("/api/v1/profile", headers=headers)
    assert profile.status_code == 200
    updated = client.patch(
        "/api/v1/profile",
        headers=headers,
        json={"city": "Lahore", "skills": ["python", "sql"], "preferred_categories": ["job", "scholarship"]},
    )
    assert updated.status_code == 200
    assert updated.json()["city"] == "Lahore"


def test_weak_password_is_rejected(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "password1234", "display_name": "Weak User", "country": ""},
    )
    assert response.status_code == 422


def test_profile_export_and_delete(client):
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "privacy@example.com",
            "password": "StrongPass123!",
            "display_name": "Privacy User",
            "country": "Pakistan",
        },
    )
    assert register.status_code == 201
    token = register.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    exported = client.get("/api/v1/profile/export", headers=headers)
    assert exported.status_code == 200
    assert exported.json()["profile"]["email"] == "privacy@example.com"
    deleted = client.delete("/api/v1/profile", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/v1/profile", headers=headers).status_code == 401
