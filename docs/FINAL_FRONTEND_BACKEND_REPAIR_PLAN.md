# Master Production Repair Plan — LifeBridge AI

**Architect:** Principal Next.js, FastAPI, Groq, Redis & Production QA Engineer  
**Target Completion:** August 6, 2026  
**Status:** **IN PROGRESS**

---

## Executive Summary & Repair Strategy

To resolve all production integrity issues and achieve 100% approval, we are implementing a zero-fallback, strictly truthful architecture. Fabricated emergency alerts, hard-coded default profiles, fake recommendation scores, swallowed SSE errors, and silent demo-mode fallbacks are being systematically eliminated.

---

## 16-Step Repair Blueprint

### 1. Unified Notification State
- Remove `unreadCount` and `setUnreadCountState` from `AuthContext` completely.
- Use `NotificationContext` as the sole notification state manager.
- Guarantee guest unread notification count is strictly `0`.

### 2. Emergency Alerts Cleanup
- Delete all hard-coded and timed emergency records from `app/for-you/page.tsx` (Assam/Bihar IMD alert, NDMA Pakistan alert, 18s `setTimeout`).
- Remove fake current timestamps, fake verified status, fake reliability scores, and fake affected regions.

### 3. Direct Sample Feed Removal
- Remove direct `sampleFeed` fallback imports in `For You` (`app/for-you/page.tsx`) and `Opportunities` (`app/opportunities/page.tsx`).
- In live mode (`NEXT_PUBLIC_DEMO_MODE=false`), display standard empty or error states when live backend calls fail or return no data.

### 4. Strict `NEXT_PUBLIC_DEMO_MODE` Enforcement
- When `NEXT_PUBLIC_DEMO_MODE=false`: On network or API failure, render explicit `ErrorState` or `EmptyState`. Never silently enter demo mode.
- When `NEXT_PUBLIC_DEMO_MODE=true`: Render explicitly labeled demonstration records with `verification_status: "demo"` and `data_mode: "demo"`.

### 5. Require HTTPS API Base URL in Production
- Remove `http://localhost:8000` fallback in production (`lib/config.ts` and `lib/api.ts`).
- Require `NEXT_PUBLIC_API_BASE_URL` to point to the secure production HTTPS endpoint.

### 6. Truthful Action Handlers
- Remove deceptive optimistic responses ("queued refresh", "received report", fake local progress).
- Return success messages and UI state updates strictly after confirmed backend 2xx responses.

### 7. Remove Hard-Coded Recommendation Profile
- Remove default Pakistan/Python/data-science fallback profile in `lib/profile.ts` and `for-you/page.tsx`.
- Require an actual user-created local profile or prompt the user with "Complete your profile to receive personalized recommendations."

### 8. Eliminate Fabricated Recommendation Scores
- Remove local synthetic score generators and fake "Verified content from..." citations when live recommendations are unavailable.

### 9. Remove Fake Roadmaps & Mentor Responses
- In live mode (`NEXT_PUBLIC_DEMO_MODE=false`), remove synthetic roadmaps and "Phase X Roadmap Guidelines" citations upon API failure.

### 10. Robust SSE Streaming Client (`streamAssistantChat`)
- Validate response status (`response.ok`).
- Validate `Content-Type` header (`text/event-stream`).
- Require `meta` event before tokens.
- Require `done` event.
- Propagate error events immediately; do not swallow SSE errors.
- Flush stream decoder and process final buffer bytes.
- Cancel reader in `finally` block and fail on premature stream closure.

### 11. Protect Backend System Prompt
- Always prepend the server-controlled system prompt in `apps/backend/app/services/groq_service.py`.
- Reject `system`, `tool`, or `developer` roles supplied by clients with HTTP 422 validation errors.
- Accept only `user` and `assistant` client roles.
- Add HTTP 422 tests in backend pytest suite.

### 12. Strict `ASSISTANT_DEMO_MODE` Backend Enforcement
- `ASSISTANT_DEMO_MODE=false` + missing API key: Raise `CONFIGURATION_MISSING` HTTP 500/503.
- `ASSISTANT_DEMO_MODE=false` + Groq failure: Raise typed provider error.
- `ASSISTANT_DEMO_MODE=true`: Allow labeled `local_demo` fallback.

### 13. Independent Disconnect Watcher
- Implement an async task race (`asyncio.wait` / `asyncio.create_task`) between client disconnect checks (`request.is_disconnected()`) and Groq token generation.
- Ensure Stop Generation cancels stalled Groq requests immediately without waiting for the next token.

### 14. Deployment & Build Info Verification
- Ensure `/api/build-info` route returns actual commit SHA and dynamic ISO timestamp.

### 15. Comprehensive Playwright Test Suite
- Expand `tests/production_integrity.spec.ts` to test:
  - Zero hard-coded emergency content on For You.
  - Zero sample feed fallbacks in live mode.
  - Report/refresh failure honesty.
  - Notification count strictly 0.
  - SSE error propagation and meta/token/done validation.
  - Stop Generation capability.
  - System role rejection (HTTP 422).
  - Production build-info verification.

### 16. Verification Cycle
- Run backend pytest (24+ tests).
- Run TypeScript typecheck.
- Run Next.js production build (36 routes).
- Run local Playwright suite.
- Commit & push to GitHub (`git push origin main`).
- Run production Playwright suite against live URL.
