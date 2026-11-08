import { NextResponse } from "next/server";
import { computeStoreStats } from "@/lib/store";
import { aiInsights } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await computeStoreStats();
    const { insights, source } = await aiInsights(stats);
    return NextResponse.json({ insights, source, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[ai/insights]", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
