import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

const FLOW = ["paid", "forwarded", "shipped", "delivered"] as const;
type FlowStatus = (typeof FLOW)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // "Forward all pending" — advance every paid order to forwarded
    if (body?.all === true) {
      const updated = await db
        .update(orders)
        .set({ status: "forwarded" })
        .where(eq(orders.status, "paid"))
        .returning({ id: orders.id });
      return NextResponse.json({ ok: true, updated: updated.length, status: "forwarded" });
    }

    const orderId = Number(body?.orderId);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const idx = FLOW.indexOf(order.status as FlowStatus);
    if (idx === -1 || idx >= FLOW.length - 1) {
      return NextResponse.json({ ok: true, updated: 0, status: order.status, note: "Already at final stage" });
    }
    const next = FLOW[idx + 1];
    await db.update(orders).set({ status: next }).where(inArray(orders.id, [orderId]));
    return NextResponse.json({ ok: true, updated: 1, status: next });
  } catch (error) {
    console.error("[admin/advance]", error);
    return NextResponse.json({ error: "Failed to advance order" }, { status: 500 });
  }
}
