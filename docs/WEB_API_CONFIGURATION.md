# LifeBridge AI — Web API Configuration Guide

This document describes how `apps/web` connects to the FastAPI backend service (`apps/backend`).

---

## Central API Configuration

The frontend API client is located at `apps/web/lib/api.ts`.

It reads the environment variable:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

When deployed to production (e.g. Vercel), set:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## Supported Endpoints

| Route Path | Method | Purpose | Demo Fallback? |
| :--- | :--- | :--- | :--- |
| `/api/v1/feed` | `GET` | Retrieve aggregated opportunities & disaster feed | ✅ Yes (`sampleFeed`) |
| `/api/v1/recommendations` | `POST` | Get personalized recommendation scores & explainable reasons | ✅ Yes |
| `/api/v1/ai/trust-check` | `POST` | Check suspicious text/URL for scams | ✅ Yes |
| `/api/v1/services/nearby` | `GET` | Find nearby accessible services | ✅ Yes |
| `/api/v1/ai/cv/analyze` | `POST` | Skill extraction and CV analysis | ✅ Yes |
| `/api/v1/ai/decision-graph` | `POST` | Build decision graph nodes | ✅ Yes |
