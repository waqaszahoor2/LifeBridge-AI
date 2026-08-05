# LifeBridge AI — Final Production Repair & Polish Plan

## Objective
Address every point in the deep production audit to ensure LifeBridge AI is robust, fully integrated, secure, accessible (WCAG 2.2 AA), compliant with SEO best practices, and deployed with zero hard-coded state or developer jargon.

---

## Architecture & Layout System
- **Unified Providers**: Wrap application in `AppProviders` (`AuthProvider`, `NotificationProvider`, `ThemeProvider`).
- **Single AppShell & Header**: Use `AppShell` with `AppHeader` across all routes (including `/assistant`, `/login`, `/settings`, `/about`, `/help`, etc.).
- **Single Source Notification & Theme State**: Manage notification count and theme mode centrally.

---

## Authentication & User State
- **No Hard-Coded User Data**: Remove all references to "Aarav" or static demo names.
- **Dynamic Session Handling**: Use `AuthProvider` with `GET /api/v1/auth/me` fallback and `localStorage` session state.
- **State-Based UI**:
  - *Guest*: Display "Hello, Guest" and a "Sign In" link. Never render "Log Out" or fake user menus.
  - *Authenticated*: Display "Hello, {user.name}", Profile menu, and "Log Out".
  - *Login Page*: Render Sign In form for guests OR user profile card for authenticated users (never both simultaneously).

---

## For You Feed & Data Reliability
- **Complete Feed Lifecycle**:
  - Initial server-rendered/cached items
  - Skeleton loading cards
  - Success cards with detailed metadata (title, category, source, published date, deadline, verification status, recommendation reason, save, share, view details)
  - Empty, offline, rate-limited, timeout, and retry states.

---

## AI Assistant & Groq Integration
- **Hardened Endpoint**: FastAPI `/api/v1/assistant/chat` and `/api/v1/assistant/health` with multi-turn conversation memory.
- **UI Integration**: Wrap `/assistant` in `<AppShell>` with a **← Back to Dashboard** link, mode selector, stop/retry/regenerate buttons, and mobile bottom navigation compatibility.
- **Honest Citations**: Display `"AI-generated guidance. Verify important information independently."` unless an authenticated HTTP source is returned.

---

## Dedicated Help, Privacy & Legal Routes
- **`/help` Route**: FAQ, contact form, bug report, emergency limitations, accessibility support.
- **Help Link Redirect**: Update Help & Support link to point to `/help` instead of `/about`.
- **Legal Routes**:
  - `/privacy`: Privacy policy, data collection & retention explanation.
  - `/terms`: Terms of use & emergency-use disclaimers.
  - `/data-sources`: Overview of official data sources (NASA, GDACS, Open-Meteo, OpenStreetMap, ReliefWeb).
  - `/model-transparency`: AI model details, Groq llama-3.1-8b-instant architecture, guardrails.
  - `/accessibility-statement`: WCAG 2.2 AA statement.

---

## Execution Checklist
1. [x] Create plan document.
2. [ ] Implement providers & single AppShell layout.
3. [ ] Implement dynamic AuthProvider & remove hardcoded user data.
4. [ ] Build `/help`, `/privacy`, `/terms`, `/data-sources`, `/model-transparency`, `/accessibility-statement`.
5. [ ] Update Header navigation links.
6. [ ] Harden FastAPI backend endpoints & Groq service.
7. [ ] Build Next.js app (`npx next build`) and verify zero errors.
8. [ ] Generate `docs/FINAL_PRODUCTION_QA_REPORT.md`.
9. [ ] Push changes to GitHub (`origin main`).
