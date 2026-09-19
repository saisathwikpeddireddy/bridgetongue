import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "bridgetongue",
    // The app is designed to run without a database; report, do not fail.
    database: getDb() ? "configured" : "not configured",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    time: new Date().toISOString(),
  });
}
