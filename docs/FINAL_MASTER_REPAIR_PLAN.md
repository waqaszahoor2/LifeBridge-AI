# FINAL MASTER REPAIR PLAN — LifeBridge AI
**Created:** 2026-08-06
**Current Branch:** main | **Latest Commit:** 63a1e79
**Baseline:** 25/25 backend tests passing

## 1. CURRENT ARCHITECTURE

Monorepo: apps/web (Next.js App Router, Vercel) + apps/backend (FastAPI, Redis, SQLite)
AI: Groq (AsyncGroq streaming) | Rate limit: Redis sliding window | Health cache: process-local dict

## 2. CONFIRMED DEFECTS

### CRITICAL — Backend
- **B1/B12**: `import asyncio` MISSING in assistant.py — NameError on every stream request
- **B2**: Disconnect watcher is one-shot per token iteration, not continuous
- **B3**: Cancelled tasks not fully awaited — pending task warnings

### HIGH — Backend
- **B5**: Rate-limit 503 exposes "Distributed Redis rate limiter" to users
- **B10**: Demo response mentions GROQ_API_KEY env var name to users
- **B11**: Error code PROVIDER_ERROR instead of spec codes (PROVIDER_UNAVAILABLE, etc.)

### HIGH — Frontend
- **F1**: No timeouts on streamAssistantChat or request()
- **F5/F6**: Help form fake success + fabricated 24-hour promise
- **F12**: SSE tokens accepted before meta event (no guard)

### MEDIUM — Frontend
- **F2**: Final-buffer error throw inside swallowing catch block
- **F3**: AbortController not nulled after success/failure
- **F10**: Build-info hardcoded fallback timestamp "2026-08-06T10:00:00.000Z"
- **F13**: onMeta callback missing request_id propagation

### MEDIUM — Content
- **C1**: Help FAQ references "Trust & Safety team" (doesn't exist)
- **C2**: Help FAQ references "verified opportunity feeds"
- **C3**: Help form claims "Our team will respond within 24 hours"

### MEDIUM — Deployment
- **D1**: vercel.json missing rootDirectory, buildCommand, installCommand

## 3. FILES TO MODIFY

| File | Change |
|------|--------|
| apps/backend/app/api/routes/assistant.py | Add import asyncio; continuous disconnect watcher; task cleanup |
| apps/backend/app/services/groq_service.py | Fix demo wording; map safe error codes |
| apps/backend/app/core/rate_limit.py | User-safe 503 message |
| apps/web/lib/api.ts | Timeouts; receivedMeta guard; requestId; fix catch |
| apps/web/app/assistant/page.tsx | requestId field; AbortController finally cleanup |
| apps/web/app/help/page.tsx | Honest form (email redirect or demo label) |
| apps/web/app/api/build-info/route.ts | Fail hard in production if timestamp missing |
| apps/web/tests/production_integrity.spec.ts | Expand test suite |
| vercel.json | Add rootDirectory and build configuration |

## 4. FILES TO CREATE

| File | Purpose |
|------|---------|
| apps/backend/tests/test_streaming.py | asyncio, SSE sequence, disconnect, error maps |
| apps/backend/tests/test_security.py | System role, IP spoofing, secret non-exposure |
| apps/web/tests/assistant.spec.ts | Playwright streaming tests |
| apps/web/tests/help_form.spec.ts | Help form honesty |
| apps/web/tests/accessibility.spec.ts | Axe + ARIA tests |
| docs/FINAL_VERIFIED_LIFEBRIDGE_PRODUCTION_REPORT.md | Post-deploy verification |

## 5. ACCEPTANCE CRITERIA (45 total from spec)

Critical path:
1. asyncio imported correctly
2. Stream executes without NameError
3. Disconnect watcher continuous
4. Cancelled tasks awaited
5. SSE meta required
6. SSE done required
7. Errors not swallowed
8. Request ID consistent
9. Frontend preserves request references
10. Timeouts on all requests
11. AbortController cleared after every outcome
12. Config details not user-visible
13. System prompts rejected (422)
14. Help form does not fabricate submission
15. Build timestamp real and fixed
16. All tests pass
