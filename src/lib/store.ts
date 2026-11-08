import { db, ensureDbReady } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { catalog as seedCatalog } from "@/db/init";
import { gte, desc, eq, sql } from "drizzle-orm";

export type CatalogEntry = {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  supplier: string;
  supplierCountry: string;
  shippingMin: number;
  shippingMax: number;
  margin: number;
  stock: number;
  badge: string | null;
};

export async function getCatalog(): Promise<CatalogEntry[]> {
  try {
    await ensureDbReady();
    const rows = await db.select().from(products);
    if (rows && rows.length > 0) {
      return rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        category: p.category,
        rating: p.rating,
        reviewCount: p.reviewCount,
        supplier: p.supplier,
        supplierCountry: p.supplierCountry,
        shippingMin: p.shippingMin,
        shippingMax: p.shippingMax,
        margin: p.margin,
        stock: p.stock,
        badge: p.badge,
      }));
    }
  } catch (err) {
    console.warn("[store] Database error in getCatalog, using fallback catalog:", err);
  }

  return seedCatalog.map((p, idx) => ({
    id: idx + 1,
    slug: p.slug,
    name: p.name,
    price: p.price,
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    supplier: p.supplier,
    supplierCountry: p.supplierCountry,
    shippingMin: p.shippingMin,
    shippingMax: p.shippingMax,
    margin: p.margin,
    stock: p.stock,
    badge: p.badge,
  }));
}

export function catalogPromptBlock(catalog: CatalogEntry[]): string {
  return catalog
    .map(
      (p) =>
        `- ${p.name} | $${p.price.toFixed(2)} | ${p.category} | ★${p.rating} (${p.reviewCount}) | ship ${p.shippingMin}–${p.shippingMax}d from ${p.supplierCountry} | margin ${Math.round(p.margin * 100)}% | stock ${p.stock}${p.badge ? ` | ${p.badge}` : ""} | link /product/${p.slug}`
    )
    .join("\n");
}

export async function lookupOrdersInText(text: string): Promise<string | null> {
  const numberMatch = text.match(/VND-\d{2,6}/i);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/i);

  let rows: (typeof orders.$inferSelect)[] = [];
  if (numberMatch) {
    const num = numberMatch[0].toUpperCase();
    rows = await db.select().from(orders).where(eq(orders.orderNumber, num));
  } else if (emailMatch) {
    rows = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, emailMatch[0].toLowerCase()))
      .orderBy(desc(orders.createdAt))
      .limit(3);
  }
  if (rows.length === 0) return null;

  const chunks: string[] = [];
  for (const o of rows) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, o.id));
    const itemStr = items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
    chunks.push(
      `Order ${o.orderNumber}: status=${o.status.toUpperCase()} (${statusExplain(o.status)}), items: ${itemStr}, total $${o.total.toFixed(2)}, supplier: ${o.supplier}, placed ${o.createdAt.toISOString().slice(0, 10)}${o.deliverySpeed === "express" ? ", express delivery" : ""}`
    );
  }
  return chunks.join("\n");
}

export function statusExplain(status: string): string {
  switch (status) {
    case "paid":
      return "payment captured, AI is routing it to the supplier";
    case "forwarded":
      return "order forwarded — supplier is packing it";
    case "shipped":
      return "in transit to your address";
    case "delivered":
      return "delivered — enjoy!";
    default:
      return status;
  }
}

/* ============ Store analytics (admin) ============ */
export type StoreStats = {
  revenue30d: number;
  orders30d: number;
  aov: number;
  margin30d: number;
  pendingForward: number;
  daily: { day: string; label: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number; slug: string | null }[];
  suppliers: { name: string; orders: number; revenue: number; rating: number; fastestDays: number }[];
  avgShipDays: number;
  newSubscribers: number;
};

export async function computeStoreStats(): Promise<StoreStats> {
  try {
    await ensureDbReady();
  } catch {}
  const now = Date.now();
  const since21 = new Date(now - 21 * 86400000);
  const since14 = new Date(now - 14 * 86400000);

  let recentOrders: (typeof orders.$inferSelect)[] = [];
  try {
    recentOrders = await db
      .select()
      .from(orders)
      .where(gte(orders.createdAt, since21))
      .orderBy(desc(orders.createdAt));
  } catch {}

  const revenue30d = recentOrders.reduce((s, o) => s + o.total, 0);
  const margin30d = recentOrders.reduce((s, o) => s + o.marginEarned, 0);
  const orders30d = recentOrders.length;
  const aov = orders30d ? revenue30d / orders30d : 0;
  const pendingForward = recentOrders.filter((o) => o.status === "paid").length;

  // daily buckets for last 14 days
  const daily: StoreStats["daily"] = [];
  for (let d = 13; d >= 0; d--) {
    const dayStart = new Date(now - d * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const slice = recentOrders.filter((o) => o.createdAt >= dayStart && o.createdAt < (d === 0 ? new Date(now + 1) : dayEnd));
    daily.push({
      day: dayStart.toISOString().slice(0, 10),
      label: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(slice.reduce((s, o) => s + o.total, 0) * 100) / 100,
      orders: slice.length,
    });
  }

  // top products by quantity
  let itemRows: { productId: number | null; name: string; qty: number; revenue: number }[] = [];
  let productRows: { id: number; slug: string }[] = [];
  try {
    itemRows = await db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        qty: sql<number>`sum(${orderItems.quantity})::int`,
        revenue: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})::float`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId, orderItems.name)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(6);
    productRows = await db.select({ id: products.id, slug: products.slug }).from(products);
  } catch {}

  const slugById = new Map(productRows.map((p) => [p.id, p.slug]));
  const topProducts = itemRows.map((r) => ({
    name: r.name,
    qty: r.qty,
    revenue: Math.round(r.revenue * 100) / 100,
    slug: r.productId ? (slugById.get(r.productId) ?? null) : null,
  }));

  // supplier leaderboard
  let supplierAgg: { name: string; orders: number; revenue: number }[] = [];
  let productRowsFull: { supplier: string; supplierRating: number; shippingMin: number }[] = [];
  try {
    supplierAgg = await db
      .select({
        name: orders.supplier,
        orders: sql<number>`count(*)::int`,
        revenue: sql<number>`sum(${orders.total})::float`,
      })
      .from(orders)
      .where(gte(orders.createdAt, since21))
      .groupBy(orders.supplier)
      .orderBy(sql`sum(${orders.total}) desc`);

    productRowsFull = await db
      .select({ supplier: products.supplier, supplierRating: products.supplierRating, shippingMin: products.shippingMin })
      .from(products);
  } catch {}

  const scoreBySupplier = new Map<string, { rating: number; fastest: number }>();
  for (const p of productRowsFull) {
    const cur = scoreBySupplier.get(p.supplier);
    scoreBySupplier.set(p.supplier, {
      rating: cur ? Math.max(cur.rating, p.supplierRating) : p.supplierRating,
      fastest: cur ? Math.min(cur.fastest, p.shippingMin) : p.shippingMin,
    });
  }
  const suppliers = supplierAgg.map((s) => ({
    name: s.name,
    orders: s.orders,
    revenue: Math.round(s.revenue * 100) / 100,
    rating: scoreBySupplier.get(s.name)?.rating ?? 4.5,
    fastestDays: scoreBySupplier.get(s.name)?.fastest ?? 5,
  }));

  const avgShipDays =
    productRowsFull.length > 0
      ? productRowsFull.reduce((s, p) => s + p.shippingMin, 0) / productRowsFull.length
      : 5;

  let newSubscribers = 0;
  try {
    const { subscribers } = await import("@/db/schema");
    const subCount = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(subscribers)
      .where(gte(subscribers.createdAt, since14));
    newSubscribers = subCount[0]?.n ?? 0;
  } catch {}

  return {
    revenue30d: Math.round(revenue30d * 100) / 100,
    orders30d,
    aov: Math.round(aov * 100) / 100,
    margin30d: Math.round(margin30d * 100) / 100,
    pendingForward,
    daily,
    topProducts,
    suppliers,
    avgShipDays: Math.round(avgShipDays * 10) / 10,
    newSubscribers,
  };
}
