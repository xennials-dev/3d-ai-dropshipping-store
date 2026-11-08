import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendAbandonedCartRecoveryEmail } from "@/lib/email/resendClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const customerName = String(body?.name ?? "").trim();
    const cartItems = Array.isArray(body?.items) ? body.items : [];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Save email to subscribers list so founder can nurture
    try {
      const exists = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(subscribers).values({ email });
      }
    } catch (e) {
      // ignore duplicate constraint
    }

    // Trigger or schedule recovery sequence
    const result = await sendAbandonedCartRecoveryEmail({
      customerEmail: email,
      customerName: customerName || undefined,
      cartItems,
      discountCode: "LAUNCH20",
    });

    return NextResponse.json({
      success: true,
      message: "Cart recovery sequence initialized.",
      result,
    });
  } catch (error) {
    console.error("[api/cart/abandon]", error);
    return NextResponse.json(
      { error: "Failed to record abandoned checkout." },
      { status: 500 }
    );
  }
}
