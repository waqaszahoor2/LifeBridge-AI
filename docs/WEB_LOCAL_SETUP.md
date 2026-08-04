# LifeBridge AI — Web Local Setup Guide

This document describes how to launch and run the Next.js web application locally.

---

## Prerequisites

- **Node.js**: `v20.9.0` or higher
- **Python**: `3.10+` (for running local FastAPI backend)

---

## Quick Start Commands

```bash
# 1. Navigate to apps/web
cd apps/web

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Run automated test suite
npm test

# 5. Check linting and TypeScript compilation
npm run lint
npm run typecheck

# 6. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Backend API

To run with the local FastAPI backend:

1. Open a second terminal window in `apps/backend`.
2. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
3. The frontend at `http://localhost:3000` will automatically detect the backend and display `"Live API"`.
4. If the backend is stopped, the web app gracefully falls back to displaying realistic demo data.
