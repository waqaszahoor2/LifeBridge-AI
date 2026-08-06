# Comprehensive Integrity Repair Plan — LifeBridge AI

## Objective
Elevate LifeBridge AI to complete production integrity, enforcing strict data honesty, backend isolation, mandatory Redis rate limiting in production, server-controlled system prompt protection, removal of all invented data/metrics, and deep E2E Playwright and Pytest validation.

---

## Plan Structure

### 1. Build & Deployment Telemetry (`apps/web` & `apps/backend`)
- Enforce static compilation of `APP_VERSION`, `APP_BUILD_TIMESTAMP`, and `GIT_COMMIT_SHA`.
- Remove runtime `Date.now()` generation in production when build timestamp env vars are missing; fail fast or report explicit fallback state in non-production.
- Ensure frontend `/api/build-info` and backend `/api/v1/build-info` return unified, exact deployment commit telemetry.
- Add Playwright assertion validating that `/api/build-info` matches `process.env.EXPECTED_GIT_COMMIT`.

### 2. Global Demo Policy & Purging Page-Level Fallbacks
- Create unified policy function `isDemoModeEnabled()` in `apps/web/lib/api.ts`.
- **When `NEXT_PUBLIC_DEMO_MODE=false` (Production Live Mode)**:
  - **For You** (`apps/web/app/for-you/page.tsx`): Do not insert `sampleFeed` on API failure or empty results. Display explicit error / empty states with Retry.
  - **Opportunities** (`apps/web/app/opportunities/page.tsx`): Do not insert `sampleFeed`. Display "We could not load live opportunities" + Retry on error, or "No current opportunities were found" on empty.
  - **DisasterLink** (`apps/web/app/disasters/page.tsx`): Do not insert `sampleFeed` on error.
  - **Services** (`apps/web/app/services/page.tsx`): Remove invented facilities ("Mayo Hospital Emergency Ward", "Red Crescent Community Clinic"). Show honest error + Retry.
  - **Accessibility** (`apps/web/app/accessibility/page.tsx`): Remove invented places ("Central Health & Mobility Center", "Civic Transit Station"). Show honest error + Retry.
  - **Demo Banners**: Hide For You emergency demo banner unless `NEXT_PUBLIC_DEMO_MODE=true`.
- **When `NEXT_PUBLIC_DEMO_MODE=true` (Demo Mode)**:
  - All sample items must set `data_mode: "demo"`.
  - All sample UI cards must visibly display a **"Demo Data"** badge.
  - Demo notices rendered prominently.

### 3. Removal of Invented Facilities & Fabricated Metrics
- **Services & Accessibility**: Purge all fake hospital names, addresses, and OpenStreetMap coordinates. In demo mode, use generic labels like "Demonstration Hospital" with clear demo badges.
- **Engagement Metrics**: Remove fake `views_count`, `comments_count`, and `read_time` calculations from `FeedCard.tsx` / `FeedItem` types unless real fields exist on backend data objects.

### 4. Component Error Handling & Form Protection
- `FeedCard.handleReport`: Wrap in `try/catch`. Disable report button while pending. On success, show confirmation. On error, display `"We could not submit this report. Nothing was sent."`.
- Manual feed refresh: Add `try/catch` and error feedback.

### 5. Backend Assistant Hardening (`apps/backend`)
- **Backend Demo Mode (`ASSISTANT_DEMO_MODE`)**:
  - Add `ASSISTANT_DEMO_MODE` to `app/core/config.py`.
  - When `ASSISTANT_DEMO_MODE=false`: Missing/invalid `GROQ_API_KEY` returns typed error (`HTTP 503 configuration_missing` or `HTTP 401 provider_authentication_failed`). NO local demo AI answer is ever generated.
  - When `ASSISTANT_DEMO_MODE=true`: Local demo response allowed with `provider: "local_demo"` and `status: "fallback"`.
- **Server System Prompt Protection**:
  - Reject/discard all client-submitted messages with `role == "system"`.
  - Client messages may only contain `role: "user"` or `role: "assistant"`.
  - Backend always prepends its own trusted system prompt first.

### 6. Strict Redis Rate Limiting
- `REDIS_URL` mandatory when `REQUIRE_REDIS=true` or `ENVIRONMENT=production`. Backend health/readiness fails if Redis is unreachable.
- Use atomic Redis ZADD / Lua script operations with unique request UUIDs to eliminate timestamp collision bugs.
- Calculate exact `Retry-After` header for HTTP 429 responses.
- Trust forwarding headers only from specified trusted proxies (e.g. Render / Cloudflare headers).

### 7. Comprehensive Playwright & Pytest Testing
- **Playwright E2E Suite**:
  - Assert build commit matches `EXPECTED_GIT_COMMIT`.
  - Verify Guest user, 0% initial profile completeness, 0 unread notifications.
  - Verify live mode failure states (For You, Opportunities, Disasters, Services, Accessibility) display honest error + Retry, NEVER inserting `sampleFeed`.
  - Verify demo mode displays visible "Demo Data" badges.
  - Test AI Assistant: SSE tokens, provider transitions (`pending` -> `groq`), Stop abort, Retry non-duplication, history opt-in consent.
  - Verify report failure displays `"We could not submit this report. Nothing was sent."`.
- **Pytest Suite**:
  - Test backend startup, system message rejection, `ASSISTANT_DEMO_MODE=false` error raising on missing Groq key, Redis rate limiting, 429 responses, and secret redaction.

---

## Detailed Step-by-Step Execution Sequence

1. **Backend Config & System Prompt Protection**: Update `apps/backend/app/core/config.py`, `apps/backend/app/schemas.py`, and `apps/backend/app/api/routes/assistant.py`.
2. **Strict Redis Rate Limiter**: Update `apps/backend/app/core/rate_limit.py`.
3. **Frontend Build Info & Demo Policy**: Update `apps/web/app/api/build-info/route.ts` and `apps/web/lib/api.ts`.
4. **Remove Uncontrolled Fallbacks & Invented Data**: Refactor `for-you`, `opportunities`, `disasters`, `services`, `accessibility`, and `FeedCard`.
5. **Remove Fake Metrics**: Update `FeedCard.tsx` and feed item types.
6. **Backend Pytest Expansion**: Add test cases to `apps/backend/tests/`.
7. **Playwright E2E Expansion**: Update `apps/web/tests/production_integrity.spec.ts`.
8. **Build & Test Verification**: Execute `npx next build`, `pytest -q`, and `npm run test:e2e`.
9. **Git Commit & Deployment**: Commit changes and push to `main`.
