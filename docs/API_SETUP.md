# API Setup

Edit one file only:

```text
config/apis.env
```

Create it from `config/apis.env.example`.

## Works without credentials

- NASA EONET disaster events;
- Open-Meteo forecast summary;
- synthetic jobs, scholarships, services and safety posts;
- local O*NET-style skill tags included in sample data.

## Optional credentials

- USAJOBS free API key and email;
- ReliefWeb approved application name;
- Adzuna developer app ID/key;
- Firebase service account for notifications.

## Rules

- Never place private credentials in `apps/web` or `apps/mobile`.
- Never commit `config/apis.env`.
- Keep disabled providers set to `false` until credentials are valid.
- Confirm each provider's current terms, quotas and redistribution rights before a public launch.
