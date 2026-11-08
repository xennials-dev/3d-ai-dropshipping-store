"use client";

import { useState } from "react";
import {
  Star,
  BadgeCheck,
  Truck,
  Zap,
  ShieldCheck,
  RotateCcw,
  Lock,
  Sparkles,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Heart,
  MapPin,
} from "lucide-react";
import { useCart } from "@/lib/cart";

export type PurchaseProduct = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
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
};

export function QuickAdd({ product }: { product: PurchaseProduct }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, supplier: product.supplier });
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`Add ${product.name} to cart`}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${done ? "bg-[#7ee2a8] text-[#0b0c0e]" : "bg-[#e4b45c] text-[#0b0c0e] hover:bg-[#f6d68a]"}`}
    >
      {done ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
    </button>
  );
}

export default function ProductPurchase({ product }: { product: PurchaseProduct }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const fast = product.shippingMax <= 7;
  const savings = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const addToCart = () => {
    add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        supplier: product.supplier,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const askAi = () =>
    window.dispatchEvent(
      new CustomEvent("vendora:ask-ai", {
        detail: `Tell me about the ${product.name} — is it worth buying?`,
      })
    );

  const pctClaimed = Math.min(92, Math.max(34, 100 - Math.round(product.stock / 22)));
  const marginPct = Math.round(product.margin * 100);

  return (
    <div className="flex flex-col">
      {/* supplier strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-[#7ee2a8]/35 bg-[#7ee2a8]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#7ee2a8]">
          <BadgeCheck size={12} /> Vetted supplier · {product.supplierCountry}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9c5b8]">
          <Star size={11} fill="#e4b45c" className="text-[#e4b45c]" /> {product.supplierRating.toFixed(1)} supplier score
        </span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-black leading-[1.02] tracking-tight text-[#f4efe6] sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-2 text-base text-[#9a978c]">{product.tagline}</p>

      {/* rating */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#c9c5b8]">
        <span className="flex items-center gap-1 font-bold text-[#f6d68a]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} fill={i < Math.round(product.rating) ? "#e4b45c" : "transparent"} className="text-[#e4b45c]" />
          ))}
          <span className="ml-1">{product.rating}</span>
        </span>
        <span className="text-[#5a5850]">•</span>
        <a href="#reviews" className="underline-offset-2 transition hover:text-[#f6d68a] hover:underline">
          {product.reviewCount.toLocaleString()} verified reviews
        </a>
      </div>

      {/* price */}
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <p className="font-display text-5xl font-black tracking-tight tabular-nums text-[#f4efe6]">
          ${product.price.toFixed(2)}
        </p>
        {product.compareAtPrice && (
          <div className="mb-1">
            <p className="text-lg font-semibold tabular-nums text-[#5a5850] line-through">
              ${product.compareAtPrice.toFixed(2)}
            </p>
            <span className="inline-block rounded-md bg-[#f0715c]/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#ff9d8a]">
              Save {savings}%
            </span>
          </div>
        )}
        <span className="mb-1.5 rounded-md border border-[#e4b45c]/30 bg-[#e4b45c]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#f6d68a]">
          +{marginPct}% margin
        </span>
      </div>

      {/* delivery strip */}
      <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-[#121318] p-4 text-[12px] text-[#c9c5b8]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#e4b45c]" /> Ships from {product.supplierCountry}</span>
          <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#e4b45c]" /> ETA {product.shippingMin}–{product.shippingMax} business days</span>
          {fast && <span className="flex items-center gap-1.5 font-bold text-[#7ee2a8]"><Zap size={14} /> Fast-Ship eligible</span>}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          <span className="flex items-center gap-1.5 text-[#9a978c]"><ShieldCheck size={14} className="text-[#7ee2a8]" /> Buyer protection included</span>
          <span className="text-[#75726a]">{product.supplier}</span>
        </div>
      </div>

      {/* stock urgency */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="text-[#f0a08f]">Selling fast — {pctClaimed}% claimed</span>
          <span className="text-[#75726a]">{product.stock.toLocaleString()} units network-wide</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e4b45c] to-[#f0715c]" style={{ width: `${pctClaimed}%` }} />
        </div>
      </div>

      {/* qty + CTA */}
      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex items-center rounded-2xl border border-white/10 bg-[#121318]">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-4 text-[#c9c5b8] transition hover:text-white" aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-display text-lg font-black tabular-nums">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-4 text-[#c9c5b8] transition hover:text-white" aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
        <button
          onClick={addToCart}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-[0.18em] transition-all ${added ? "bg-[#7ee2a8] text-[#0b0c0e]" : "bg-[#e4b45c] text-[#0b0c0e] hover:bg-[#f6d68a] hover:shadow-[0_18px_44px_-12px_rgba(228,180,92,0.5)]"}`}
        >
          {added ? (<><Check size={19} strokeWidth={3} /> Added to cart</>) : (<><ShoppingBag size={19} strokeWidth={2.3} /> Add to cart</>)}
        </button>
        <button
          onClick={() => setWished((v) => !v)}
          aria-pressed={wished}
          aria-label="Add to wishlist"
          className="rounded-2xl border border-white/10 bg-[#121318] p-4 text-[#c9c5b8] transition hover:border-[#f0715c]/40 hover:text-[#f0715c]"
        >
          <Heart size={20} fill={wished ? "#f0715c" : "transparent"} className={wished ? "text-[#f0715c]" : ""} />
        </button>
      </div>

      {/* trust row */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#75726a]">
        <span className="flex items-center gap-1.5"><RotateCcw size={12} /> 30-day returns</span>
        <span className="flex items-center gap-1.5"><Lock size={12} /> Secure checkout</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Seller-of-record protection</span>
      </div>

      {/* AI take */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#e4b45c]/30 bg-gradient-to-br from-[#e4b45c]/12 via-[#121318] to-[#121318]">
        <div className="flex items-center justify-between border-b border-[#e4b45c]/15 px-5 py-2.5">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#f6d68a]">
            <Sparkles size={13} /> Vendora AI take
          </span>
          <button onClick={askAi} className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a978c] underline-offset-2 transition hover:text-[#f6d68a] hover:underline">
            Ask it more →
          </button>
        </div>
        <ul className="space-y-2 px-5 py-4 text-[12px] leading-snug text-[#d8d5cb]">
          <li className="flex gap-2">
            <span className="text-[#e4b45c]">▸</span>
            <span><b className="text-[#f4efe6]">Demand:</b> {product.category} is trending +18–38% WoW; “{product.name.split(" ")[0]}” is a breakout search on TikTok Shop this month.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#e4b45c]">▸</span>
            <span><b className="text-[#f4efe6]">Economics:</b> you keep <b className="text-[#f6d68a]">~{marginPct}%</b> per unit — {marginPct >= 30 ? "comfortably above" : "in line with"} the 25% cross-border benchmark.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#e4b45c]">▸</span>
            <span><b className="text-[#f4efe6]">Risk:</b> {product.reviewCount > 1000 ? `${product.reviewCount.toLocaleString()} reviews with a ${product.rating}★ average — proven, low return risk.` : "Newer listing — order the $50–$100 sample before you commit ad budget."}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
