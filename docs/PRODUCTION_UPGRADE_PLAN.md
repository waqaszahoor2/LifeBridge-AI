# Comprehensive Implementation Plan — Production Upgrade & Groq ChatGPT-Style Assistant

## Overview
This plan outlines the systematic upgrade of the LifeBridge AI application to fix production UI/UX bugs, integrate a full-featured `/assistant` ChatGPT-style page and floating widget, unify global headers and navigation, fix feed loading, refine Saved Items, upgrade location pickers, and finalize secure FastAPI Groq AI endpoints.

---

## Phase 1: Backend Services & API Endpoints (`apps/backend`)
1. **Groq Assistant Endpoints (`apps/backend/app/api/routes/assistant.py`):**
   - Endpoint `POST /api/v1/assistant/chat`: Accepts `messages` array (`role`, `content`), `mode` (`lifebridge_assistant` | `skill_coach`), `roadmap_id`, returns `message` (`role: "assistant"`, `content`), `model`, `conversation_id`, `citations`, `disclaimer`.
   - Endpoint `GET /api/v1/assistant/health`: Returns safe status (`status: "ready"`, `provider: "groq"`, `model_configured: true`, `api_key_configured: true`). Never returns secret keys.
   - Server-Side System Prompt: Empathetic, concise, supportive, safety-focused, strict guardrails against false employment promises, identity requests, or emergency authority replacement.
   - Robust Rate-Limiting & Error Handling: Graceful handling of missing API key, Groq rate limits (429), timeouts, returning clear user-facing messages.

2. **Backend Configuration & CORS (`apps/backend/app/core/config.py`):**
   - Ensure server-side `GROQ_API_KEY` and `GROQ_MODEL` resolution.
   - Ensure CORS settings accept Next.js web application origins in production and local environments.

---

## Phase 2: Core Frontend Shell, Header & Navigation (`apps/web`)
1. **Unified Global Header (`components/Header.tsx` & `AppShell.tsx`):**
   - Remove duplicate inner page headers in `/skills`, `/opportunities`, `/saved`, `/accessibility`, `/services`, etc.
   - Single header with Logo, Global Search, AI Assistant button, Language selector, Theme toggle, Single Notification badge count (`2`), and User Profile menu.

2. **Navigation & Routes (`components/Sidebar.tsx`, `components/MobileNav.tsx`, `lib/types.ts`):**
   - Include `/assistant` in main navigation links and mobile bottom navigation bar (`Home`, `Opportunities`, `Assistant`, `Saved`, `More`).
   - Add floating AI Assistant action button across all pages (bottom-right).

---

## Phase 3: Dedicated `/assistant` ChatGPT-Style Page (`apps/web/app/assistant/page.tsx`)
1. **Full Conversational Interface:**
   - Public route `/assistant`.
   - Mode Selector: `LifeBridge Assistant` vs `AI Skill Coach`.
   - Starter Prompts: "Help me choose a skill to learn", "Create a data-science roadmap", "Which AI tools should I learn?", "Explain how LifeBridge AI works", "Help me prepare for a scholarship", "Suggest a portfolio project".
   - Feature Controls: Multiline text input (Enter to send, Shift+Enter for newline), Send button, Stop generating, Retry last response, Copy response to clipboard, Clear conversation history, Streaming/typewriter typewriter effect simulation, Loading indicator, Error alert box.
   - Full Multi-Turn Context: Remembers previous messages in the session state.

---

## Phase 4: Homepage & Feed Fixes (`apps/web/app/page.tsx` & `/for-you`)
1. **Hero Section:**
   - Heading: "Practical AI support for opportunities, skills, safety and everyday decisions."
   - Description: "Discover trusted opportunities, develop useful skills, verify suspicious content and find essential services from one accessible platform."
   - Action Buttons: "Ask LifeBridge AI", "Explore Opportunities", "Build My Profile".
2. **Feed Loading & Skeleton:**
   - Eliminate permanent "Loading For You Feed..." text.
   - Render modern animated skeleton cards while fetching.
   - Provide Retry button, Error state, and Offline demo sample feed fallback so the page always renders cleanly.

---

## Phase 5: Page-Level Refinements & User Experience
1. **SkillBridge (`/skills`):**
   - Add "Chat with AI Skill Coach" button and quick prompt launchers.
   - Ensure CV analysis results offer direct follow-up actions without transmitting raw personal PII.

2. **Opportunities (`/opportunities`) & DisasterLink (`/disasters`):**
   - Add initial skeleton loading state, clean card grids, empty filter state, clear timestamping ("Published X ago", "Last checked Y ago"), verification badges ("Verified Source" / "Demo"), and zero fake data ambiguity.

3. **Saved Items (`/saved`):**
   - Enable local storage persistence for public/demo users.
   - Add search input, category filtering, remove item action, note-taking, deadline reminders, and expired indicators.
   - Remove internal API path strings like `/api/v1/saved`.

4. **Location Services (`/accessibility`, `/services`):**
   - Replace mandatory raw latitude/longitude inputs with "Use My Location" browser geolocation button, City/Address search input, and interactive Location selector.
   - Move raw coordinate inputs into an expandable "Advanced Settings" accordion.

5. **User-Facing Copy & Aesthetics:**
   - Remove all developer-centric diagnostic text ("API secrets stay only in the FastAPI backend", internal route names).
   - Ensure high-contrast, accessible styling in both Light and Dark modes across 320px–1440px viewport widths.

---

## Phase 6: Testing & Production Deployment
1. Run backend unit tests (`pytest`).
2. Run frontend unit tests (`npm test`).
3. Run Next.js production build (`npx next build`).
4. Commit and push to GitHub repository.
