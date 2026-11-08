import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { desc, eq, inArray, lt } from "drizzle-orm";
import { computeStoreStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbReady();
    const stats = await computeStoreStats();

    const recent = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(12);

    const ids = recent.map((o) => o.id);
    const items = ids.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
      : [];

    const recentOrders = recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      supplier: o.supplier,
      deliverySpeed: o.deliverySpeed,
      createdAt: o.createdAt.toISOString(),
      items: items
        .filter((i) => i.orderId === o.id)
        .map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
    }));

    const lowStock = await db
      .select({ id: products.id, name: products.name, stock: products.stock, slug: products.slug })
      .from(products)
      .where(lt(products.stock, 300))
      .orderBy(products.stock)
      .limit(4);

    const supplierBreakdown = new Map<string, number>();
    for (const o of recent) {
      supplierBreakdown.set(o.supplier, (supplierBreakdown.get(o.supplier) ?? 0) + 1);
    }

    return NextResponse.json({
      stats,
      recentOrders,
      lowStock,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[admin/data]", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
