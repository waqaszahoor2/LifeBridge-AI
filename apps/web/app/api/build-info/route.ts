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

  // In production, a real build timestamp is required — never return a fake default.
  if (process.env.NODE_ENV === "production" && !rawTimestamp) {
    return NextResponse.json(
      {
        error: "Build configuration error",
        detail: "APP_BUILD_TIMESTAMP is not set. Please configure it in your deployment environment.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  // In development, use a clear indicator rather than a fake production date.
  const builtAt = rawTimestamp || "development-build";

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
