# Vercel Deployment

Vercel hosts the Next.js frontend. The FastAPI service and database are deployed separately.

1. Push the complete repository to GitHub.
2. Create a Vercel project from the repository.
3. Set **Root Directory** to `apps/web`.
4. Framework preset: Next.js.
5. Add environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND-DOMAIN
```

6. Deploy.

The included `apps/web/package.json` contains Next.js as a direct dependency, avoiding the “No Next.js version detected” error.

Do not set the repository root as the Vercel Root Directory; the correct package.json is inside `apps/web`.
