# Security implementation notes

The code provides an academic-project security baseline, not a guarantee against compromise.

## Backend controls

- Pydantic input validation and bounded pagination/upload sizes.
- SQLAlchemy parameterised ORM access and Alembic migrations.
- Argon2 password hashing with password-complexity checks.
- Time-limited JWTs with issuer and audience validation.
- In-process IP request throttling for prototype use; replace or complement with gateway/Redis limits at scale.
- Request-body size limits, request IDs, trusted-host checks and controlled CORS.
- CSP, anti-framing, MIME-sniffing prevention, referrer and permissions headers; HSTS in production.
- Constant-time comparison for the administrative API key.
- Provider timeouts, disabled redirects and fixed official endpoints to reduce SSRF/availability risk.
- Private Firebase/API credentials loaded from backend environment files only.
- Audit records for administrator feed imports and refreshes.

## Frontend/mobile controls

- No private provider keys in Next.js public variables or Flutter source.
- Framework output escaping and safe external-link handling.
- HTTPS-only Android network policy for release use (`usesCleartextTraffic=false`).
- Android resource shrinking, code minification and optional Dart obfuscation.
- System/light/dark preference stored locally without sensitive profile data.

## Required before real use

Add privacy notices, consent/deletion/export workflows, gateway-level throttling, encrypted backups, central logs, dependency/container scanning, key rotation, abuse monitoring, incident response and an independent penetration test. Review OWASP ASVS controls appropriate to the system’s risk level.
