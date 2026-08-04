# Security Policy

## Reporting

Do not publish suspected vulnerabilities in a public issue. Send a private report to the project owner with reproduction steps, impact and affected version.

## Included protections

- API secrets are server-side environment variables only.
- Argon2 password hashing and time-limited JWTs.
- CORS and trusted-host allowlists.
- Security headers: CSP, HSTS (production), frame denial, MIME sniffing prevention and restrictive permissions policy.
- Request body size limit and input validation.
- Rate limiting on public and authentication endpoints.
- Constant-time comparison for the administrative API key.
- SQLAlchemy parameterised database access.
- Disabled debug mode by default in production.
- GitHub Actions tests and Dependabot updates.

## Production checklist

1. Replace `SECRET_KEY` and `ADMIN_API_KEY` with long random values.
2. Set `APP_ENV=production`, `FORCE_HTTPS=true`, exact `ALLOWED_ORIGINS`, and exact `TRUSTED_HOSTS`.
3. Use a managed PostgreSQL database with TLS, backups and least-privilege credentials.
4. Put the backend behind HTTPS, a WAF/reverse proxy and provider-level DDoS protection.
5. Enable central logs, alerting, dependency scanning and regular patching.
6. Perform a threat model and penetration test before processing real personal data.
7. Minimise data retention and provide deletion/export controls.

No checklist can make a system impossible to hack. Security requires continuous maintenance.
