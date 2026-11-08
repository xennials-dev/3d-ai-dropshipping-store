import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[lemonsqueezy-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Lemon Squeezy webhook secret is missing. Set LEMONSQUEEZY_WEBHOOK_SECRET in environment." },
      { status: 400 }
    );
  }

  const signature = request.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing x-signature header" }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error("[lemonsqueezy-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid Lemon Squeezy signature" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[lemonsqueezy-webhook] Verification error:", err.message);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const orderNumber = customData?.order_number;

    console.log(`[lemonsqueezy-webhook] Received event: ${eventName} for order: ${orderNumber}`);

    if (orderNumber) {
      if (eventName === "order_created" || eventName === "subscription_created") {
        await db
          .update(orders)
          .set({
            status: "paid",
            paymentStatus: "paid",
            paymentMethod: "lemonsqueezy",
          })
          .where(eq(orders.orderNumber, orderNumber));
      } else if (eventName === "order_refunded") {
        await db
          .update(orders)
          .set({
            paymentStatus: "refunded",
          })
          .where(eq(orders.orderNumber, orderNumber));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[lemonsqueezy-webhook] Error processing payload:", error);
    return NextResponse.json({ error: "Failed to process Lemon Squeezy webhook" }, { status: 500 });
  }
}
