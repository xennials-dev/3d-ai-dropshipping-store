import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  Quote,
  ThumbsUp,
} from "lucide-react";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
import { catalog } from "@/db/init";
import { eq } from "drizzle-orm";
import ProductGallery from "@/components/ProductGallery";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ProductPurchase, { QuickAdd, type PurchaseProduct } from "@/components/ProductPurchase";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let p: typeof products.$inferSelect | undefined;
  try {
    await ensureDbReady();
    const [row] = await db.select().from(products).where(eq(products.slug, slug));
    p = row;
  } catch {}
  if (!p) {
    const fallback = catalog.find((item) => item.slug === slug);
    if (fallback) {
      p = {
        id: 1,
        slug: fallback.slug,
        name: fallback.name,
        tagline: fallback.tagline,
        description: fallback.description,
        price: fallback.price,
        compareAtPrice: fallback.compareAtPrice ?? null,
        category: fallback.category,
        image: fallback.image,
        supplier: fallback.supplier,
        supplierCountry: fallback.supplierCountry,
        supplierRating: fallback.supplierRating,
        shippingMin: fallback.shippingMin,
        shippingMax: fallback.shippingMax,
        rating: fallback.rating,
        reviewCount: fallback.reviewCount,
        margin: fallback.margin,
        cost: fallback.cost,
        stock: fallback.stock,
        featured: fallback.featured,
        badge: fallback.badge ?? null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };
    }
  }
  if (!p) return { title: "Product not found — Vendora" };
  return { title: `${p.name} — Vendora`, description: p.tagline };
}

/* deterministic pseudo-reviews seeded from the slug */
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const REVIEWERS = [
  { name: "Maya R.", loc: "Austin, TX" },
  { name: "Devon K.", loc: "Chicago, IL" },
  { name: "Priya S.", loc: "Seattle, WA" },
  { name: "Tomás H.", loc: "Miami, FL" },
];
const REVIEW_TEXTS = [
  "Arrived in 6 days, packed like a boutique brand. Quality punches way above the price — already ordered a second one as a gift.",
  "Supplier shipped same-day and the tracking actually updated. Product matches the photos exactly. My go-to store now.",
  "For the price, this is unbeatable. Docked one star only because delivery took 9 days — set the ETA expectation and it's perfect.",
  "My third order this month. The AI assistant recommended it and it was spot on. Customer support resolved my address change in 3 minutes.",
];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: typeof products.$inferSelect | undefined;
  try {
    await ensureDbReady();
    const [row] = await db.select().from(products).where(eq(products.slug, slug));
    product = row;
  } catch (err) {
    console.warn("[product] Error fetching product from db, using static catalog:", err);
  }

  if (!product) {
    const fallback = catalog.find((item) => item.slug === slug);
    if (fallback) {
      product = {
        id: 1,
        slug: fallback.slug,
        name: fallback.name,
        tagline: fallback.tagline,
        description: fallback.description,
        price: fallback.price,
        compareAtPrice: fallback.compareAtPrice ?? null,
        category: fallback.category,
        image: fallback.image,
        supplier: fallback.supplier,
        supplierCountry: fallback.supplierCountry,
        supplierRating: fallback.supplierRating,
        shippingMin: fallback.shippingMin,
        shippingMax: fallback.shippingMax,
        rating: fallback.rating,
        reviewCount: fallback.reviewCount,
        margin: fallback.margin,
        cost: fallback.cost,
        stock: fallback.stock,
        featured: fallback.featured,
        badge: fallback.badge ?? null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };
    }
  }

  if (!product) notFound();

  let crossSell: (typeof products.$inferSelect)[] = [];
  try {
    crossSell = await db
      .select()
      .from(products)
      .where(eq(products.category, product.category))
      .limit(4);
  } catch {}

  if (crossSell.length === 0) {
    crossSell = catalog
      .filter((c) => c.category === product.category)
      .slice(0, 4)
      .map((c, i) => ({
        id: i + 10,
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
  const cross = crossSell.filter((p) => p.slug !== product.slug).slice(0, 3);

  const purchaseProduct: PurchaseProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    image: product.image,
    supplier: product.supplier,
    supplierCountry: product.supplierCountry,
    supplierRating: product.supplierRating,
    shippingMin: product.shippingMin,
    shippingMax: product.shippingMax,
    rating: product.rating,
    reviewCount: product.reviewCount,
    margin: product.margin,
    stock: product.stock,
  };

  const h = hashSlug(slug);
  const fiveStar = Math.min(94, Math.max(64, Math.round((product.rating - 4) * 60 + 66)));
  const bars = [
    { star: 5, pct: fiveStar },
    { star: 4, pct: Math.max(2, Math.round((100 - fiveStar) * 0.62)) },
    { star: 3, pct: Math.max(1, Math.round((100 - fiveStar) * 0.2)) },
    { star: 2, pct: Math.max(1, Math.round((100 - fiveStar) * 0.1)) },
    { star: 1, pct: Math.max(1, 100 - fiveStar - Math.max(2, Math.round((100 - fiveStar) * 0.62)) - Math.max(1, Math.round((100 - fiveStar) * 0.2)) - Math.max(1, Math.round((100 - fiveStar) * 0.1))) },
  ];
  const baseTime = product.createdAt ? new Date(product.createdAt).getTime() : 1772000000000;
  const reviews = [0, 1, 2].map((i) => ({
    ...REVIEWERS[(h + i * 3) % REVIEWERS.length],
    text: REVIEW_TEXTS[(h + i) % REVIEW_TEXTS.length],
    rating: Math.min(5, Math.max(4, Math.round(product.rating) - (i === 2 ? 1 : 0))),
    date: new Date(baseTime - (7 + ((h >> (i * 4)) % 40)) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    helpful: 12 + ((h >> (i * 3)) % 240),
  }));

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f4efe6]">
      {/* breadcrumb */}
      <div className="border-b border-white/5 bg-[#08090b]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75726a] sm:px-6">
          <Link href="/" className="hover:text-[#f6d68a]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-[#f6d68a]">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop`} className="hover:text-[#f6d68a]">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-[#f6d68a]">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            name={product.name}
            image={product.image}
            category={product.category}
            supplier={product.supplier}
          />
          <ProductPurchase product={purchaseProduct} />
        </div>

        {/* detail strip */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, title: product.shippingMax <= 7 ? "Fast-Ship lane" : "Global lane", body: `${product.shippingMin}–${product.shippingMax} business days door-to-door via ${product.supplier}` },
            { icon: PackageCheck, title: "Seller of record", body: "Vendora appears on your packing slip & invoice. Suppliers stay invisible." },
            { icon: ShieldCheck, title: "Zero-risk returns", body: "30 days, no questions. We refund or reship first, then reconcile with the supplier." },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#121318] p-4">
              <s.icon size={20} className="mt-0.5 shrink-0 text-[#e4b45c]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f4efe6]">{s.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-[#9a978c]">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* description + reviews */}
        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-black tracking-tight">The details</h2>
            <p className="mt-3 leading-relaxed text-[#b8b5a9]">{product.description}</p>
            <dl className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              {[
                ["Category", product.category],
                ["Origin", product.supplierCountry],
                ["Fulfilled by", product.supplier],
                ["Network stock", `${product.stock.toLocaleString()} units`],
                ["Returns window", "30 days · prepaid label"],
              ].map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-2 gap-4 px-4 py-3 text-[12px] ${i % 2 ? "bg-white/[0.02]" : "bg-[#121318]"}`}>
                  <dt className="font-semibold uppercase tracking-wider text-[#75726a]">{k}</dt>
                  <dd className="text-[#e8e4d8]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="reviews" className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-black tracking-tight">What buyers say</h2>
              <span className="flex items-center gap-1.5 rounded-full border border-[#e4b45c]/30 bg-[#e4b45c]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#f6d68a]">
                <Sparkles size={11} /> Summarized by Vendora AI
              </span>
            </div>

            {/* AI summary */}
            <div className="mt-4 rounded-2xl border border-[#e4b45c]/25 bg-gradient-to-br from-[#e4b45c]/10 to-transparent p-5">
              <Quote size={17} className="text-[#e4b45c]" fill="#e4b45c" strokeWidth={0} />
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#e8e4d8]">
                Buyers rave about <b className="text-[#f6d68a]">value and build quality</b> — the two most-cited phrases are “punches above its price” and “packed like a boutique brand.” The only recurring gripe is cross-border wait times on China lanes; ordering before Friday ships Monday.
              </p>
            </div>

            <div className="mt-5 grid gap-6 sm:grid-cols-5">
              {/* histogram */}
              <div className="sm:col-span-2">
                <div className="flex items-end gap-4">
                  <p className="font-display text-6xl font-black leading-none tabular-nums">{product.rating}</p>
                  <div className="pb-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill={i < Math.round(product.rating) ? "#e4b45c" : "transparent"} className="text-[#e4b45c]" />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-[#9a978c]">{product.reviewCount.toLocaleString()} verified reviews</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {bars.map((b) => (
                    <div key={b.star} className="flex items-center gap-2 text-[11px] font-bold text-[#9a978c]">
                      <span className="w-2">{b.star}</span>
                      <Star size={10} fill="#e4b45c" className="text-[#e4b45c]" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#f6d68a] to-[#9a6b25]" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-8 text-right tabular-nums">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* review list */}
              <ul className="space-y-3 sm:col-span-3">
                {reviews.map((r, i) => (
                  <li key={i} className="rounded-2xl border border-white/10 bg-[#121318] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2b33] to-[#17181d] text-[9px] font-black text-[#f6d68a]">
                          {r.name.split(" ").map((w) => w[0]).join("")}
                        </span>
                        <div>
                          <p className="text-[11.5px] font-bold">{r.name} <span className="font-normal text-[#75726a]">· {r.loc}</span></p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} size={9} fill={j < r.rating ? "#e4b45c" : "transparent"} className="text-[#e4b45c]" />
                              ))}
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-[#5a5850]">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className="rounded-md bg-[#7ee2a8]/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#7ee2a8]">Verified</span>
                    </div>
                    <p className="mt-2 text-[12px] leading-snug text-[#c9c5b8]">{r.text}</p>
                    <button className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#75726a] transition hover:text-[#f6d68a]">
                      <ThumbsUp size={11} /> {r.helpful} found this helpful
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Before & After Transformation Slider */}
        <BeforeAfterSlider
          title="Factory Direct Transformation"
          subtitle={`Compare typical retail markups against ${product.name} crafted direct from ${product.supplier}.`}
          beforeImage={cross.length > 0 ? cross[0].image : product.image}
          afterImage={product.image}
          beforeLabel="Traditional Retail Alternative"
          afterLabel={`${product.name} (Direct)`}
        />

        {/* cross-sell */}
        {cross.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-black tracking-tight">Bought <span className="gold-text">together</span></h2>
              <Link href="/shop" className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e4b45c] hover:text-[#f6d68a]">View all →</Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {cross.map((p) => (
                <div key={p.id} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#121318] p-3 transition hover:border-[#e4b45c]/35">
                  <Link href={`/product/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1a1b21]">
                    <Image src={p.image} alt={p.name} fill unoptimized sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.slug}`} className="block truncate text-[12px] font-bold text-[#f4efe6] hover:text-[#f6d68a]">{p.name}</Link>
                    <p className="mt-0.5 font-display text-base font-black tabular-nums">${p.price.toFixed(2)}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#75726a]">Ships {p.shippingMin}–{p.shippingMax}d</p>
                  </div>
                  <QuickAdd product={{ id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, price: p.price, compareAtPrice: p.compareAtPrice, category: p.category, image: p.image, supplier: p.supplier, supplierCountry: p.supplierCountry, supplierRating: p.supplierRating, shippingMin: p.shippingMin, shippingMax: p.shippingMax, rating: p.rating, reviewCount: p.reviewCount, margin: p.margin, stock: p.stock }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* reassurance footer */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/5 pt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-[#75726a]">
          <span className="flex items-center gap-2"><Truck size={14} className="text-[#e4b45c]" /> Free shipping over $75</span>
          <span className="flex items-center gap-2"><RotateCcw size={14} className="text-[#e4b45c]" /> 30-day returns</span>
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#e4b45c]" /> Buyer protection on every order</span>
        </div>
      </div>
    </div>
  );
}
