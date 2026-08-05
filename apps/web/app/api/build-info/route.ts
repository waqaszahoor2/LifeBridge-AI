import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.0.0",
    commit: "a45bcda",
    environment: process.env.NODE_ENV || "production",
    built_at: new Date().toISOString(),
  });
}
