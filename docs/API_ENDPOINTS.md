# API endpoint guide

Base path: `/api/v1`

## Public/read endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/health/ready` | Database readiness check |
| GET | `/feed` | Filtered, paginated feed |
| GET | `/feed/{id}` | Single feed item |
| POST | `/recommendations` | Explainable ranking for a supplied profile |
| GET | `/sources` | Source configuration status without secrets |
| GET | `/services/nearby` | Nearby essential services from Overpass |
| POST | `/ai/trust-check` | Message/URL scam-risk assessment |
| POST | `/ai/cv-analyze` | Skill extraction and role matching |
| POST | `/ai/disaster-risk` | Baseline environmental risk estimate |

## Authentication and user endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create user account |
| POST | `/auth/login` | Receive bearer token |
| GET | `/profile` | Read authenticated profile |
| PATCH | `/profile` | Update preferences and skills |
| GET | `/profile/export` | Export profile/saved metadata without notification tokens |
| DELETE | `/profile` | Delete the authenticated account |
| GET | `/saved` | List saved feed items |
| POST | `/saved` | Save an item/reminder |
| DELETE | `/saved/{feed_item_id}` | Remove saved item |
| POST | `/notifications/tokens` | Register a push token |

## Administrator endpoints

Authenticate with an administrator JWT or `X-Admin-Key` header.

| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/feed-items` | Create/update one verified post |
| POST | `/admin/feed-items/import-csv` | Import up to 500 validated rows |
| POST | `/admin/refresh` | Refresh all enabled official sources |

Use `datasets/templates/feed_import_template.csv` for bulk imports. Swagger UI is available at `/docs` outside production.
