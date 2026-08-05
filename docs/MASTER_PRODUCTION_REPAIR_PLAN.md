# LifeBridge AI Master Production Repair Plan

## 1. Executive Summary & Objectives
This Master Repair Plan establishes a comprehensive, production-grade roadmap to eliminate technical debt, enforce strict data honesty, guarantee real non-blocking Groq SSE token streaming, stabilize layout/component architecture, align authentication/privacy contracts, improve accessibility to WCAG 2.2 AA standards, and ensure 100% deployment consistency across Vercel frontend (`apps/web`) and FastAPI backend (`apps/backend`).

---

## 2. Current Architecture Overview
- **Frontend App (`apps/web`)**: Next.js 16.3 (Turbopack) using App Router, TypeScript, Tailwind CSS, and custom UI components.
- **Backend Service (`apps/backend`)**: FastAPI (Python 3.11/3.12) with SQLAlchemy ORM, SQLite/PostgreSQL, Groq AI SDK (`AsyncGroq`), and sliding window rate limiting.
- **AI Engine**: Groq AI (`llama-3.1-8b-instant`) with SSE streaming over `/api/v1/assistant/chat/stream`.
- **Deployment**: Vercel monorepo configuration targeting `apps/web` as frontend root.

---

## 3. Confirmed & Suspected Defects
| Module | Defect Description | Root Cause | Severity |
| :--- | :--- | :--- | :--- |
| **Deployment / Versioning** | Lack of build-info endpoint to track live commit hash across routes | Missing `/api/build-info` endpoint | High |
| **Authentication & Profile** | User state confusion or hard-coded assumptions | Unsanitized profile state representation | High |
| **Data Honesty** | Demo data cards appearing as verified live records | Missing explicit `data_mode` property & badges | Critical |
| **AI Streaming** | Async streaming queue blocking event loop if improperly handled | Sync fallback generator or unhandled disconnection | Critical |
| **Notifications** | Hard-coded non-zero unread badges | Static initial context count | Medium |
| **Chat History Privacy** | Reading/writing history without explicit user opt-in consent | Missing consent check before reading `localStorage` | High |
| **Saved Items** | Automatic sample item insertion when empty | Fallback slicing of `sampleFeed` | Medium |
| **Disaster Advisories** | Risk of demo alert triggering false emergency response | Unlabelled sample disaster records | High |
| **Accessibility (WCAG)** | Insufficient ARIA labels on dynamic controls, streaming state announcements | Missing `aria-live` and focus trapping | Medium |

---

## 4. Multi-Phase Technical Repair Strategy

### Phase 2: Deployment Consistency & Build Tracking
- Implement `GET /api/build-info` in `apps/web/app/api/build-info/route.ts` returning:
  `{ "version": "1.0.0", "commit": "a45bcda", "environment": "production", "built_at": "ISO_TIMESTAMP" }`.
- Display safe short commit ID in application footer without exposing internal environment secrets.

### Phase 3 & 4: Shared Architecture & Design System Tokens
- Enforce shared layout structure (`AppShell`, `TopBar`, `LeftSidebar`, `RightSidebar`, `PageIntro`).
- Standardize design token color palette (Navy `#0F2747`, Blue `#2563EB`, Cyan `#06B6D4`, Neutral backgrounds).
- Remove visual redundancies, duplicate theme toggles, and uneven card padding.

### Phase 5 & 6: Global Data Mode & Honest Content Rules
- Enforce `NEXT_PUBLIC_DEMO_MODE=false` in production.
- Throw explicit typed errors on network failures when `DEMO_MODE=false`.
- Mark all demonstration fixtures with permanent labels:
  - `DEMONSTRATION ALERT — NOT A LIVE WARNING`
  - `Demonstration result — live location data is unavailable.`
  - `Demonstration opportunity — not a live listing.`
- Remove real organization names from demo fallback records.

### Phase 7 & 8: Local Demo Profile & Zero-Unread Notifications
- Maintain `Local Demo Profile — not a secure account` branding (Option A).
- Remove password collection fields completely.
- Set default notification unread count to `0`.

### Phase 9 to 11: For You Feed, Opportunities, & SkillBridge
- Implement cursor-based feed deduplication and full loading/empty/error states.
- Filter opportunity listings by keyword, country, remote status, funding, and eligibility.
- Redact personal information before CV analysis; prohibit sending full CV payloads to AI without explicit user confirmation.

### Phase 12 to 17: Groq AI Assistant Backend & Non-Blocking SSE
- Utilize `AsyncGroq` in `apps/backend/app/services/groq_service.py`.
- Align `/health` endpoint response schema (`status`, `provider`, `configured`, `provider_verified`, `model`, `last_verified_at`).
- Enforce SSE sequence: `meta` -> `token`... -> `done` (or `meta` -> `error`).
- Abort controller integration: stop button halts stream, sets message status to `stopped`, and preserves partial tokens.
- Exclude system messages, error responses, and placeholders from conversation history before Groq transmission.
- Implement explicit history consent toggle (`Save chat history on this device`, default: `Off`).

### Phase 18: Rate Limiting
- Enhance sliding window rate limiter with IP extraction and request-id tracking.

### Phase 19 to 24: DisasterLink, Accessibility, Services, Graph, & Legal Pages
- Enforce generic demo records for location features when live APIs are unconfigured.
- Saved Items starts strictly empty; user bookmarks populate the view.
- Update `/settings`, `/help`, `/privacy`, `/terms`, `/data-sources`, `/model-transparency`, and `/accessibility-statement`.

### Phase 25 to 29: Copywriting, Security, & WCAG Accessibility
- Clean developer jargon from user-facing UI text.
- Target WCAG 2.2 AA compliance (`aria-live`, skip-to-content, keyboard focus rings, 44x44px touch targets).
- Enforce strict Content Security Policy (CSP), HSTS, and frame protection.

---

## 5. Verification & Testing Plan
- **Backend Unit & API Tests**: Run `.\.venv\Scripts\pytest -q` in `apps/backend`. Must pass 100%.
- **Frontend Type & Build Verification**: Run `npx next build` in `apps/web`. Must pass with 0 TypeScript/prerender errors.
- **E2E Integration Suite**: Execute Playwright test suite (`apps/web/tests/production_integrity.spec.ts`).
- **Live Production Groq Prompt Test**: Verify unique prompt execution on live domain.

---

## 6. Files Expected to be Created/Modified
- `apps/web/app/api/build-info/route.ts` (New build info endpoint)
- `apps/web/components/layout/AppFooter.tsx` (Build commit display)
- `apps/web/lib/api.ts` (API base URL validation, data mode rules)
- `apps/web/app/assistant/page.tsx` (Health contract alignment, streaming controls, opt-in consent)
- `apps/web/app/login/page.tsx` (Local Demo Profile Option A)
- `apps/web/app/saved/page.tsx` (Empty initial state logic)
- `apps/web/app/for-you/page.tsx` (Demo alert labeling, zero-unread notifications)
- `apps/backend/app/api/routes/assistant.py` (AsyncGroq streaming, health schema)
- `apps/backend/app/services/groq_service.py` (Non-blocking token generator)
- `apps/backend/tests/test_assistant.py` (Pytest assertions)
- `docs/MASTER_PRODUCTION_REPAIR_PLAN.md` (This document)
- `docs/MASTER_FINAL_PRODUCTION_QA_REPORT.md` (Final validation report)
