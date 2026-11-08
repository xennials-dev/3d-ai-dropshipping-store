"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Package,
  Truck,
  Home,
  ArrowRight,
  PackageSearch,
  PartyPopper,
  Zap,
  Clock,
  ShieldCheck,
  Plus,
  Loader2,
  Gift,
} from "lucide-react";
import { UPSELL_CATALOG, UpsellRecommendation } from "@/lib/upsellData";

function SuccessInner() {
  const params = useSearchParams();
  const orderNumber = params.get("n") ?? "VND-000000";
  const initialTotal = params.get("total") ?? "";
  const eta = params.get("eta") ?? "3–7 business days";
  const sessionId = params.get("session_id");

  // 1-Click Upsell State
  const [upsellItem] = useState<UpsellRecommendation>(UPSELL_CATALOG[0]);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes urgency
  const [upsellStatus, setUpsellStatus] = useState<"idle" | "adding" | "claimed">("idle");
  const [currentTotal, setCurrentTotal] = useState<string>(initialTotal);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleClaimUpsell = async () => {
    setUpsellStatus("adding");
    try {
      const res = await fetch("/api/checkout/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          upsellId: upsellItem.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpsellStatus("claimed");
        if (data.newTotal) {
          setCurrentTotal(data.newTotal.toFixed(2));
        }
      } else {
        setUpsellStatus("idle");
      }
    } catch (e) {
      console.error(e);
      setUpsellStatus("idle");
    }
  };

  const steps = [
    { icon: Sparkles, title: "AI forwarded to supplier", body: "Done — median 2.3s. The supplier was paid and the blind-dropship order slip is in their queue.", state: "done" as const },
    { icon: Package, title: "Supplier packs under your slip", body: "Picked, QC-scanned, boxed with zero factory markups or Chinese invoices.", state: "active" as const },
    { icon: Truck, title: "In transit to your door", body: "Live carrier scans with tracking link available in your dashboard.", state: "todo" as const },
    { icon: Home, title: "Delivered & unboxed", body: "30-day money-back guarantee, handled by Vendora direct. Always.", state: "todo" as const },
  ];

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center overflow-hidden bg-[#0b0c0e] px-4 py-16 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(126,226,168,0.14)_0%,transparent_65%)]" />

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 180, delay: 0.1 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-[#7ee2a8]/40 bg-gradient-to-br from-[#7ee2a8]/25 to-[#7ee2a8]/5"
      >
        <Check size={48} strokeWidth={3} className="text-[#7ee2a8]" />
      </motion.div>

      <h1 className="relative mt-8 font-display text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl">
        Order placed.
        <br />
        <span className="gold-text">It’s already moving.</span>
      </h1>
      <p className="relative mt-4 flex items-center gap-2 text-sm font-semibold text-[#9a978c]">
        <PartyPopper size={16} className="text-[#e4b45c]" /> Electronic order slip dispatched to factory line
      </p>

      {/* Order Badge Info */}
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-2xl border border-[#e4b45c]/35 bg-[#e4b45c]/10 px-6 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9a978c]">Order number</p>
          <p className="mt-1 font-mono text-xl font-bold tracking-widest text-[#f6d68a]">{orderNumber}</p>
        </div>
        {currentTotal && (
          <div className="rounded-2xl border border-white/10 bg-[#121318] px-6 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9a978c]">Total</p>
            <p className="mt-1 font-display text-xl font-black tabular-nums text-[#f4efe6]">${currentTotal}</p>
          </div>
        )}
        <div className="rounded-2xl border border-white/10 bg-[#121318] px-6 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9a978c]">ETA</p>
          <p className="mt-1 text-sm font-bold text-[#f4efe6]">{eta}</p>
        </div>
      </div>

      {sessionId && (
        <div className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-[#7ee2a8]/30 bg-[#7ee2a8]/10 px-4 py-1.5 text-[11px] font-semibold text-[#7ee2a8]">
          <Check size={14} strokeWidth={2.5} /> Stripe Payment Authorized &amp; Verified
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: POST-PURCHASE 1-CLICK UPSELL MODULE (AOV MULTIPLIER)            */}
      {/* ========================================================================= */}
      <div className="relative mt-10 w-full max-w-2xl text-left">
        <div className="relative rounded-3xl border border-[#e4b45c]/40 bg-gradient-to-b from-[#18161f] to-[#0e1017] p-6 shadow-2xl overflow-hidden">
          {/* Top urgency strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e4b45c]/20 text-[#e4b45c]">
                <Zap size={14} />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#f6d68a]">
                Special One-Time Post-Purchase Offer
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-950/60 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-300">
              <Clock size={12} className="animate-pulse" />
              <span>Expires in {formatTimer(secondsLeft)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-5 items-center">
            {/* Product Image */}
            <div className="relative h-36 w-36 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-2xl bg-[#1c1f2b] border border-white/10 shadow-inner">
              <Image
                src={upsellItem.image}
                alt={upsellItem.name}
                fill
                className="object-cover"
                sizes="160px"
              />
              <span className="absolute top-2 left-2 rounded-md bg-emerald-500/90 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {upsellItem.discountPercent}% OFF
              </span>
            </div>

            {/* Info and 1-Click Buy */}
            <div className="flex-1 space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#9a978c]">
                Add to Parcel #{orderNumber} · Zero Extra Shipping
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                {upsellItem.name}
              </h3>
              <p className="text-xs text-slate-300 leading-snug">
                {upsellItem.tagline}
              </p>

              {/* Price comparison */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="text-2xl font-black text-[#e4b45c]">${upsellItem.discountedPrice.toFixed(2)}</span>
                <span className="text-sm line-through text-slate-500">${upsellItem.originalPrice.toFixed(2)}</span>
                <span className="text-[11px] font-bold text-emerald-400">Save ${(upsellItem.originalPrice - upsellItem.discountedPrice).toFixed(2)}</span>
              </div>

              {/* Perks */}
              <ul className="text-[11px] text-slate-300 space-y-1 pt-1">
                {upsellItem.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#7ee2a8] shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#7ee2a8]" />
              <span>1-Click Charge: Charged directly to the card on file</span>
            </div>

            <button
              onClick={handleClaimUpsell}
              disabled={upsellStatus !== "idle" || secondsLeft === 0}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                upsellStatus === "claimed"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default"
                  : "bg-gradient-to-r from-[#e4b45c] to-[#f6d68a] text-[#0b0c0e] hover:brightness-110 shadow-lg shadow-amber-500/20"
              }`}
            >
              {upsellStatus === "adding" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Adding to Order...
                </>
              ) : upsellStatus === "claimed" ? (
                <>
                  <Check size={15} strokeWidth={3} className="text-emerald-400" />
                  Added to Your Package!
                </>
              ) : (
                <>
                  <Plus size={15} strokeWidth={3} />
                  Add to My Order for ${upsellItem.discountedPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <ol className="relative mt-12 grid w-full max-w-4xl gap-3 text-left sm:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className={`relative rounded-2xl border p-4 ${
              step.state === "done"
                ? "border-[#7ee2a8]/35 bg-[#7ee2a8]/8"
                : step.state === "active"
                  ? "border-[#e4b45c]/40 bg-[#e4b45c]/8"
                  : "border-white/10 bg-[#121318]"
            }`}
          >
            <step.icon
              size={20}
              className={step.state === "done" ? "text-[#7ee2a8]" : step.state === "active" ? "text-[#f6d68a]" : "text-[#5a5850]"}
            />
            <p className="mt-2 text-[11px] font-black uppercase tracking-wider text-[#f4efe6]">{step.title}</p>
            <p className="mt-1 text-[10.5px] leading-snug text-[#9a978c]">{step.body}</p>
            {step.state === "done" && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#7ee2a8]">
                <Check size={12} strokeWidth={3.5} className="text-[#0b0c0e]" />
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/track?q=${encodeURIComponent(orderNumber)}`}
          className="flex items-center gap-2 rounded-2xl bg-[#e4b45c] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#0b0c0e] transition hover:bg-[#f6d68a]"
        >
          <PackageSearch size={17} strokeWidth={2.4} /> Track my order
        </Link>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#f4efe6] transition hover:border-[#e4b45c]/50 hover:text-[#f6d68a]"
        >
          Keep shopping <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-[#0b0c0e] text-[#9a978c]">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
