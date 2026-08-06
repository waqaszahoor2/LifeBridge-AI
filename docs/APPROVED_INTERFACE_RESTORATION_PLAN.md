# Approved Interface Restoration Plan — LifeBridge AI

**Date:** 2026-08-06  
**Target Page:** `/for-you` (LifeBridge AI Primary Intelligence Feed)  
**Goal:** Restore the approved LinkedIn-style 3-column desktop layout and single-column mobile interface with full Tailwind CSS v4 styling, unified state management, and robust backend feed connectivity.

---

## 1. Root Cause Analysis

### A. Missing Styles & CSS Pipeline Breakdown
1. **Missing Tailwind & PostCSS Dependencies**: `apps/web/package.json` lacked `tailwindcss`, `@tailwindcss/postcss`, and `postcss` in `devDependencies`.
2. **Missing PostCSS Configuration**: `apps/web/postcss.config.mjs` was absent, preventing Next.js / Turbopack from processing `@import "tailwindcss";`.
3. **Missing Theme Tokens & Direct Overrides**: `apps/web/app/globals.css` lacked `@import "tailwindcss";` and `@theme` definitions for `--color-primary-*` utilities (`primary-500`, `primary-600`, etc.), leading to unstyled buttons, unstyled links, and layout breakage.

### B. Feed API Connectivity & Display Failure
1. **Unformatted Error Display**: When the backend API is offline or unreachable, the UI currently exposes raw technical error text ("We could not load live feed updates. Please check backend API connectivity.") and collapses feed cards.
2. **Fallback Strategy**: Demo mode items and live API responses need clean, transparent labeling without exposing infra details to end users.

---

## 2. Component Management & Page Architecture

### Components to Remove / Re-scope on `/for-you`
- **Permanent App Shell Sidebar (`<Sidebar />`)**: Remove from the `/for-you` view; replace with Top Navigation + 3-Column Layout.
- **Large Marketing Hero Banner**: Replace with the approved feed composer card ("Ask or share something...") and compact category chips.
- **Unstyled Native Buttons & Links**: Replace with styled Tailwind/Lucide component buttons.
- **Clipped AI Assistant Link**: Replace with a fixed floating AI button near the bottom-right.

### Components to Preserve & Upgrade
- `Header.tsx`: Top Navigation with Logo, Search Input, Nav Links, Notifications Badge, Theme Toggle, Profile Dropdown.
- `LeftSidebar.tsx`: Profile summary card (banner, avatar, name/guest, headline, completeness bar, saved count) + Quick Access shortcuts card.
- `RightSidebar.tsx`: Sticky contextual widgets (Trending opportunities, Weather advisories, Quick Services, Safety alerts).
- `FeedCard.tsx`: LinkedIn-style feed cards with organisation header, verification badge, title, summary, image, tags, match score, and action toolbar.
- `MobileNav.tsx`: Bottom navigation bar for mobile viewports (<= 767px).
- `FloatingAssistantButton.tsx`: Floating AI Assistant trigger button.

---

## 3. Layout Specification (LinkedIn-Style 3-Column Contract)

### Desktop View (>= 1200px)
- **Top Sticky Header**: Full-width top navigation bar (`h-14`, sticky `top-0`, `z-50`).
- **Centered Grid Container**: `max-w-[1200px]`, centered with `mx-auto`, `gap-5` (20px).
- **Left Column (240px)**: `LeftSidebar` (Profile card + Quick Access shortcuts). Sticky `top-16`.
- **Center Column (flex-1 / ~600px)**: 
  - Feed Composer card ("Ask or share something..." input + Ask AI, Scan Content, Find Opportunity, Build Roadmap buttons).
  - Horizontal Category Chips: For You, Jobs, Scholarships, Skills, Safety, Disasters, Services.
  - Search, Sort, Refresh toolbar.
  - Infinite scroll Feed Cards list.
- **Right Column (300px)**: `RightSidebar` sticky info rail. Sticky `top-16`.

### Mobile View (<= 767px)
- Single column layout (Center Feed). Left and Right sidebars hidden.
- Compact Top Header + Bottom Navigation Bar (`MobileNav`).
- Floating AI button adjusted above bottom navigation (`bottom-20`).

---

## 4. Execution Plan

### Phase 2 — Fix CSS Build Pipeline (Tailwind v4)
1. Install `tailwindcss`, `@tailwindcss/postcss`, `postcss` in `apps/web`.
2. Create `apps/web/postcss.config.mjs`.
3. Update `apps/web/app/globals.css` with `@import "tailwindcss";` and `@theme` primary color definitions.
4. Clean up broad native element resets that override button and link styling.

### Phase 3 — Restore Exact Approved Layout on `/for-you`
1. Re-architect `/for-you/page.tsx` into top navigation bar + 3-column layout.
2. Implement feed composer card and compact category chips.
3. Polish `LeftSidebar`, `RightSidebar`, `FeedCard`, and `Header`.

### Phase 6 — Fix Backend Feed Connection & Error Handling
1. Verify backend FastAPI endpoint `/api/v1/feed/for-you`.
2. Ensure user-friendly inline error card ("Live updates are temporarily unavailable. Please try again in a moment.") when API fails, keeping 3-column layout intact.
3. Label demo data clearly when in demo mode.

### Phase 8 — Unify State Management
1. Integrate `SavedItemsContext` for bookmark synchronization across Header, LeftSidebar, FeedCards, and Saved page.
2. Integrate `NotificationContext` for badge count synchronization.

### Phase 11-13 — Testing & Quality Assurance
1. Run `npm run typecheck` and `npm run build` in `apps/web`.
2. Run backend `pytest`.
3. Execute Playwright E2E tests.

### Phase 14 — Deployment & Final Report
1. Commit changes and push to `main` branch.
2. Create `docs/APPROVED_INTERFACE_FINAL_QA_REPORT.md`.
