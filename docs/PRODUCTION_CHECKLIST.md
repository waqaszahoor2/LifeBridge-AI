# Production release checklist

## Configuration

- [ ] `APP_ENV=production`
- [ ] Strong unique `SECRET_KEY` and `ADMIN_API_KEY`
- [ ] HTTPS forced at proxy/platform and application layer
- [ ] Exact `ALLOWED_ORIGINS` and `TRUSTED_HOSTS`
- [ ] Demo seed disabled
- [ ] Database migrations run once
- [ ] API and worker deployed separately

## Data and privacy

- [ ] Data-retention policy published
- [ ] Database encryption/backups enabled
- [ ] Provider terms and attribution reviewed
- [ ] Scholarship/job records link to original official source
- [ ] User-upload redaction and deletion procedures tested
- [ ] Synthetic/demo data visibly labelled

## Security

- [ ] Dependency and container scans pass
- [ ] Admin endpoints protected and rate-limited
- [ ] Secrets stored in platform secret manager
- [ ] Firebase/third-party keys rotated and least-privileged
- [ ] Logs exclude tokens, passwords and uploaded sensitive content
- [ ] Independent penetration test completed for high-risk deployment

## Product quality

- [ ] Backend tests, web build and Flutter tests pass
- [ ] Accessibility checks completed
- [ ] Error/empty/offline states tested
- [ ] Android release signed with private upload key
- [ ] Disaster and scam disclaimers reviewed
- [ ] Monitoring, alerting and incident response contacts configured
