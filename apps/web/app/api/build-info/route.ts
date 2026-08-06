import { NextResponse } from "next/server";

export async function GET() {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    "development";

  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GIT_COMMIT_REF ||
    "main";

  const version = process.env.APP_VERSION || "1.0.0";
  const builtAt = process.env.APP_BUILD_TIMESTAMP || "2026-08-06T10:00:00.000Z";

  return NextResponse.json(
    {
      version,
      commit,
      branch,
      environment: process.env.NODE_ENV || "production",
      built_at: builtAt,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
