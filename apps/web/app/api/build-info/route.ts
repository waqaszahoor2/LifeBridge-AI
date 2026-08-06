import { NextResponse } from "next/server";

const BUILD_TIMESTAMP = process.env.APP_BUILD_TIMESTAMP || new Date().toISOString();

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

  return NextResponse.json(
    {
      version,
      commit,
      branch,
      environment: process.env.NODE_ENV || "production",
      built_at: BUILD_TIMESTAMP,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
