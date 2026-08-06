# Comprehensive Final Deployment & Data Integrity Repair Plan — LifeBridge AI

**Authors & Lead Engineers:** Principal Full-Stack Engineer, Next.js Architect, FastAPI Specialist, Groq Streaming Expert, Security Auditor, QA Engineer  
**Repository:** https://github.com/waqaszahoor2/LifeBridge-AI  
**Production URL:** https://life-bridge-ai-ten.vercel.app/  
**Date:** August 6, 2026  
**Status:** **PLANNING COMPLETE — READY FOR EXECUTION**

---

## 1. Audit Overview & Confirmed Root Causes

### 1.1 Confirmed Deployment & Build-Info Discrepancies
- **Root Cause:** Build info logic dynamically calculated runtime timestamps using `new Date().toISOString()` when `APP_BUILD_TIMESTAMP` was unset, and did not strictly fail production builds when `APP_BUILD_TIMESTAMP` was missing.
- **Fix:** In production (`NODE_ENV === "production"` / `app_env === "production"`), fail build if `APP_BUILD_TIMESTAMP` is missing. Set `APP_BUILD_TIMESTAMP` in `next.config.ts` environment and enforce `Cache-Control: no-store, max-age=0`.

### 1.2 Notification Context Duality
- **Root Cause:** Residual state properties in `AuthContext` conflicted with `NotificationContext`.
- **Fix:** Completely purge notification state from `AuthContext`. `NotificationContext` will be the exclusive source of truth. Guest unread notification count is strictly `0`. No notification badge rendered when count is `0`.

### 1.3 Guest Profile Wording & Display
- **Root Cause:** Unauthenticated users were shown "Local Demo Profile — not a secure account" and synthetic initials (`GU`).
- **Fix:** Guest users strictly see `"Guest"`, `"Create Local Demo Profile"`, `"0%"` completeness, `"0"` saved items, `"0"` notifications, and a generic user icon (`?` or silhouette), without "Log Out" buttons or synthetic demographic fields.

### 1.4 Verification Claims & Data Integrity
- **Root Cause:** Listing cards automatically displayed "Verified Source" or calculated reliability percentages even without backend verification metadata.
- **Fix:** Update `FeedCard` to require real evidence (`verified_at`, `verification_method`, source URL/org, retrieval timestamp) before displaying "Verified". Display `"Source information unavailable"` when missing. Hide reliability percentages for demo records.

### 1.5 Strict Live & Demo Mode Segregation
- **Root Cause:** Components fell back to `sampleFeed` in live mode when network errors occurred.
- **Fix:** When `NEXT_PUBLIC_DEMO_MODE=false`, network errors strictly display explicit `ErrorState` / `EmptyState` and throw exceptions.

### 1.6 SSE Stream Parser & Custom Error Class
- **Root Cause:** The streaming helper did not throw a typed error class or track both `meta` and `done` flags strictly.
- **Fix:** Implement `AssistantStreamError(code, message, request_id)` class. Require `receivedMeta === true` and `receivedDone === true`. Process error events outside try/catch blocks to ensure no error is swallowed.

### 1.7 Stream Metadata & Request ID Propagation
- **Root Cause:** `request_id` was generated inside backend service layers rather than passed from route level.
- **Fix:** Generate `req_id` at `assistant.py` router level and pass down to `stream_groq_chat_async`. Include `request_id` in every SSE event (`meta`, `token`, `done`, `error`).

### 1.8 Assistant Status Labels & Safe Error Mapping
- **Root Cause:** Assistant UI showed "Groq Live / Local Demo Mode" for non-ready states. Internal environment variable names (`GROQ_API_KEY`, `ASSISTANT_DEMO_MODE`) were exposed in error messages.
- **Fix:** Map status to exact health status (`"Connecting to the live assistant…"`, `"Groq Live"`, `"Offline Demo"`, `"Configuration Missing"`, `"Provider Verification Failed"`, `"Service Unavailable"`). Map backend errors to safe codes (`CONFIGURATION_MISSING`, `PROVIDER_AUTHENTICATION_FAILED`, `PROVIDER_RATE_LIMITED`, `PROVIDER_TIMEOUT`, `PROVIDER_UNAVAILABLE`, `INVALID_MODEL`).

### 1.9 Immediate Stream Cancellation via Async Disconnect Race
- **Root Cause:** Stream loop waited for Groq to yield a token before checking client disconnect.
- **Fix:** Race `fetch_task` against `disconnect_task` using `asyncio.wait(..., return_when=FIRST_COMPLETED)` in `assistant.py`.

### 1.10 Protected Server System Prompt
- **Root Cause:** Client system messages could potentially override server prompt.
- **Fix:** Enforce `Literal["user", "assistant"]` Pydantic message validation. Reject `system`, `developer`, `tool` roles with HTTP 422 Unprocessable Entity.

### 1.11 Redis Production Hardening
- **Root Cause:** Redis client was initialized per-request rather than attached to `app.state.redis` on app startup.
- **Fix:** Initialize single Redis client on startup in `app.state.redis`. Fail readiness `/api/v1/health/ready` if `REQUIRE_REDIS=true` or `app_env=production` and Redis is down.

### 1.12 Shared AppFooter & Accessibility
- **Root Cause:** Footer was missing on some routes or lacked dynamic build-info fetching.
- **Fix:** Render shared `AppFooter` across all pages. Include `.skip-to-content` link pointing to `<main id="main-content">`. Use `aria-live="polite"` for streaming tokens and `role="alert"` for error messages.

---

## 2. Files to Modify

1. `apps/web/next.config.ts` — Inject build timestamp, enforce production build failure if missing.
2. `apps/web/app/api/build-info/route.ts` — Build info route with `Cache-Control: no-store, max-age=0`.
3. `apps/backend/app/api/routes/health.py` — Backend `/api/v1/build-info` and `/api/v1/health/ready` Redis state.
4. `apps/web/context/AuthContext.tsx` — Purge notification state.
5. `apps/web/context/NotificationContext.tsx` — Single notification source.
6. `apps/web/components/Header.tsx` — Unified notification count & Guest avatar.
7. `apps/web/components/LeftSidebar.tsx` — Profile completeness, Guest display, notification sync.
8. `apps/web/components/FeedCard.tsx` — Source verification audit, hide fake reliability percentages.
9. `apps/web/lib/api.ts` — `streamAssistantChat`, `AssistantStreamError`, `receivedMeta` and `receivedDone` enforcement.
10. `apps/backend/app/services/groq_service.py` — `request_id` propagation, sanitized error mapping, system prompt protection.
11. `apps/backend/app/api/routes/assistant.py` — Disconnect watcher race (`asyncio.wait`), pass `req_id`.
12. `apps/backend/app/core/rate_limit.py` & `main.py` — App state Redis initialization and shutdown.
13. `apps/web/app/assistant/page.tsx` — Exact health badge labels, retry without message duplication.
14. `apps/web/components/AppShell.tsx` & `AppFooter.tsx` — `<main id="main-content">`, skip link, shared footer build info.
15. `apps/backend/tests/test_assistant.py` & `test_api.py` — Expanded pytest suite.
16. `apps/web/tests/production_integrity.spec.ts` — Expanded Playwright E2E suite.

---

## 3. Execution & Testing Strategy
- Phase 2: Build Info & Build Timestamp Enforcement
- Phase 3: Single Notification Context & Guest Defaults
- Phase 4: Guest & Local Profile UX Fixes
- Phase 5: Verification Claims & Card Audit
- Phase 6: Live/Demo Mode Segregation
- Phase 7 & 8: Typed SSE Stream Parsing, `AssistantStreamError`, `request_id`
- Phase 9 & 10: Status Labels & Safe Backend Error Mapping
- Phase 11: Disconnect Watcher Race Condition
- Phase 12: Server Prompt Protection
- Phase 13 & 14: Backend Demo Mode & Redis Production Hardening
- Phase 15 & 16: Shared Footer & Accessibility (`#main-content`)
- Phase 17 & 18: Pytest & Playwright Expansion
- Phase 19 & 20: Build, Typecheck, Deploy & Verify Live
