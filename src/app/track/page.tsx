"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Package,
  Send,
  Truck,
  Home,
  Loader2,
  CreditCard,
  Check,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Building2,
} from "lucide-react";

type Milestone = {
  timestamp: string;
  status: string;
  location: string;
  description: string;
};

type TrackedOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  supplier: string;
  supplierOrderId?: string | null;
  trackingNumber?: string | null;
  carrierName?: string | null;
  trackingUrl?: string | null;
  deliverySpeed: string;
  createdAt: string;
  liveMilestones?: Milestone[];
  items: { name: string; quantity: number; price: number; image: string | null; supplier?: string | null }[];
};

const STAGES = [
  { key: "paid", label: "Payment confirmed", icon: CreditCard, detail: "AI forwarded this to the supplier" },
  { key: "forwarded", label: "With the supplier", icon: Send, detail: "Picking, QC & packing under your slip" },
  { key: "shipped", label: "In transit", icon: Truck, detail: "First carrier scan received" },
  { key: "delivered", label: "Delivered", icon: Home, detail: "30-day returns window open" },
];

function TrackInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setError("Enter an order number (VND-…) or the email used at checkout.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Lookup failed.");
        setOrders(null);
      } else {
        setOrders(data.orders ?? []);
      }
    } catch {
      setError("Network error — try again.");
      setOrders(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQ) return;
    let ignore = false;
    fetch(`/api/track?q=${encodeURIComponent(initialQ.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          if (data?.error) {
            setError(data.error);
            setOrders(null);
          } else {
            setOrders(data.orders ?? []);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Network error — try again.");
          setOrders(null);
        }
      });
    return () => {
      ignore = true;
    };
  }, [initialQ]);

  return (
    <div className="min-h-[75vh] bg-[#0b0c0e] text-[#f4efe6]">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">
          <Package size={13} /> Order tracking · live supplier scan feed
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">
          Where’s my<br />
          <span className="gold-text">order?</span>
        </h1>

        {/* search */}
        <form onSubmit={(e) => { e.preventDefault(); lookup(query); }} className="mt-6 flex gap-2">
          <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#121318] px-5 transition focus-within:border-[#e4b45c]/55">
            <Search size={18} className="shrink-0 text-[#75726a]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="VND-2916 or you@example.com"
              className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-[#5a5850]"
              aria-label="Order number or email"
            />
          </label>
          <button type="submit" disabled={busy} className="rounded-2xl bg-[#e4b45c] px-6 text-[#0b0c0e] transition hover:bg-[#f6d68a] disabled:opacity-60 cursor-pointer" aria-label="Look up order">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} strokeWidth={2.6} />}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-[#ff9d8a]">{error}</p>}

        {/* results */}
        {orders && orders.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-[#121318] py-14 text-center">
            <Search size={30} className="text-[#3d3e46]" />
            <p className="font-display text-2xl font-bold">No order found</p>
            <p className="max-w-xs text-sm text-[#9a978c]">Check the order number on your receipt email, or search with the exact email used at checkout.</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {orders?.map((order) => {
            const stageIdx = Math.max(0, STAGES.findIndex((s) => s.key === order.status));
            return (
              <article key={order.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#121318]">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-base font-bold tracking-widest text-[#f6d68a]">{order.orderNumber}</p>
                      {order.supplierOrderId && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {order.supplierOrderId}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#75726a]">
                      Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {order.deliverySpeed} · {order.supplier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-black tabular-nums">${order.total.toFixed(2)}</p>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-slate-300">
                          {order.carrierName || "YunExpress"}: {order.trackingNumber}
                        </span>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                            title="Open carrier tracking"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-5">
                  {/* timeline */}
                  <div className="md:col-span-3 space-y-6">
                    <ol>
                      {STAGES.map((stage, i) => {
                        const done = i < stageIdx;
                        const active = i === stageIdx;
                        const complete = order.status === "delivered";
                        const reached = done || active || complete;
                        return (
                          <li key={stage.key} className="relative flex gap-4 pb-5 last:pb-0">
                            {/* connector */}
                            {i < STAGES.length - 1 && (
                              <span aria-hidden className={`absolute left-[13px] top-7 h-full w-0.5 ${reached && (i < stageIdx || complete) ? "bg-[#7ee2a8]/50" : "bg-white/10"}`} />
                            )}
                            <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              (i < stageIdx || complete) ? "border-[#7ee2a8]/60 bg-[#7ee2a8]/15 text-[#7ee2a8]"
                              : active ? "border-[#e4b45c]/60 bg-[#e4b45c]/15 text-[#f6d68a]"
                              : "border-white/10 bg-[#0b0c0e] text-[#5a5850]"
                            }`}>
                              {(i < stageIdx || complete) ? <Check size={14} strokeWidth={3} /> : <stage.icon size={13} />}
                            </span>
                            <div>
                              <p className={`text-[12.5px] font-bold ${reached ? "text-[#f4efe6]" : "text-[#5a5850]"}`}>{stage.label}</p>
                              <p className="text-[10.5px] text-[#75726a]">{stage.detail}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    {/* Live Carrier Milestones Feed */}
                    {order.liveMilestones && order.liveMilestones.length > 0 && (
                      <div className="rounded-2xl border border-white/5 bg-[#0b0c0e] p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#e4b45c]">
                          <span className="flex items-center gap-1.5">
                            <Truck size={12} /> Live Courier Milestones
                          </span>
                          <span className="text-[#7ee2a8]">Auto-Synced</span>
                        </div>
                        <div className="space-y-2">
                          {order.liveMilestones.map((m, idx) => (
                            <div key={idx} className="text-xs border-l-2 border-[#e4b45c]/40 pl-2.5 py-0.5">
                              <div className="font-semibold text-slate-200">{m.location}</div>
                              <div className="text-[11px] text-slate-400">{m.description}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(m.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("vendora:ask-ai", { detail: `Where is my order ${order.orderNumber}?` }))}
                        className="flex items-center gap-2 rounded-xl border border-[#e4b45c]/35 bg-[#e4b45c]/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d68a] transition hover:bg-[#e4b45c]/20 cursor-pointer"
                      >
                        <Sparkles size={13} /> Ask AI for a live status read
                      </button>
                    </div>
                  </div>

                  {/* items */}
                  <div className="md:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#75726a]">In this parcel</p>
                    <ul className="mt-2 space-y-2">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0b0c0e] p-2">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1a1b21]">
                            {item.image && <Image src={item.image} alt={item.name} fill unoptimized sizes="48px" className="object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold">{item.name}</p>
                            <p className="text-[9px] text-[#75726a]">Qty {item.quantity} · ${item.price.toFixed(2)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link href="/shop" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#c9c5b8] transition hover:border-[#e4b45c]/40 hover:text-[#f6d68a]">
                      <ShoppingBag size={13} /> Order again
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-[#0b0c0e] text-[#9a978c]">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}
