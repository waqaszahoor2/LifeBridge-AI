# LifeBridge AI — Vercel Web Deployment Guide

This guide outlines step-by-step instructions to deploy `apps/web` (Next.js 16) to Vercel.

---

## 1. Important Configuration Settings

When importing the repository into Vercel:

- **Root Directory**: `apps/web`  
  *(CRITICAL: Do not set the repository root directory as the Vercel Root Directory; `package.json` is located inside `apps/web`)*
- **Framework Preset**: `Next.js`
- **Build Command**: `next build` (or default)
- **Output Directory**: `.next` (default)

---

## 2. Environment Variables Checklist

Set the following environment variables in the Vercel Project Settings:

| Environment Variable Name | Required? | Purpose / Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | Public HTTPS URL of the FastAPI backend (e.g. `https://api.yourdomain.com`). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Optional | Client API key for Web Push notifications. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Optional | Firebase auth domain for client push. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Optional | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional | Firebase storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Optional | Firebase App ID. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Optional | VAPID key for web push token generation. |

> **SECURITY NOTE**: Never place private secrets (such as JWT secrets, database passwords, or Firebase service account keys) in `apps/web`. Private secrets must remain exclusively on the FastAPI backend server.

---

## 3. Step-by-Step Deployment Procedure

1. **Push Changes to Repository**:
   Ensure your code is pushed to your remote GitHub / GitLab / Bitbucket repository.

2. **Create New Project in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your git account and import the repository.

3. **Configure Project Settings**:
   - Expand **Root Directory**, click **Edit**, and select `apps/web`.
   - Under **Environment Variables**, add `NEXT_PUBLIC_API_BASE_URL`.

4. **Deploy**:
   - Click **Deploy**. Vercel will run `npm install` and `next build`.
   - Verify that all static pages generate cleanly.

5. **Configure Backend CORS**:
   - Update your backend environment (`config/apis.env` or production host environment) with:
     ```env
     ALLOWED_ORIGINS=https://your-vercel-project.vercel.app
     ```
