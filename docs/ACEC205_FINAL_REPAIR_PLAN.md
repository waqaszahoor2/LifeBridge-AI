# LifeBridge AI ACEC205 Final Production Repair Plan

## 1. Context & Objectives
This document establishes the definitive, production-grade repair plan to replace all hard-coded commit identifiers with dynamic environment variables, strictly enforce global data mode (`NEXT_PUBLIC_DEMO_MODE`), purge fake offline success responses, correct profile completeness calculation, fix AI Assistant context filtering, prevent duplicate messages on retry/regenerate, upgrade backend health model verification, integrate Redis rate limiting, and validate the full suite using automated Playwright E2E tests.

---

## 2. Confirmed Technical Issues & Root Causes

| Issue ID | Module / Area | Confirmed Defect | Root Cause |
| :--- | :--- | :--- | :--- |
| **DEF-01** | Build Tracking | Hard-coded SHA strings (`a45bcda`, `acec205`) in `/api/build-info`, `health.py`, and `LeftSidebar.tsx` | Static values assigned instead of reading runtime environment variables |
| **DEF-02** | Data Mode Honesty | `api.ts` fallbacks silently returning mock data when `NEXT_PUBLIC_DEMO_MODE=false` | Missing global guard `isDemoModeEnabled()` throwing typed errors on API failure |
| **DEF-03** | False Offline Success | Fake `status: "queued"` / `status: "received"` responses on offline report/refresh | Unverified client-side fallback responses masking API failures |
| **DEF-04** | DisasterLink Fallback | Loading `sampleFeed` when live disaster API fails in live mode | Missing strict live error boundary and Retry trigger |
| **DEF-05** | Profile Completeness | Defaulting guest profile completeness to 25% with fake values | Hard-coded fallback completeness percentage and mock profile defaults |
| **DEF-06** | AI Message Context | System messages, error states, and pending placeholders sent to Groq API | Unsanitized `apiMessages` context mapping prior to stream request |
| **DEF-07** | Assistant Retry/Regen | Duplicate user turns appended during retry or regenerate actions | Appending new message objects instead of reusing existing user turn |
| **DEF-08** | Health Model Check | `model_exists = model in available_models if available_models else True` masking missing models | Lenient fallback when Groq model list retrieval fails |
| **DEF-09** | Rate Limiting | `defaultdict` in-memory dictionary rate limiter limited to single process | Absence of distributed Redis rate limiter with TTL and IP proxy parsing |
| **DEF-10** | E2E Testing | Playwright test suite missing from automated test pipeline execution | Missing `@playwright/test` dependency and package test scripts |

---

## 3. Repair Strategy & Modifications Plan

### Step 2: Dynamic Build Identification
- **Files**: `apps/web/app/api/build-info/route.ts`, `apps/backend/app/api/routes/health.py`, `apps/web/components/LeftSidebar.tsx`.
- **Implementation**:
  - Read `VERCEL_GIT_COMMIT_SHA || GIT_COMMIT_SHA || "unknown"`.
  - Calculate `built_at` at module load time (computed once, not per request).
  - Add `Cache-Control: no-store, no-cache, must-revalidate` response header.
  - Update `LeftSidebar.tsx` to fetch build info dynamically from `/api/build-info`.

### Step 4 & 5: Global Data Mode & Error Honesty
- **Files**: `apps/web/lib/api.ts`, `apps/web/app/for-you/page.tsx`, `apps/web/app/disasters/page.tsx`, `apps/web/app/opportunities/page.tsx`, `apps/web/app/services/page.tsx`, `apps/web/app/accessibility/page.tsx`.
- **Implementation**:
  - Export `isDemoModeEnabled()` checking `process.env.NEXT_PUBLIC_DEMO_MODE === "true"`.
  - When `isDemoModeEnabled()` is `false`, throw errors immediately upon API failure.
  - Delete fake `"queued"` and `"received"` offline fallbacks. On failure return/display `"We could not complete this action. Nothing was sent."`

### Step 6 to 8: Recommendation, DisasterLink & Profile Integrity
- **Files**: `apps/web/lib/api.ts`, `apps/web/app/disasters/page.tsx`, `apps/web/components/LeftSidebar.tsx`, `apps/web/app/profile/page.tsx`.
- **Implementation**:
  - Remove artificial 0.98/0.88 recommendation scores. Demo scores explicitly state `"Sample score for interface testing."`
  - In live mode, DisasterLink displays an `ErrorState` with Retry button on API failure.
  - Guest profile completeness starts at **0%** and calculates only from real filled fields (Name, Country, Education, Field, Skills, Goal, Opportunity type, Notifications). Use clear placeholders ("Not set") rather than fabricated values.

### Step 9 & 10: Assistant Message Context & Clean Retry/Regenerate
- **Files**: `apps/web/app/assistant/page.tsx`.
- **Implementation**:
  - Filter `apiMessages` context to exclude system, pending, failed, error, and empty messages.
  - Set initial stream placeholder to `provider: "pending"`, `status: "streaming"`.
  - Refactor `handleRetry` and `handleRegenerate` to reuse the existing user turn without duplicating user messages.

### Step 11: Backend Health Contract Verification
- **Files**: `apps/backend/app/api/routes/assistant.py`.
- **Implementation**:
  - Remove wildcard `available_models` fallback.
  - Return `status: "verification_unknown"`, `provider_verified: False` if model list is empty or unreachable.
  - Return `status: "ready"` only if exact configured model exists.
  - Include `request_id`, `verified_at`, and `verification_ttl_seconds`.

### Step 12: Distributed Redis Rate Limiting
- **Files**: `apps/backend/app/core/rate_limit.py` (or `middleware.py`), `apps/backend/requirements.txt`.
- **Implementation**:
  - Add `redis` library to backend dependencies.
  - Implement Redis atomic `INCR` + `EXPIRE` window rate limiter using `REDIS_URL`.
  - Extract trusted client IP from `CF-Connecting-IP`, `X-Forwarded-For`, `X-Real-IP`, or fallback to `client.host`.
  - Return `429 Too Many Requests` with `Retry-After` header when limit exceeded.
  - Provide a documented atomic fallback if `REDIS_URL` is not set.

### Step 13 & 14: Playwright E2E Integration Suite & Testing
- **Files**: `apps/web/package.json`, `apps/web/playwright.config.ts`, `apps/web/tests/production_integrity.spec.ts`.
- **Implementation**:
  - Add `@playwright/test` and npm scripts (`"test:e2e": "playwright test"`).
  - Execute full test suite: backend `pytest` and frontend `lint`, `typecheck`, `test:e2e`, and `build`.

---

## 4. Acceptance Criteria
1. All hardcoded commit strings (`a45bcda`, `acec205`) removed. Build endpoints return dynamic deployment SHA.
2. `built_at` is a fixed deployment timestamp.
3. LeftSidebar displays commit hash fetched dynamically from `/api/build-info`.
4. Notification unread count defaults to 0.
5. Guest profile completeness starts at 0%.
6. `NEXT_PUBLIC_DEMO_MODE=false` throws explicit errors on API failure across all features.
7. Offline report/refresh fake success messages removed.
8. DisasterLink displays error state and Retry when API fails in live mode.
9. Groq SSE request payload context excludes system, pending, and failed messages.
10. Provider status remains `pending` until SSE `meta` event confirms Groq Live.
11. Retry and Regenerate actions do not create duplicate user turns.
12. Backend assistant health rejects unknown/unverified models.
13. Redis rate limiting integrated with IP proxy parsing and `Retry-After` header.
14. Automated Playwright test suite passes cleanly with 0 errors.
15. Backend `pytest` and frontend `npx next build` pass 100%.
