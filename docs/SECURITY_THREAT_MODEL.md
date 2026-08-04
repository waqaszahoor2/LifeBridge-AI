# Security Threat Model

## Main threats

| Threat | Mitigation included |
|---|---|
| API-key leakage | Backend-only environment files, Git ignores, secret scanning |
| Weak passwords | Argon2 hashing and password-complexity validation |
| Stolen/forged tokens | Signed short-lived JWT with issuer and audience validation |
| Brute force / abusive traffic | Application rate limit plus deployment-provider WAF recommendation |
| Oversized uploads | Request body limit |
| Host-header attacks | Trusted-host middleware |
| XSS / framing | CSP, no-sniff, frame denial and output escaping |
| SSRF | Public URL validation utility and fixed allowlisted collector endpoints |
| Malicious external feed | Normalisation, size limits, no HTML rendering and source labels |
| Supply-chain risk | Dependabot, CodeQL, pip-audit/npm audit instructions |
| APK reverse engineering | Release shrinking and optional Dart obfuscation instructions |
| Database exposure | No direct public database connection from Flutter/web clients |

## Important limitation

No project can be made impossible to hack. Security requires patching, monitoring, backups, secret rotation, least privilege, incident response and periodic external review.
