# Exact Approved Dashboard Repair Plan — LifeBridge AI

**Date:** 2026-08-06  
**Target Visual Contract:** Approved Light Dashboard Screenshot (`docs/approved_screenshot.png`)  
**Target Route:** `/for-you` (LifeBridge AI Primary Feed)

---

## Executive Summary & Root Cause Analysis

### 1. Root Cause Analysis of Broken Dark View vs Approved Light Contract
- **CSS Pipeline Failure**: Global CSS rules in legacy files contained broad element selectors (`button`, `a`, `select`, `input`) that stripped default borders, padding, and background colors, turning styled Tailwind UI elements into raw browser controls.
- **Legacy Layout Rendering**: Old hero blocks (`LifeBridge Intelligence Feed`, "Practical AI support...", raw link lists, and unstyled search bars) were still present in page files or rendered conditionally.
- **Incorrect Card Layout**: Feed cards defaulted to vertical image-under-text stacking instead of the required horizontal desktop composition (42% image left, 58% content right).
- **Missing / Incorrect Right Sidebar**: The right sidebar lacked the exact approved widgets (Weather Now + 4-day forecast, Quick Services 2x2 grid, Stay Safe card, Daily Tip).
- **Backend API Connectivity**: Hardcoded backend fallbacks or unconfigured CORS/API endpoints caused feed requests to fail with generic connection error alerts.
- **Unstyled Floating Link**: The AI assistant button rendered as a raw unstyled link clipping at the top right of the viewport.

---

## Technical Audit & System State

| Component / Subsystem | Current State | Target Approved Contract |
|---|---|---|
| **Tailwind CSS v4** | `@import "tailwindcss";` in `globals.css` with `@theme` tokens | Active utility classes without broad CSS reset interference |
| **Left Sidebar** | `Sidebar.tsx` fixed 250px vertical navigation | 250px fixed navigation (Logo, For You, Latest, Jobs, Scholarships, Disasters, Weather, Services, Safety, Learning, AI Companion Card, Settings, Help, Log Out) |
| **Top Header Bar** | `Header.tsx` starts after left sidebar | Header starting after sidebar with Title ("For You"), Subtitle ("Personalized updates..."), Refresh button, Notification bell + popover, User greeting & avatar |
| **Center Feed Column** | Flex-1 (`minmax(650px, 1fr)`) container | Category tabs, horizontal desktop feed cards, continuous infinite scroll, user-friendly retry states |
| **Right Sidebar** | `RightSidebar.tsx` width 320px | Weather Now + 4-day forecast, Quick Services 2x2 grid, Stay Safe card, Daily Tip card |
| **Floating Controls** | `FloatingAssistantButton.tsx` | Fixed bottom-right rounded pill button (`bottom-6 right-6`), z-50, hover animations |

---

## Detailed Phase Execution Plan

### Phase 2: Fix Styling & Tailwind v4 Pipeline
1. Verify `apps/web/package.json` contains `tailwindcss`, `@tailwindcss/postcss`, and `postcss`.
2. Ensure `apps/web/postcss.config.mjs` configures `@tailwindcss/postcss`.
3. Audit `apps/web/app/globals.css` to eliminate any broad native element overrides destroying button/link/select styling.
4. Verify root layout `app/layout.tsx` imports `./globals.css` cleanly without duplicate stylesheets.

### Phase 3: Remove Broken Legacy Page Markup
1. Purge all legacy hero elements from `apps/web/app/for-you/page.tsx`:
   - "LifeBridge Intelligence Feed" small heading
   - "Practical AI support for opportunities, skills..." hero heading
   - Raw link lists (`Ask LifeBridge AI`, `Explore Opportunities`, `Build My Profile`)
   - Unstyled search inputs and native grey selects
   - Technical backend connectivity messages

### Phase 4: Restore Exact Approved Desktop & Mobile Layout
- **Desktop Grid Proportions**:
  `grid-template-columns: 250px minmax(650px, 1fr) 320px;` with max width `1550px` – `1650px`.
- **Left Navigation (`Sidebar.tsx`)**:
  - Teal heart logo + "LifeBridge AI" + "AI for a safer, healthier life".
  - Active item `For You` with teal background (`#008f8a` / `#0d9488`).
  - Full item list: For You, Latest, Jobs, Scholarships, Disasters, Weather, Services, Safety, Learning.
  - LifeBridge AI Assistant card + "Chat Now" CTA.
  - Footer links: Settings, Help & Support, Log Out.
- **Top Header (`Header.tsx`)**:
  - Title: **For You**
  - Subtitle: *Personalized updates and insights that matter to you.*
  - Action controls: `[ 🔄 Refresh ]`, `🔔` Notification Bell (with interactive popover), User Greeting ("Hello, Aarav") + Avatar.
- **Center Feed (`for-you/page.tsx`)**:
  - Urgent alert banner displayed **only** when an active real alert exists.
  - Category pill tabs: For You, Latest, Jobs, Scholarships, Disasters, Weather, Services, Safety, Learning.
  - Horizontal Desktop Feed Cards: 42% left image thumbnail (labeled "Illustrative image" when placeholder photos are used), 58% right content (category, timestamp, bookmark, title, summary, tags, view count, comments, share link).
- **Right Information Rail (`RightSidebar.tsx`)**:
  - **Weather Now**: Temperature (26°C Cloudy in Guwahati, Assam), humidity (72%), wind (8 km/h), pressure (1012 hPa), 4-day forecast (Sat, Sun, Mon, Tue).
  - **Quick Services**: 2x2 grid (Telemedicine, Ambulance, Blood Donor, Nearby Shelter).
  - **Stay Safe**: Location sharing card.
  - **Daily Tip**: Contextual quote card.

### Phase 5 & 6: Weather & Quick Services Functional Fixes
- Connect Weather widget to live API or present a clear "Demonstration weather — not current conditions" indicator when live telemetry is unavailable.
- Wire Quick Services buttons to route directly to relevant category filters (`/services?type=telemedicine`, `/services?type=ambulance`, etc.).

### Phase 7: Honest Share Location Workflow
- Implement native `navigator.geolocation` and `navigator.share` / clipboard fallback.
- Show success message ONLY after location link is actually generated and copied/shared.

### Phase 8: Feed API Connectivity & Resilient Fallbacks
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to live FastAPI backend (`https://lifebridge-ai-backend.onrender.com` or production URL).
- If backend is offline, display styled inline error card inside center column without breaking dashboard grid layout.

### Phase 9 & 10: Category Tabs, Toolbar, & Feed Card Actions
- Category tabs styled as rounded pill buttons (active: teal background with white text).
- Search, Sort, & Refresh toolbar functioning in real-time.
- Save bookmarks synchronized with `SavedItemsContext`.
- Report & View Source validated strictly (HTTPS URL validation).

### Phase 11: Floating AI Control
- Floating button positioned `bottom-6 right-6` (or `bottom-20` on mobile above bottom nav).
- Styled pill button with sparkles icon and "Ask LifeBridge AI" tooltip.

### Phase 12 & 13: Responsive Layout & Dark/Light Modes
- **Desktop (>= 1280px)**: 3-column layout.
- **Tablet (768px - 1023px)**: Hide right rail, retain left sidebar + feed.
- **Mobile (<= 767px)**: Single column feed, top header, bottom navigation bar (`MobileNav.tsx`).
- **Dark Mode**: Deep navy background (`#08111e`), dark card surfaces (`#111d2c`), white primary text, teal accents.

---

## Verification & Rollback Plan

### Automated Test Suite Execution
1. Next.js Production Build: `npm run build --prefix apps/web`
2. Web Unit Test Suite: `npm test --prefix apps/web`
3. Backend Pytest Suite: `apps/backend/.venv/Scripts/python.exe -m pytest apps/backend/tests/`
4. Playwright E2E Suite: `npx playwright test`

### Rollback Strategy
If build or visual regression tests fail:
1. Revert to stable commit using `git reset --hard HEAD~1`.
2. Inspect log diffs and re-verify CSS imports.
