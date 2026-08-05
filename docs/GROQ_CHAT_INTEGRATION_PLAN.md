# Implementation Plan — Groq AI Chat Integration

## Goal
Integrate Groq AI (`llama-3.1-8b-instant`) into the LifeBridge AI FastAPI backend (`apps/backend`) and connect the Next.js frontend chat interface, with environment key protection, rate-limiting, conversation history support, and mobile-responsive UI.

---

## 1. Environment & Configuration
- Create `apps/api/.env` and `apps/backend/.env` with:
  ```env
  GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
  GROQ_MODEL=llama-3.1-8b-instant
  ```
- Ensure `.env` is listed in `.gitignore`.
- Create `.env.example` in `apps/api/`, `apps/backend/`, and project root without secret keys.
- Update `apps/backend/app/core/config.py` to add `groq_api_key: str = ""` and `groq_model: str = "llama-3.1-8b-instant"`.

---

## 2. Backend Service & Route (`apps/backend`)
- Add `groq` and `python-dotenv` to `apps/backend/requirements.txt`.
- Create `apps/backend/app/services/groq_service.py` to handle calls via `groq.Groq` SDK with fallback logic when offline or key is unset.
- Create `apps/backend/app/api/routes/assistant.py`:
  - Define endpoint `POST /api/v1/assistant/chat`.
  - Enforce in-memory sliding window rate limiting (e.g., 20 requests/minute).
  - Process multi-turn message histories (`role`, `content`).
- Register `assistant.router` in `apps/backend/app/api/router.py`.

---

## 3. Frontend Integration (`apps/web`)
- Add `sendAssistantChat` function in `apps/web/lib/api.ts` calling `/api/v1/assistant/chat`.
- Update `MentorChat.tsx` to consume the unified assistant chat endpoint with multi-turn message history.
- Ensure loading state, error banners, rate limit warnings, and mobile responsive chat UI.

---

## 4. Verification & Testing
- Run FastAPI tests / validation scripts.
- Run Next.js build test (`npx next build`).
- Verify no secrets exposed in client code.
