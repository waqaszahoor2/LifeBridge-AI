# LifeBridge AI — Final Frontend & Backend Repair Plan

> **Created:** 2026-08-06  
> **Latest Commit:** `b6bd657` (with uncommitted local modifications)  
> **Branch:** `main`  
> **Remote:** `https://github.com/waqaszahoor2/LifeBridge-AI.git`  
> **Production Frontend:** `https://life-bridge-ai-ten.vercel.app/`  
> **Production Backend:** `https://lifebridge-ai-backend.onrender.com` (**DOWN — timeout / 404**)

---

## 1. Current Architecture

```
LifeBridge_AI_End_to_End/
├── apps/web/          — Next.js 16.3 frontend (Vercel)
│   ├── app/           — 25+ routes (for-you, assistant, etc.)
│   ├── components/    — AppShell, Header, Sidebar, FeedCard, etc.
│   ├── context/       — AuthContext (sole provider)
│   ├── lib/           — api.ts, sample-data.ts, types.ts, profile.ts, env.ts, firebase.ts
│   └── tests/         — 1 Playwright test file (5 basic tests)
├── apps/backend/      — FastAPI backend (Render)
│   ├── app/
│   │   ├── api/routes/ — 13 route modules
│   │   ├── core/       — config, database, middleware, rate_limit, security
│   │   └── services/   — groq_service, skills_engine, recommendation, etc.
│   └── tests/          — 9 test files (basic coverage)
├── docs/              — 49 markdown docs (mostly outdated)
└── vercel.json        — Root-level Vercel config
```

---

## 2. Confirmed Frontend Defects

### 2.1 No Shared Application Shell Contexts
- **Only `AuthContext` exists.** No `NotificationContext`, `ThemeContext`, `LanguageContext`, `SavedItemsContext`, or `DataModeContext`.
- Theme state lives inside `Header.tsx` — not synchronized across routes.
- Saved items are managed per-page with raw `localStorage`, no shared state.
- Notification count lives in `AuthContext.unreadCount` but starts at `0` correctly; however, no `NotificationProvider` with structured notifications exists.

### 2.2 Duplicate/Orphaned Components
- `LeftSidebar.tsx` exists alongside `Sidebar.tsx` — different implementations.
- `TopBar.tsx` imported by `LoginPage` but not used by most routes.
- `RightSidebar.tsx` exists but is unused.

### 2.3 Sample Data Contains Fabricated Content
- `sample-data.ts` contains fabricated organizations: "National Disaster Management Authority", "Pakistan Meteorological Department", "Open AI Research Lab", "LifeBridge Security & Fraud Verification Unit", "LifeBridge Career Academy" — all with `verification_status: "verified"` and high `source_reliability` scores.
- These display as "verified" in demo mode, violating data honesty rules.

### 2.4 Missing Frontend `/api/build-info` Configuration
- `built_at` returns `"NOT_CONFIGURED_BUILD_TIMESTAMP"` in production.
- `APP_BUILD_TIMESTAMP` env var is not set on Vercel.

### 2.5 Stale CSP Configuration
- `next.config.ts` CSP `connect-src` includes `http://localhost:8000 https:` — overly permissive in production.

### 2.6 Missing Routes from Sidebar
- `decision-graph`, `accessibility`, `weather` routes exist but are not all in the sidebar navigation.

### 2.7 No Footer Component
- Build version displays only in `LeftSidebar.tsx` line 140, hardcoded as "v1.0.0".

### 2.8 No `providers.tsx` Wrapper
- `layout.tsx` only wraps with `AuthProvider`. Missing theme, notification, saved items, data mode providers.

### 2.9 Assistant Page Provider Badge Issues
- Provider badge for `"pending"` falls to the default "System Message" case instead of showing "Pending".

### 2.10 Missing Pages/Content
- No `404.tsx` custom page.
- No `error.tsx` error boundary.
- No `loading.tsx` route-level loading states.
- No sitemap or robots.txt.

---

## 3. Confirmed Backend Defects

### 3.1 Backend is DOWN
- `https://lifebridge-ai-backend.onrender.com` — **timeout / 404**
- Render free-tier services sleep after inactivity.

### 3.2 Groq Service Uses Synchronous Client for Non-Streaming
- `call_groq_chat()` uses synchronous `Groq()` client — blocks the event loop.

### 3.3 Error Details Leak Provider Class Names
- HTTP response includes `f"Groq provider request failed: {type(err).__name__}"` — **exposes internals to client**.
- SSE error includes `type(err).__name__` — **exposes to stream**.

### 3.4 Health Readiness Creates New Redis Client
- `health.py` creates a **new** `redis.Redis.from_url()` on every readiness check.

### 3.5 No Client Disconnect Racing in Stream
- Stream endpoint checks `request.is_disconnected()` but only between Groq chunks.

### 3.6 Schema Mismatch
- Backend `RoadmapResponse.mode_used` allows only `"ai_generated"` and `"structured_template"` — missing `"local_demo"`.

### 3.7 Missing `data_mode` Field on Backend Schemas
- `FeedItemOut` and `NearbyServiceOut` don't include a `data_mode` field.

---

## 4. Deployment Defects

| Defect | Status |
|--------|--------|
| Backend completely unreachable (Render timeout/404) | **CRITICAL** |
| Frontend `built_at` shows `NOT_CONFIGURED_BUILD_TIMESTAMP` | **MEDIUM** |
| `APP_BUILD_TIMESTAMP` not configured in Vercel env | **MEDIUM** |
| Two `vercel.json` files (root + `apps/web/`) | **LOW** |

---

## 5. Data Integrity Defects

| Defect | Location |
|--------|----------|
| Sample data uses `verification_status: "verified"` | `sample-data.ts` |
| Sample data uses real-sounding org names | `sample-data.ts` |
| Sample data has high `source_reliability` (0.88–0.98) | `sample-data.ts` |
| `LeftSidebar.tsx` shows "GU" initials for guest | Line 78 |

---

## 6. Security Defects

| Defect | Severity |
|--------|----------|
| CSP `connect-src` allows `http://localhost:8000 https:` | **HIGH** |
| Error responses leak Groq class names | **MEDIUM** |
| Firebase API key in `.env.local` | **MEDIUM** |

---

## 7. Accessibility Defects

| Defect | Location |
|--------|----------|
| No skip-to-content link | `layout.tsx` |
| Emoji-only button labels | Multiple pages |
| Notification aria-label incorrect for 0 count | `Header.tsx` |
| No focus trap on FeedCard modal | `FeedCard.tsx` |
| No `aria-live` region for streaming | `assistant/page.tsx` |
| No reduced-motion support | CSS |

---

## 8. Root Causes

1. **No shared state architecture** — each page manages independently.
2. **Backend sleeping on free tier** — Render hibernates.
3. **Iterative development without refactoring** — duplicate components.
4. **Sample data designed for visual demo, not honesty** — uses "verified" and real org names.
5. **No CI/CD pipeline** — no automated testing before deployment.
6. **Missing deployment environment configuration.**

---

## 9. Files to Create

| File | Purpose |
|------|---------|
| `apps/web/app/providers.tsx` | Shared context providers wrapper |
| `apps/web/context/NotificationContext.tsx` | Notification state management |
| `apps/web/context/ThemeContext.tsx` | Theme persistence |
| `apps/web/context/SavedItemsContext.tsx` | Shared saved items state |
| `apps/web/context/DataModeContext.tsx` | Global demo/live mode state |
| `apps/web/components/layout/AppFooter.tsx` | Footer with build info |
| `apps/web/components/states/LoadingState.tsx` | Reusable loading skeleton |
| `apps/web/components/states/EmptyState.tsx` | Reusable empty state |
| `apps/web/components/states/ErrorState.tsx` | Reusable error with retry |
| `apps/web/components/states/DemoDataNotice.tsx` | Demo mode banner |
| `apps/web/app/not-found.tsx` | Custom 404 page |
| `apps/web/app/error.tsx` | Error boundary |
| `apps/web/app/sitemap.ts` | Dynamic sitemap |
| `apps/web/app/robots.ts` | Robots.txt |
| `apps/web/lib/errors.ts` | Typed error codes |
| `apps/web/lib/config.ts` | Central configuration |

---

## 10. Files to Modify

| File | Changes |
|------|---------|
| `apps/web/app/layout.tsx` | Semantic HTML, skip-to-content, providers |
| `apps/web/components/AppShell.tsx` | Add footer |
| `apps/web/components/Header.tsx` | Fix notification label, use theme context |
| `apps/web/components/Sidebar.tsx` | Add missing navigation routes |
| `apps/web/lib/api.ts` | Typed errors, timeouts, safe error mapping |
| `apps/web/lib/sample-data.ts` | Generic demo names, `verification_status: "demo"` |
| `apps/web/lib/types.ts` | Add `data_mode` field |
| `apps/web/next.config.ts` | Fix CSP `connect-src` |
| `apps/web/app/for-you/page.tsx` | Improve states |
| `apps/web/app/assistant/page.tsx` | Fix pending badge |
| `apps/backend/app/services/groq_service.py` | Fix error exposure |
| `apps/backend/app/api/routes/assistant.py` | Fix stream disconnect |
| `apps/backend/app/api/routes/health.py` | Use singleton Redis |
| `apps/backend/app/schemas.py` | Add data_mode, fix mode_used |
| `apps/backend/app/core/middleware.py` | Improve security headers |

---

## 11. Files to Remove

| File | Reason |
|------|--------|
| `apps/web/components/RightSidebar.tsx` | Unused |
| `apps/web/components/TopBar.tsx` | Duplicate |
| `apps/web/components/StatsGrid.tsx` | Unused, may contain fake stats |

---

## 12. Test Strategy

### Backend: `cd apps/backend && python -m pytest tests/ -q`
### Frontend: `cd apps/web && npm run lint && npm run typecheck && npm run build && npx playwright test`

---

## 13. Deployment Strategy

1. Fix all code defects → 2. Test locally → 3. Commit and push → 4. Verify deployments → 5. Run production tests

---

## 14. Rollback Strategy

- Git revert to `b6bd657`
- Vercel instant rollback via dashboard
- Render rollback via re-deploy

---

## 15. Execution Order

### Phase A: Foundation (Contexts & Shared State)
### Phase B: Data Honesty (Sample data, error mapping)
### Phase C: Frontend Pages (All route fixes)
### Phase D: Backend Fixes (Groq error safety, health, schemas)
### Phase E: Testing (Backend tests, Playwright E2E)
### Phase F: Deployment & Verification
