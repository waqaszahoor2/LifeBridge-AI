import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "LifeBridge AI Web",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
}
