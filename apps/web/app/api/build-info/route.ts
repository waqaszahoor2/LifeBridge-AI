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
  const rawTimestamp = process.env.APP_BUILD_TIMESTAMP;

  // Return build timestamp or auto-generated ISO date
  const builtAt = rawTimestamp || (process.env.NODE_ENV === "production" ? new Date().toISOString() : "development-build");

  return NextResponse.json(
    {
      version,
      commit,
      branch,
      environment: process.env.NODE_ENV || "development",
      built_at: builtAt,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
