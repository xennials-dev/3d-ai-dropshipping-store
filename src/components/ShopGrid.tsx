"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Star,
  Zap,
  ShoppingBag,
  Check,
  Truck,
  Flame,
  ArrowDownWideNarrow,
  Play,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import HoverVideoCard from "./HoverVideoCard";

export type ShopProduct = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  image: string;
  supplier: string;
  supplierCountry: string;
  supplierRating: number;
  shippingMin: number;
  shippingMax: number;
  rating: number;
  reviewCount: number;
  margin: number;
  stock: number;
  featured: boolean;
  badge: string | null;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "margin" | "new";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price · low → high",
  "price-desc": "Price · high → low",
  rating: "Top rated",
  margin: "Highest margin",
  new: "Newest",
};

export default function ShopGrid({
  products,
  categories,
  initialSort = "featured",
  initialTag,
}: {
  products: ShopProduct[];
  categories: string[];
  initialSort?: string;
  initialTag?: string;
}) {
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>(
    (["featured", "price-asc", "price-desc", "rating", "margin", "new"].includes(initialSort)
      ? initialSort
      : "featured") as SortKey
  );
  const [fastOnly, setFastOnly] = useState(initialTag === "fast");
  const [addedId, setAddedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (fastOnly && p.shippingMax > 7) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${p.name} ${p.tagline} ${p.category} ${p.supplier} ${p.supplierCountry} ${p.description}`.toLowerCase();
        if (!q.split(/\s+/).every((token) => hay.includes(token))) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "margin":
        list = [...list].sort((a, b) => b.margin - a.margin);
        break;
      case "new":
        list = [...list].sort((a, b) => b.id - a.id);
        break;
      default:
        list = [...list].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount
        );
    }
    return list;
  }, [products, category, query, sort, fastOnly]);

  const quickAdd = (p: ShopProduct) => {
    add(
      { id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, supplier: p.supplier },
      1
    );
    setAddedId(p.id);
    window.setTimeout(() => setAddedId((v) => (v === p.id ? null : v)), 1600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* header row */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">
            <Flame size={13} /> Live catalog · stock-synced hourly
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-[#f4efe6] sm:text-5xl">
            The 2026 <span className="gold-text">hotlist</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-[#9a978c]">
            Every SKU ships supplier-direct under your invoice. Margins and ETAs are live — no guesses.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#121318] px-4 py-3 text-[11px] text-[#c9c5b8]">
          <Truck size={15} className="text-[#e4b45c]" />
          <span><b className="text-[#f6d68a]">Fast-Ship</b> filter = domestic stock only</span>
        </div>
      </div>

      {/* controls */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#121318] px-4 transition focus-within:border-[#e4b45c]/50">
          <Search size={18} className="shrink-0 text-[#75726a]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, suppliers, materials…"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-[#5a5850]"
            aria-label="Search products"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFastOnly((v) => !v)}
            aria-pressed={fastOnly}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-wider transition ${
              fastOnly
                ? "border-[#7ee2a8]/50 bg-[#7ee2a8]/15 text-[#7ee2a8]"
                : "border-white/10 bg-[#121318] text-[#c9c5b8] hover:border-white/20"
            }`}
          >
            <Zap size={13} strokeWidth={2.5} /> Fast-Ship
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#121318] px-3 py-3">
            <ArrowDownWideNarrow size={15} className="text-[#9a978c]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent text-[12px] font-bold text-[#f4efe6] outline-none [&>option]:bg-[#121318]"
              aria-label="Sort products"
            >
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* category pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={15} className="text-[#75726a]" />
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
              category === c
                ? "bg-[#e4b45c] text-[#0b0c0e]"
                : "border border-white/10 bg-[#121318] text-[#c9c5b8] hover:border-[#e4b45c]/40 hover:text-[#f6d68a]"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#75726a]">
          {filtered.length} of {products.length} products
        </span>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Search size={30} className="text-[#3d3e46]" />
          <p className="font-display text-2xl font-bold text-[#f4efe6]">Nothing matches “{query}”</p>
          <p className="max-w-xs text-sm text-[#9a978c]">Try a broader term — or ask Vendora AI in the bottom-right corner.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const fast = p.shippingMax <= 7;
            const savings = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
            return (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121318] transition-all duration-300 hover:-translate-y-1 hover:border-[#e4b45c]/35 hover:shadow-[0_30px_60px_-30px_rgba(228,180,92,0.28)]"
              >
                <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-[#1a1b21]">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                    className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent" />
                  {p.badge && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#e4b45c] px-2.5 py-1 text-[8.5px] font-black uppercase tracking-[0.18em] text-[#0b0c0e]">
                      {p.badge}
                    </span>
                  )}
                  {fast && (
                    <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-[#7ee2a8]/40 bg-black/65 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#7ee2a8] backdrop-blur">
                      <Zap size={9} strokeWidth={3} /> {p.shippingMin}–{p.shippingMax}d
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-3.5">
                  <Link href={`/product/${p.slug}`} className="min-h-[2.6rem] text-[13px] font-bold leading-snug text-[#f4efe6] transition hover:text-[#f6d68a]">
                    {p.name}
                  </Link>
                  <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[#75726a]">
                    {p.supplierCountry} · {Math.round(p.margin * 100)}% margin
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#c9c5b8]">
                    <Star size={11} fill="#e4b45c" className="text-[#e4b45c]" />
                    {p.rating} <span className="text-[#5a5850]">({p.reviewCount.toLocaleString()})</span>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div>
                      <p className="font-display text-xl font-black leading-none tabular-nums text-[#f4efe6]">
                        ${p.price.toFixed(2)}
                      </p>
                      {p.compareAtPrice && (
                        <p className="mt-1 text-[10px] font-semibold text-[#75726a]">
                          <span className="line-through">${p.compareAtPrice.toFixed(2)}</span>{" "}
                          <span className="text-[#7ee2a8]">−{savings}%</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => quickAdd(p)}
                      aria-label={`Add ${p.name} to cart`}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        addedId === p.id
                          ? "bg-[#7ee2a8] text-[#0b0c0e]"
                          : "bg-[#e4b45c] text-[#0b0c0e] hover:bg-[#f6d68a]"
                      }`}
                    >
                      {addedId === p.id ? <Check size={18} strokeWidth={3} /> : <ShoppingBag size={17} strokeWidth={2.2} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
