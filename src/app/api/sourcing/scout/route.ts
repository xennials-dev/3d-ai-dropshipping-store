import { NextRequest, NextResponse } from "next/server";
import { runAutonomousScout, ScoutFilterCriteria } from "@/lib/opportunityEngine";
import { MARKET_NICHES, SOURCED_CANDIDATES, SourcingCategory } from "@/lib/sourcingData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryParam = searchParams.get("category");
    const minMargin = searchParams.get("minMargin");
    const minContractLikelihood = searchParams.get("minContractLikelihood");
    const platform = searchParams.get("platform");
    const maxWholesaleCost = searchParams.get("maxWholesaleCost");
    const query = searchParams.get("q") ?? undefined;
    const sort = (searchParams.get("sort") as "composite" | "margin" | "profit" | "contract") || "composite";

    const criteria: ScoutFilterCriteria = {
      category: categoryParam && categoryParam !== "All" && categoryParam !== "all"
        ? (categoryParam as SourcingCategory)
        : undefined,
      minMargin: minMargin ? parseFloat(minMargin) : undefined,
      minContractLikelihood: minContractLikelihood ? parseInt(minContractLikelihood, 10) : undefined,
      supplierPlatform: platform && platform !== "all" && platform !== "All" ? platform : undefined,
      maxWholesaleCost: maxWholesaleCost ? parseFloat(maxWholesaleCost) : undefined,
      searchQuery: query,
    };

    let results = runAutonomousScout(criteria);

    if (sort === "margin") {
      results = [...results].sort((a, b) => b.product.suggestedMargin - a.product.suggestedMargin);
    } else if (sort === "profit") {
      results = [...results].sort(
        (a, b) => b.metrics.estimatedDailyProfit20Units - a.metrics.estimatedDailyProfit20Units
      );
    } else if (sort === "contract") {
      results = [...results].sort((a, b) => b.product.contractLikelihood - a.product.contractLikelihood);
    }

    const totalPotentialDailyProfit = results.reduce(
      (acc, r) => acc + r.metrics.estimatedDailyProfit20Units,
      0
    );
    const avgMargin = results.length
      ? Math.round(
          (results.reduce((acc, r) => acc + r.product.suggestedMargin, 0) / results.length) * 100
        )
      : 0;
    const alibabaSuppliersCount = results.filter((r) => r.product.supplierPlatform === "Alibaba").length;

    return NextResponse.json({
      success: true,
      totalMatches: results.length,
      totalCatalogCandidates: SOURCED_CANDIDATES.length,
      metrics: {
        totalPotentialDailyProfit: Math.round(totalPotentialDailyProfit),
        averageMarginPercent: avgMargin,
        alibabaDirectPartners: alibabaSuppliersCount,
        marketGrowthRate: "18.9% CAGR (2026-2033)",
        totalGlobalAddressableMarket: "$167B -> $562B",
      },
      nicheStats: MARKET_NICHES,
      results,
    });
  } catch (error) {
    console.error("[api/sourcing/scout]", error);
    return NextResponse.json(
      { error: "Failed to run autonomous opportunity scout" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const criteria: ScoutFilterCriteria = {
      category: body.category && body.category !== "all" && body.category !== "All" ? body.category : undefined,
      minMargin: body.minMargin ? parseFloat(body.minMargin) : undefined,
      minContractLikelihood: body.minContractLikelihood ? parseInt(body.minContractLikelihood, 10) : undefined,
      supplierPlatform: body.platform && body.platform !== "all" && body.platform !== "All" ? body.platform : undefined,
      maxWholesaleCost: body.maxWholesaleCost ? parseFloat(body.maxWholesaleCost) : undefined,
      searchQuery: body.query || undefined,
    };

    const results = runAutonomousScout(criteria);

    return NextResponse.json({
      success: true,
      totalMatches: results.length,
      results,
    });
  } catch (error) {
    console.error("[api/sourcing/scout POST]", error);
    return NextResponse.json(
      { error: "Failed to process autonomous scout request" },
      { status: 500 }
    );
  }
}
