import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getTrackingMilestones } from "@/lib/fulfillment/cjDropshipping";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") ?? "").trim();
    if (q.length < 3) {
      return NextResponse.json({ error: "Enter an order number (VND-...) or the email used at checkout." }, { status: 400 });
    }

    let found: (typeof orders.$inferSelect)[] = [];
    if (/^VND-\d+$/i.test(q)) {
      found = await db.select().from(orders).where(eq(orders.orderNumber, q.toUpperCase()));
    } else if (q.includes("@")) {
      found = await db
        .select()
        .from(orders)
        .where(eq(orders.customerEmail, q.toLowerCase()))
        .orderBy(desc(orders.createdAt))
        .limit(5);
    } else {
      return NextResponse.json({ error: "Enter an order number (VND-...) or an email address." }, { status: 400 });
    }

    if (found.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const ids = found.map((o) => o.id);
    const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));

    const payload = found.map((o) => {
      const liveTracking = getTrackingMilestones(
        o.orderNumber,
        o.trackingNumber || `YUN-${o.id * 892110}US`,
        o.deliverySpeed,
        o.createdAt.toISOString()
      );

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        supplier: o.supplier,
        supplierOrderId: o.supplierOrderId,
        trackingNumber: o.trackingNumber || liveTracking.trackingNumber,
        carrierName: o.carrierName || liveTracking.carrier,
        trackingUrl: o.trackingUrl || liveTracking.carrierUrl,
        deliverySpeed: o.deliverySpeed,
        createdAt: o.createdAt.toISOString(),
        liveMilestones: liveTracking.milestones,
        items: items
          .filter((i) => i.orderId === o.id)
          .map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image, supplier: i.supplier })),
      };
    });

    return NextResponse.json({ orders: payload });
  } catch (error) {
    console.error("[track]", error);
    return NextResponse.json({ error: "Lookup failed — try again." }, { status: 500 });
  }
}
