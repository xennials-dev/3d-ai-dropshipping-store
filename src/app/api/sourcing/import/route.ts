import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SOURCED_CANDIDATES, SourcedProductCandidate } from "@/lib/sourcingData";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let candidate: SourcedProductCandidate | undefined = body.candidate;
    if (!candidate && body.candidateId) {
      candidate = SOURCED_CANDIDATES.find((c) => c.id === body.candidateId);
    }

    if (!candidate) {
      return NextResponse.json(
        { error: "Product candidate is required (provide 'candidate' or valid 'candidateId')" },
        { status: 400 }
      );
    }

    // Check if product with this slug already exists
    const existing = await db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(eq(products.slug, candidate.slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: `Product "${candidate.name}" is already in your storefront!`,
        productId: existing[0].id,
        slug: existing[0].slug,
      });
    }

    // Parse shipping days from candidate (e.g. "5-9 days" -> min: 5, max: 9)
    let minDays = 4;
    let maxDays = 8;
    const matchDays = candidate.estimatedShippingDays.match(/(\d+)\s*-\s*(\d+)/);
    if (matchDays) {
      minDays = parseInt(matchDays[1], 10);
      maxDays = parseInt(matchDays[2], 10);
    }

    const margin = Number(
      ((candidate.targetRetailPrice - candidate.wholesaleCost) / candidate.targetRetailPrice).toFixed(2)
    );

    const compareAt = Number((candidate.targetRetailPrice * 1.35).toFixed(2));

    const [inserted] = await db
      .insert(products)
      .values({
        slug: candidate.slug,
        name: candidate.name,
        tagline: candidate.tagline,
        description: `${candidate.description}\n\nKey Highlights:\n- Verified Supplier: ${candidate.supplierName} (${candidate.supplierCountry})\n- Platform Verification: ${candidate.supplierPlatform} ${candidate.tradeAssurance ? "Trade Assurance Guaranteed" : ""}\n- Fast Dispatch: Guaranteed tracking and blind dropshipping packaging\n- Factory Wholesale Direct: 100% verified authentic with quality guarantee.`,
        price: candidate.targetRetailPrice,
        compareAtPrice: compareAt,
        category: candidate.category,
        image: candidate.image,
        supplier: candidate.supplierName,
        supplierCountry: candidate.supplierCountry.includes("China")
          ? "CN"
          : candidate.supplierCountry.includes("USA")
          ? "US"
          : candidate.supplierCountry.includes("Vietnam")
          ? "VN"
          : "CN",
        supplierRating: 4.8,
        shippingMin: minDays,
        shippingMax: maxDays,
        rating: 4.8,
        reviewCount: Math.floor(Math.random() * 80) + 24,
        margin: margin,
        cost: candidate.wholesaleCost,
        stock: 150,
        featured: true,
        badge: candidate.viralScore >= 8 ? "Trending Viral" : "Factory Direct",
      })
      .returning();

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      message: `Successfully imported "${candidate.name}" into live store catalog!`,
      product: inserted,
    });
  } catch (error) {
    console.error("[api/sourcing/import]", error);
    return NextResponse.json(
      { error: "Failed to import candidate to live storefront" },
      { status: 500 }
    );
  }
}
