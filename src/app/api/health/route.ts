import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (e) {
    console.error("[health] db check failed:", e);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
