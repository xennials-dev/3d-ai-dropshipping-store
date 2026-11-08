import { NextResponse } from "next/server";
import { scanAllAIProviders } from "@/lib/localAiRouter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await scanAllAIProviders();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[ai/models] Discovery failed:", error);
    return NextResponse.json(
      {
        providers: [
          {
            id: "deterministic",
            name: "Vendora Rule Engine (Zero-Latency Offline)",
            endpoint: "in-memory",
            isOnline: true,
            models: [{ id: "rule-engine", name: "Built-in Catalog Matcher", provider: "deterministic" }],
            latencyMs: 1,
          },
        ],
        recommended: { provider: "deterministic", model: "rule-engine" },
        error: error?.message || "Unknown error",
      },
      { status: 200 }
    );
  }
}
