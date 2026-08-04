# LifeBridge AI — AI Skill Mentor Implementation Plan

## Executive Summary
This document defines the architecture, user experience, database schema, AI pipeline, fallback mechanisms, security, testing, and deployment strategy for the **AI Skill Mentor** module in LifeBridge AI.

---

## 1. User Journey

```
[Start] ──> Navigate to /skills/mentor
             │
             ├──> Enter Natural Language Goal (e.g., "I know basic Python and SQL, want to learn Data Science in 6 months")
             ├──> Fill Optional Structured Preferences (Hours/week, Budget, Preferred Learning Style, Target Level)
             └──> Click "Generate My Roadmap" or "Use Sample Goal"
             │
             ▼
[Engine] ──> Backend Processes Request (AI Provider or Local Rule-Based Template Fallback)
             │
             ▼
[Dashboard] ──> Redirects to /skills/roadmap/[id]
                 ├── 7-Phase Vertical/Accordion Roadmap Timeline
                 ├── Weekly & Daily Learning Plan with interactive checkboxes
                 ├── "How to Use AI With This Skill" Workflows & Verification Warnings
                 ├── Tool Recommendations (Core, AI, Free, Advanced with filters)
                 ├── Real-World Projects & Final Capstone Project
                 ├── Phase Assessments & Internal Badges ("LifeBridge learning milestone")
                 ├── Resource Library (Docs, Courses, Datasets)
                 └── Interactive AI Mentor Chat Drawer for topic explanations & code reviews
```

---

## 2. Page & Route Structure

- `/skills`: SkillBridge Hub page with navigation to AI Skill Mentor, saved roadmaps, and CV analysis.
- `/skills/mentor`: Primary AI Skill Mentor goal creation & template selection interface.
- `/skills/roadmap/[roadmapId]`: Full interactive roadmap dashboard with timeline, daily schedule, AI workflows, tools, projects, and assessments.
- `/skills/progress`: User progress overview, skill confidence trends, study logs, and badge showcase.
- `/skills/projects`: Dedicated project library for all generated and saved skill projects.
- `/skills/assessments`: Skill checkpoints, quizzes, and milestone badges.
- `/skills/resources`: Curated learning resources library with filters (official, free, paid, community).

---

## 3. Component Structure (`apps/web/components/skill-mentor/`)

- `SkillGoalForm.tsx`: Goal textarea, structured options modal, suggestion chips, input validation.
- `SkillSuggestionChips.tsx`: Clickable skill chips (Python, SQL, Power BI, Data Science, Cloud, UI/UX, etc.).
- `RoadmapOverview.tsx`: Header card showing target role, overall progress %, streak count, and estimated completion date.
- `RoadmapTimeline.tsx`: Vertical desktop / accordion mobile timeline of 7 phases.
- `RoadmapPhaseCard.tsx`: Phase details (objectives, topics, duration, lessons, projects, checkpoint).
- `AIIntegrationPanel.tsx`: "How to use AI with this skill" cards, workflows, prompt examples, & verification warnings.
- `ToolRecommendationCard.tsx` & `AIToolCard.tsx`: Tool recommendations categorized into Core, AI, Free, Advanced.
- `DailyPlan.tsx` & `WeeklyPlan.tsx`: Schedule breakdown with interactive task toggles & rescheduling controls.
- `ProjectCard.tsx`: Real-world project details, dataset requirements, portfolio guidance, & submission links.
- `AssessmentCard.tsx`: Quizzes, debugging tasks, and internal milestone badges.
- `MentorChat.tsx`: Contextual AI assistant drawer for debugging, exercises, and explanation requests.
- `ProgressDashboard.tsx`: Analytics, confidence trends, study logs, and export actions (JSON/CSV/PDF).
- `ResourceCard.tsx`: Verified resources with cost, language, and official badges.

---

## 4. Backend Architecture (`apps/backend/app/`)

- `api/routes/skills_mentor.py`: FastAPI endpoints for analyzing goals, generating roadmaps, managing progress, assessments, and mentor chat.
- `services/skills_engine.py`: Skill extraction, prompt formatting, Pydantic validation, and fallback template generation.
- `services/ai_provider.py`: Adapter supporting Gemini, OpenAI, or local/template fallback mode.
- `models.py`: SQLAlchemy database models for persistence.
- `schemas.py`: Pydantic request/response schemas.

---

## 5. Database Schema

- `user_skill_goals`: `id`, `user_id`, `raw_goal`, `primary_skill`, `current_level`, `target_level`, `career_goal`, `hours_per_week`, `target_months`, `learning_style`, `free_resources_only`, `created_at`.
- `skill_roadmaps`: `id`, `user_id`, `goal_id`, `title`, `primary_skill`, `target_role`, `estimated_hours`, `completion_percentage`, `current_phase`, `mode_used` ("ai_generated" vs "structured_template"), `created_at`.
- `roadmap_phases`: `id`, `roadmap_id`, `phase_number`, `title`, `objective`, `estimated_hours`, `is_completed`.
- `roadmap_lessons`: `id`, `phase_id`, `title`, `duration_minutes`, `is_completed`, `topics_json`, `ai_usage_note`.
- `roadmap_projects`: `id`, `roadmap_id`, `phase_id`, `title`, `description`, `difficulty`, `dataset_req`, `is_capstone`, `github_url`, `is_completed`.
- `roadmap_assessments`: `id`, `roadmap_id`, `phase_id`, `title`, `questions_json`, `score`, `is_passed`.
- `mentor_conversations`: `id`, `user_id`, `roadmap_id`, `created_at`.
- `mentor_messages`: `id`, `conversation_id`, `sender` ("user" vs "mentor"), `content`, `citations_json`, `created_at`.

---

## 6. Recommendation Logic

- Analyzes user's known skills and filters out redundant beginner topics.
- Calculates weekly study capacity: `Weekly Hours = Hours Per Day * Days Per Week`.
- Scales total duration and adjusts phase pace accordingly.
- Maps career goals (e.g. "Data Scientist" -> Statistics, Pandas, Machine Learning, SQL, Power BI).
- Enforces budget filters: If `free_resources_only = true`, replaces paid platforms with official docs, GitHub, YouTube, and Kaggle.

---

## 7. AI Integration Pipeline

- **Backend Prompt Template**: Instructs LLM to return strict Pydantic JSON matching the 7-Phase roadmap structure.
- **Verification Requirement**: Each AI workflow includes a clear "Verification Requirement" (e.g. "Do not blindly run generated SQL queries; test on staging data").
- **Privacy Warning**: "Never upload proprietary company data or sensitive credentials to public AI models."

---

## 8. No-AI Fallback Logic (Template / Rule-Based Engine)

When `AI_ENABLED=false` or when AI provider calls fail or timeout:
- Activates **Structured LifeBridge Roadmap Engine**.
- Selects from rich, pre-built, expert-validated skill templates for 15+ domains (Data Science, Python, Power BI, Machine Learning, Web Dev, UI/UX, Cloud, Cybersecurity, etc.).
- Personalises template durations, schedules, and projects using the user's available study hours and current experience level.
- Displays label: `"Generated using LifeBridge structured roadmap engine"`.

---

## 9. Progress-Tracking Model

- Tracks completed lessons, projects, and assessments.
- Real-time recalculation of `completion_percentage`.
- Log daily study sessions to track streak counts.
- State persisted in PostgreSQL / SQLite database with fallback local caching for demo modes.

---

## 10. Resource Model

- Categorized into: Official Documentation, Free Courses, Practice Sites, Datasets, Books, Communities.
- Badges: `Official`, `Community`, `Free`, `Paid`, `Unverified`.
- Zero fake metrics: Ratings and enrollment counts omitted unless verified from official APIs.

---

## 11. Assessment & Milestone Model

- Quizzes & practical tasks for each phase.
- Scoring system with feedback on strong vs weak topics.
- Internal completion badge labelled: `"LifeBridge learning milestone"`.

---

## 12. Security Requirements

- All AI API keys confined strictly to backend environment variables (`AI_API_KEY`, `AI_PROVIDER`).
- Zero exposure in client-side Next.js code or `NEXT_PUBLIC_` variables.
- Input validation & sanitization on all goal strings to prevent prompt injection.
- Safe Markdown rendering using proper React escaping.

---

## 13. Responsive Design

- **Desktop Layout (3-Column)**: Left navigation + center timeline & schedule + right AI Mentor & tools rail.
- **Mobile Layout (1-Column)**: Single column with top summary card, horizontal phase chips, collapsible accordions, and AI Mentor accessible via full-screen drawer.

---

## 14. Testing Plan

- Frontend unit & component integration tests (`npm test`).
- Backend endpoint unit tests (`pytest`).
- Type checking (`npm run typecheck`) and ESLint (`npm run lint`).
- Production build validation (`npm run build`).

---

## 15. Deployment Plan

- Frontend deployed on Vercel (`apps/web` root directory).
- Backend deployed on FastAPI app server with PostgreSQL.
- Environment variables configured per environment without exposing private keys.

---

## 16. Future Extension Plan

- PDF certificate generator for internal milestone completion.
- Interactive code playground for direct in-browser exercise submission.
- Real-time job market matching connecting user skills to live posted opportunities.
