# Core data dictionary

## Feed item timestamps

- `published_at`: time stated by the original source.
- `collected_at`: first time LifeBridge stored the record.
- `last_checked_at`: latest successful source verification.
- `updated_at`: latest database modification.
- `expires_at`: deadline or end-of-validity when known.

## Trust fields

- `verification_status`: `demo`, `unverified`, `community` or `verified`.
- `source_reliability`: operator-assigned 0–1 source-quality input; not a certainty score.
- `severity`: `low`, `medium`, `high` or `critical` for prioritisation.
- `raw_json`: source payload retained only when permitted and needed for traceability.

## Opportunity fields

- `funding_type`, `study_level`, `eligibility` for scholarships.
- `employment_type`, `salary_text` for jobs.
- `tags` stores semicolon-separated normalized terms.

## Geospatial fields

- `location`: human-readable area.
- `country_code`: short country identifier when supplied.
- `latitude`, `longitude`: optional WGS84 coordinates.
