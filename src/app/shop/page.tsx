import type { Metadata } from "next";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
import { catalog } from "@/db/init";
import ShopGrid, { type ShopProduct } from "@/components/ShopGrid";

export const metadata: Metadata = {
  title: "Shop the catalog — Vendora",
  description:
    "2,400+ supplier-direct products across electronics, home, beauty, fitness and pets. Live margins, 2–15 day delivery, 30-day returns.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = typeof params.sort === "string" ? params.sort : "featured";
  const tag = typeof params.tag === "string" ? params.tag : undefined;

  let rows: (typeof products.$inferSelect)[] = [];
  try {
    await ensureDbReady();
    rows = await db.select().from(products);
  } catch (err) {
    console.warn("[shop] Error loading products from db, using fallback catalog:", err);
  }

  if (!rows || rows.length === 0) {
    rows = catalog.map((c, i) => ({
      id: i + 1,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      price: c.price,
      compareAtPrice: c.compareAtPrice ?? null,
      category: c.category,
      image: c.image,
      supplier: c.supplier,
      supplierCountry: c.supplierCountry,
      supplierRating: c.supplierRating,
      shippingMin: c.shippingMin,
      shippingMax: c.shippingMax,
      rating: c.rating,
      reviewCount: c.reviewCount,
      margin: c.margin,
      cost: c.cost,
      stock: c.stock,
      featured: c.featured,
      badge: c.badge ?? null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    }));
  }

  const serialized: ShopProduct[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.category,
    image: p.image,
    supplier: p.supplier,
    supplierCountry: p.supplierCountry,
    supplierRating: p.supplierRating,
    shippingMin: p.shippingMin,
    shippingMax: p.shippingMax,
    rating: p.rating,
    reviewCount: p.reviewCount,
    margin: p.margin,
    stock: p.stock,
    featured: p.featured,
    badge: p.badge,
  }));

  const categories = Array.from(new Set(rows.map((p) => p.category))).sort();

  return (
    <div className="min-h-screen bg-[#0b0c0e]">
      {/* promo banner */}
      <div className="border-b border-[#e4b45c]/25 bg-gradient-to-r from-[#e4b45c]/15 via-[#e4b45c]/5 to-transparent px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#f6d68a] sm:text-[11px]">
        Launch week — code <span className="underline underline-offset-2">LAUNCH20</span> saves 20% · free shipping over $75
      </div>
      <ShopGrid products={serialized} categories={categories} initialSort={sort} initialTag={tag} />
    </div>
  );
}
