# Architecture

```text
Official APIs / authorised feeds / admin CSV
                    |
          dedicated FastAPI worker
                    |
 validation → normalisation → stable-ID deduplication
                    |
       PostgreSQL + PostGIS     Redis cache
                    |             |
        FastAPI API and security middleware
                    |
 NLP/CV-text baselines + GIS + recommender + decision graph
                    |
          ---------------------------
          |                         |
  Next.js responsive web     Flutter Android/web
        Vercel                 APK / AAB
```

## Main runtime processes

- **API:** user/feed/AI/admin endpoints; does not run the collector scheduler in production.
- **Worker:** refreshes enabled providers at configured intervals.
- **Database:** feed, users, saved items, notification tokens, source config and audit logs.
- **Redis:** shared cache for expensive nearby-service/Overpass results and future distributed throttling/locks.
- **Web/mobile:** contain no private provider credentials and call only the FastAPI API.

## Decision model

The Personal Decision Graph links user skills/interests to opportunities, sources and locations. Recommendation edges use a derived score combining relevance, location, study-level fit, freshness, deadlines, urgency, verification and source reliability.

## Timestamp model

- `published_at`: original source timestamp;
- `collected_at`: first arrival in LifeBridge;
- `last_checked_at`: latest source verification;
- `updated_at`: database/content modification;
- `expires_at`: deadline or validity end.
