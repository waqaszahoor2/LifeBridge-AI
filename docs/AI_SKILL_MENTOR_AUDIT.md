# LifeBridge AI — AI Skill Mentor Audit

## 1. Overview & Repository Audit

### Inspected Files & Directories
- **Frontend (`apps/web`)**:
  - `package.json`: Next.js `16.3.0` (Turbopack, App Router), React `19.2.0`, `@tanstack/react-query ^5.101.4`, TypeScript `^5.9.0`.
  - `app/layout.tsx`, `app/globals.css`: Global styles, design tokens, light/dark mode variables, glassmorphism card definitions.
  - `components/AppShell.tsx`, `components/Sidebar.tsx`, `components/Header.tsx`, `components/MobileNav.tsx`: Modern 3-column shell layout.
  - `components/ui/Icon.tsx`: Central SVG icon primitive supporting `academic`, `sparkles`, `book`, `briefcase`, `shield`, `check`, etc.
  - `app/skills/page.tsx`: Legacy CV skill extraction page.
  - `lib/api.ts`, `lib/types.ts`: Central API client and type definitions.
- **Backend (`apps/backend`)**:
  - `main.py`: FastAPI server setup with CORS, health routes, logging.
  - `models.py`: SQLAlchemy models (`User`, `FeedItem`, `SavedItem`, `NotificationToken`, `SourceConfig`, `AuditLog`).
  - `api/routes/ai.py`: Gemini / LLM integration placeholder route.
  - `core/config.py`: Environment variable configuration (`DATABASE_URL`, `SECRET_KEY`, etc.).
  - `tests/`: Pytest suite (18 passed tests).

---

## 2. Existing Routes & Architecture

### Routes Found
- Frontend: `/for-you`, `/jobs`, `/scholarships`, `/disasters`, `/opportunities`, `/services`, `/trust-scanner`, `/skills`, `/profile`, `/saved`, `/settings`.
- Backend: `/api/v1/auth`, `/api/v1/feed`, `/api/v1/saved`, `/api/v1/profile`, `/api/v1/services`, `/api/v1/ai`, `/api/v1/admin`.

### Reusable Components
- `AppShell`: Page shell handling header title, refresh handler, desktop sidebar, and mobile nav.
- `Sidebar`: Desktop left navigation supporting active tab highlighting and promo cards.
- `Header`: Sticky top bar supporting dark/light mode toggle, notification badge, and profile greeting.
- `MobileNav`: Touch-friendly bottom bar for mobile screens.
- `Icon`: SVG icon primitive.
- `PageIntro`: Standard page header text component.

### Missing Components Needed for AI Skill Mentor
- `SkillGoalForm`: Natural language & structured goal input.
- `SkillSuggestionChips`: Suggested skills toolbar (Python, Power BI, SQL, Data Science, etc.).
- `RoadmapOverview` & `RoadmapTimeline`: Interactive vertical and accordion timeline.
- `RoadmapPhaseCard`: Phased learning breakdown (Foundations, Core, Applied, AI Integration, Advanced, Portfolio, Capstone).
- `AIIntegrationPanel`: Detailed breakdown of "How to use AI with this skill" with workflows and verification steps.
- `ToolRecommendationCard` & `AIToolCard`: Grouped tool suggestions with free/paid filters.
- `DailyPlan` & `WeeklyPlan`: Interactive daily schedule with completion checkboxes & rescheduling.
- `MentorChat`: Context-aware AI Mentor chat drawer with citation of roadmap topics and disclaimers.
- `ResourceCard`: Verified learning resources (official docs, courses, practice sites).
- `ProjectCard`: Real-world projects with dataset requirements & portfolio guidance.
- `AssessmentCard`: Checkpoints, quizzes, and internal "LifeBridge learning milestone" badges.
- `ProgressDashboard`: Detailed skill confidence, streak, and study time analytics.

---

## 3. Database & API Limitations

### Current Database Limitations
- `models.py` only contains `User`, `FeedItem`, `SavedItem`, `NotificationToken`, `SourceConfig`, `AuditLog`.
- No database tables currently exist to persist skill goals, structured roadmaps, phases, lessons, user progress, study sessions, assessments, or mentor conversations.

### Current API Limitations
- `/api/v1/ai` currently provides a basic LLM ping endpoint without structured JSON schema validation or prompt templates.
- Need dedicated Pydantic models & endpoints for goal analysis, roadmap generation, progress updates, and mentor chat.

---

## 4. Security & Credential Audit

- **Frontend Environment Check**: No secret keys (`AI_API_KEY`, `DATABASE_URL`, `SECRET_KEY`) are exposed in `NEXT_PUBLIC_` variables or client-side code.
- **AI Credential Protection**: All AI provider keys are confined to backend environment variables.
- **Sanitisation**: Markdown rendering and AI output must be sanitised on both backend (schema validation) and frontend (XSS protection).

---

## 5. Proposed AI Skill Mentor Architecture

```
User Goal Request (Natural Language + Structured Parameters)
                      │
                      ▼
        FastAPI Endpoint POST /skills/mentor/generate-roadmap
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[Mode A: AI Provider]      [Mode B: Template Engine]
(Gemini / OpenAI / LLM)     (Rule-Based Skill Extractor
+ Schema Validation          + Curated Skill Templates)
        └─────────────┬─────────────┘
                      ▼
     Structured Roadmap DB Storage (SQLite / PostgreSQL)
                      │
                      ▼
      Next.js Frontend (/skills/mentor, /skills/roadmap/[id])
```

---

## 6. Audit Verification Summary
- **Frontend Tests**: 20/20 passed (`npm test`).
- **Backend Tests**: 18/18 passed (`.venv\Scripts\python -m pytest`).
- **Vercel Readiness**: `apps/web` root directory with pure Next.js client routes.
