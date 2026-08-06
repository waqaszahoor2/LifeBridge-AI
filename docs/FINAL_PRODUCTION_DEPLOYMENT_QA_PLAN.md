# Final Production Deployment & QA Plan — LifeBridge AI

**Architect & Senior Production QA Engineer**  
**Date:** August 6, 2026  
**Status:** **EXECUTING**

---

## 15-Point Execution & Verification Strategy

### 1. Build Timestamp & Build-Info Fix (`apps/web/next.config.ts` & `route.ts`)
- Inject build timestamp statically during build in `next.config.ts` via `process.env.APP_BUILD_TIMESTAMP`.
- Ensure `/api/build-info` returns the exact git commit SHA and fixed build timestamp without runtime `new Date()` fallback.

### 2. UI Status Text Correction (`apps/web/app/assistant/page.tsx`)
- Replace hard-coded string `Streaming response tokens from Groq Live / Local Demo Mode` with dynamic provider badge `Streaming response from ${healthStatus.provider || "assistant"}…`.

### 3. SSE Streaming Client Hardening (`apps/web/lib/api.ts`)
- Track both `receivedMeta` and `receivedDone`.
- Reject stream completion if `!receivedMeta` or `!receivedDone`.
- Fix final-buffer SSE error handling so error events throw cleanly without substring filtering.

### 4. Backend Tracing & Sanitize Error Messages (`apps/backend/app/services/groq_service.py`)
- Include `request_id` in `meta`, `token`, `done`, and `error` SSE events.
- Replace internal env var messages (`GROQ_API_KEY`, `ASSISTANT_DEMO_MODE`) with safe, user-friendly messages (`"The live AI assistant is temporarily unavailable."`) and safe error codes (`CONFIGURATION_MISSING`).

### 5. Independent Disconnect Watcher (`apps/backend/app/api/routes/assistant.py`)
- Ensure async task race (`asyncio.wait`) between `request.is_disconnected()` and Groq token fetch cancels stalled Groq requests immediately upon Stop Generation.

### 6. Expanded Playwright Production E2E Suite (`apps/web/tests/production_integrity.spec.ts`)
- Test `/api/build-info` commit and fixed build timestamp.
- Test notification count is strictly `0`.
- Test no hard-coded flood warnings.
- Test keyboard `.skip-to-content` navigation.
- Test AI Assistant message submission, streaming status, and Stop Generation.
- Test SSE error propagation and `meta`/`token`/`done` validation.

### 7. Full Build & Production Deployment Execution
- Run Pytest backend test suite (25/25 passing).
- Run TypeScript typecheck (0 errors).
- Run Next.js production build (`next build`).
- Commit and push to GitHub `main`.
- Verify live Vercel deployment returns newest SHA and fixed timestamp.
- Run production Playwright test suite against live URL.
