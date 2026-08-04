def test_admin_csv_import(client):
    csv_body = """external_id,category,title,summary,source_name,source_url,image_url,published_at,expires_at,location,country_code,latitude,longitude,tags,severity,verification_status,source_reliability,funding_type,study_level,employment_type,salary_text,eligibility
verified-scholarship-1,scholarship,Verified test scholarship,Official test record for import validation,Official Provider,https://example.org/program,,2026-08-04T10:00:00Z,2026-09-30T23:59:59Z,Global,,,,data-science;funding,low,verified,0.95,Fully funded,Masters,,,Published eligibility applies
"""
    response = client.post(
        "/api/v1/admin/feed-items/import-csv",
        headers={"X-Admin-Key": "development-admin-key"},
        files={"file": ("feed.csv", csv_body, "text/csv")},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["imported"] == 1
    assert payload["error_count"] == 0

    feed = client.get("/api/v1/feed?category=scholarship").json()
    assert any(item["external_id"] == "verified-scholarship-1" for item in feed)
