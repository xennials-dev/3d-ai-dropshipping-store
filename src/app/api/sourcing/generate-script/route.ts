import { NextRequest, NextResponse } from "next/server";
import {
  generateVendorBiddingScript,
  ScriptNegotiationObjective,
  ScriptGeneratorParams,
} from "@/lib/opportunityEngine";
import { SOURCED_CANDIDATES } from "@/lib/sourcingData";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let candidate = body.candidate;
    if (!candidate && body.candidateId) {
      candidate = SOURCED_CANDIDATES.find((c) => c.id === body.candidateId);
    }

    if (!candidate) {
      return NextResponse.json(
        { error: "Product candidate is required (provide 'candidate' or valid 'candidateId')" },
        { status: 400 }
      );
    }

    const params: ScriptGeneratorParams = {
      product: candidate,
      storeBrandName: body.storeBrandName?.trim() || "NovaDrop Direct",
      proposedTargetPrice:
        typeof body.proposedTargetPrice === "number"
          ? body.proposedTargetPrice
          : candidate.wholesaleCost,
      projectedMonthlyVolume:
        typeof body.projectedMonthlyVolume === "number"
          ? body.projectedMonthlyVolume
          : 600,
      objective: (body.objective as ScriptNegotiationObjective) || "moq_waiver_dropship",
      includeChineseTranslation: body.includeChineseTranslation !== false,
    };

    const scriptResult = generateVendorBiddingScript(params);

    return NextResponse.json({
      success: true,
      data: scriptResult,
    });
  } catch (error) {
    console.error("[api/sourcing/generate-script]", error);
    return NextResponse.json(
      { error: "Failed to generate vendor negotiation script" },
      { status: 500 }
    );
  }
}
