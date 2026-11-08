"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Compass,
  RefreshCw,
  Send,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  ShoppingCart,
  Gauge,
  Sparkles,
  Loader2,
  TriangleAlert,
  Info,
  Truck,
  CheckCircle2,
  CircleDollarSign,
  Star,
  AlertTriangle,
  ChevronRight,
  Inbox,
  Zap,
  Package,
  type LucideIcon,
} from "lucide-react";

type DailyPoint = { day: string; label: string; revenue: number; orders: number };
type Stats = {
  revenue30d: number;
  orders30d: number;
  aov: number;
  margin30d: number;
  pendingForward: number;
  daily: DailyPoint[];
  topProducts: { name: string; qty: number; revenue: number; slug: string | null }[];
  suppliers: { name: string; orders: number; revenue: number; rating: number; fastestDays: number }[];
  avgShipDays: number;
  newSubscribers: number;
};
type RecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  supplier: string;
  deliverySpeed: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number; image: string | null }[];
};
type LowStock = { id: number; name: string; stock: number; slug: string };
type Insight = { tone: "up" | "warn" | "gold" | "info"; title: string; body: string };

const STATUS_META: Record<string, { label: string; cls: string; icon: LucideIcon; next: string | null }> = {
  paid: { label: "Paid · queued", cls: "border-[#e4b45c]/45 bg-[#e4b45c]/12 text-[#f6d68a]", icon: Inbox, next: "Forward now" },
  forwarded: { label: "Forwarded", cls: "border-[#8ec5ff]/45 bg-[#8ec5ff]/12 text-[#a8d4ff]", icon: Send, next: "Mark shipped" },
  shipped: { label: "Shipped", cls: "border-[#c4a4ff]/45 bg-[#c4a4ff]/12 text-[#d3bcff]", icon: Truck, next: "Mark delivered" },
  delivered: { label: "Delivered", cls: "border-[#7ee2a8]/45 bg-[#7ee2a8]/12 text-[#7ee2a8]", icon: CheckCircle2, next: null },
};

const TONE_META: Record<Insight["tone"], { icon: LucideIcon; cls: string }> = {
  up: { icon: TrendingUp, cls: "border-[#7ee2a8]/35 bg-[#7ee2a8]/10 text-[#7ee2a8]" },
  warn: { icon: TriangleAlert, cls: "border-[#f0a08f]/35 bg-[#f0a08f]/10 text-[#f0a08f]" },
  gold: { icon: Sparkles, cls: "border-[#e4b45c]/35 bg-[#e4b45c]/10 text-[#f6d68a]" },
  info: { icon: Info, cls: "border-[#8ec5ff]/35 bg-[#8ec5ff]/10 text-[#a8d4ff]" },
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [forwardingAll, setForwardingAll] = useState(false);
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [insightSource, setInsightSource] = useState<"openai" | "local" | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders ?? []);
      setLowStock(data.lowStock ?? []);
      setSyncedAt(new Date(data.generatedAt ?? Date.now()));
    } catch {
      setError("Couldn’t reach the ledger. Check the database connection and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/data", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders ?? []);
          setLowStock(data.lowStock ?? []);
          setSyncedAt(new Date(data.generatedAt ?? Date.now()));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Couldn’t reach the ledger. Check the database connection and retry.");
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const wow = useMemo(() => {
    if (!stats) return 0;
    const half = Math.floor(stats.daily.length / 2);
    const first = stats.daily.slice(0, half).reduce((s, d) => s + d.revenue, 0);
    const second = stats.daily.slice(half).reduce((s, d) => s + d.revenue, 0);
    return first > 0 ? ((second - first) / first) * 100 : 0;
  }, [stats]);

  const maxRevenue = useMemo(() => Math.max(1, ...(stats?.daily.map((d) => d.revenue) ?? [1])), [stats]);
  const maxQty = useMemo(() => Math.max(1, ...(stats?.topProducts.map((p) => p.qty) ?? [1])), [stats]);
  const blendedMargin = stats && stats.revenue30d > 0 ? (stats.margin30d / stats.revenue30d) * 100 : 0;

  const forwardAll = async () => {
    setForwardingAll(true);
    try {
      await fetch("/api/admin/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await load();
    } finally {
      setForwardingAll(false);
    }
  };

  const advance = async (id: number) => {
    setRecentOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "paid" ? "forwarded" : o.status === "forwarded" ? "shipped" : o.status === "shipped" ? "delivered" : o.status }
          : o
      )
    );
    try {
      await fetch("/api/admin/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
    } catch {
      /* the optimistic state is close enough for demo purposes */
    }
  };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/insights", { cache: "no-store" });
      const data = await res.json();
      setInsights(data.insights ?? []);
      setInsightSource(data.source ?? "local");
    } catch {
      setInsights([{ tone: "warn", title: "Insight engine offline", body: "Couldn’t generate insights — the store data is safe. Try again in a moment." }]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f4efe6]">
      {/* control bar */}
      <div className="border-b border-white/10 bg-[#08090b]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e4b45c]/35 bg-[#e4b45c]/10 text-[#e4b45c]">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black leading-none tracking-tight">Merchant dashboard</h1>
              <p className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#75726a]">
                <span className="ping-dot h-2 w-2 rounded-full bg-[#7ee2a8]" /> Live · synced {syncedAt ? syncedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/admin/sourcing"
              className="flex items-center gap-2 rounded-xl border border-blue-500/35 bg-blue-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 transition hover:bg-blue-500/20 hover:border-blue-500"
            >
              <Compass size={14} className="text-blue-400" /> Sourcing Radar &amp; Alibaba
            </a>
            <button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#c9c5b8] transition hover:border-white/25 hover:text-white disabled:opacity-50">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
            </button>
            <button
              onClick={forwardAll}
              disabled={forwardingAll || !stats || stats.pendingForward === 0}
              className="flex items-center gap-2 rounded-xl bg-[#e4b45c] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#0b0c0e] transition enabled:hover:bg-[#f6d68a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {forwardingAll ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2.5} />}
              Forward all pending{stats?.pendingForward ? ` (${stats.pendingForward})` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading && !stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/5 bg-[#121318]" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#f0715c]/30 bg-[#f0715c]/5 py-16 text-center">
            <TriangleAlert size={32} className="text-[#f0715c]" />
            <p className="font-display text-xl font-bold">Dashboard offline</p>
            <p className="max-w-sm text-sm text-[#9a978c]">{error}</p>
            <button onClick={load} className="mt-2 rounded-xl bg-[#e4b45c] px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#0b0c0e]">Retry</button>
          </div>
        )}

        {stats && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: CircleDollarSign, label: "Revenue · 21 days", value: `$${stats.revenue30d.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, sub: `${wow >= 0 ? "+" : ""}${wow.toFixed(1)}% vs prior week`, up: wow >= 0 },
                { icon: ShoppingCart, label: "Orders", value: String(stats.orders30d), sub: `${stats.pendingForward} awaiting forward`, up: stats.pendingForward === 0 },
                { icon: Receipt, label: "Avg order value", value: `$${stats.aov.toFixed(2)}`, sub: "incl. express & promo discounts", up: true },
                { icon: Wallet, label: "Margin captured", value: `$${stats.margin30d.toFixed(0)}`, sub: `${blendedMargin.toFixed(1)}% blended · $${(stats.margin30d / Math.max(1, stats.orders30d)).toFixed(2)} per order`, up: blendedMargin >= 30 },
              ].map((k, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#121318] p-5">
                  <k.icon size={17} className="text-[#e4b45c]" />
                  <p className="mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#75726a]">{k.label}</p>
                  <p className="mt-1.5 font-display text-2xl font-black tabular-nums sm:text-3xl">{k.value}</p>
                  <p className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${k.up ? "text-[#7ee2a8]" : "text-[#f0a08f]"}`}>
                    {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {k.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* revenue chart */}
              <div className="rounded-3xl border border-white/10 bg-[#121318] p-6 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Daily revenue · last 14 days</p>
                    <p className="mt-1 font-display text-xl font-black">The pulse of the store</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#c9c5b8]"><Zap size={11} className="text-[#e4b45c]" /> {stats.newSubscribers} new subscribers · 14d</span>
                </div>
                <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2.5">
                  {stats.daily.map((d, i) => (
                    <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <span className="text-[9px] font-bold tabular-nums text-[#f6d68a] opacity-0 transition group-hover:opacity-100">${d.revenue.toFixed(0)}</span>
                      <div
                        title={`${d.label} — $${d.revenue.toFixed(2)} · ${d.orders} orders`}
                        className={`w-full rounded-t-[4px] transition-all duration-500 ${i === stats.daily.length - 1 ? "bg-gradient-to-t from-[#9a6b25] via-[#e4b45c] to-[#f6d68a]" : "bg-white/12 group-hover:bg-[#e4b45c]/60"}`}
                        style={{ height: `${(d.revenue / maxRevenue) * 78 + 6}%` }}
                      />
                      <span className="hidden text-[8px] font-semibold uppercase text-[#5a5850] sm:block">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI chief of staff */}
              <div className="overflow-hidden rounded-3xl border border-[#e4b45c]/30 bg-gradient-to-b from-[#e4b45c]/12 via-[#121318] to-[#121318]">
                <div className="flex items-center justify-between border-b border-[#e4b45c]/20 px-6 py-4">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#f6d68a]"><Sparkles size={13} /> Vendora AI · chief of staff</p>
                  {insightSource && <span className="text-[8px] font-bold uppercase tracking-widest text-[#75726a]">{insightSource === "openai" ? "GPT-4o" : "on-device"}</span>}
                </div>
                <div className="p-5">
                  {!insights ? (
                    <div className="flex flex-col items-start gap-4">
                      <p className="text-sm leading-relaxed text-[#c9c5b8]">
                        I’ve crunched 21 days of orders, margins, supplier performance and traffic. Want the operator’s brief?
                      </p>
                      <button onClick={generateInsights} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4b45c] py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0b0c0e] transition hover:bg-[#f6d68a] disabled:opacity-60">
                        {generating ? (<><Loader2 size={16} className="animate-spin" /> Reading the ledger…</>) : (<><Sparkles size={15} /> Generate 4 insights</>)}
                      </button>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-[#5a5850]">Grounded in live store data · zero fluff</p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {insights.map((insight, i) => {
                        const meta = TONE_META[insight.tone] ?? TONE_META.info;
                        return (
                          <li key={i} className={`flex gap-2.5 rounded-2xl border p-3 ${meta.cls}`}>
                            <meta.icon size={15} className="mt-0.5 shrink-0" />
                            <span>
                              <span className="block text-[11px] font-black text-[#f4efe6]">{insight.title}</span>
                              <span className="mt-1 block text-[10.5px] leading-snug text-[#c9c5b8]">{insight.body}</span>
                            </span>
                          </li>
                        );
                      })}
                      <button onClick={generateInsights} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#9a978c] transition hover:text-[#f6d68a]">
                        {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Regenerate brief
                      </button>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* orders + suppliers */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* recent orders */}
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121318] xl:col-span-2">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Recent orders · fulfillment pipeline</p>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5a5850]"><Package size={11} /> {recentOrders.length} latest</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-[11px]">
                    <thead className="text-[9px] uppercase tracking-[0.22em] text-[#5a5850]">
                      <tr className="border-b border-white/10">
                        <th className="px-5 py-3 font-black">Order</th>
                        <th className="py-3 font-black">Customer</th>
                        <th className="py-3 font-black">Total</th>
                        <th className="py-3 font-black">Status</th>
                        <th className="py-3 pr-5 text-right font-black">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentOrders.map((o) => {
                        const meta = STATUS_META[o.status] ?? STATUS_META.paid;
                        return (
                          <tr key={o.id} className="transition-colors hover:bg-white/[0.02]">
                            <td className="px-5 py-3">
                              <p className="font-mono text-[10.5px] font-bold text-[#f6d68a]">{o.orderNumber}</p>
                              <p className="text-[9px] text-[#5a5850]">{o.items.length} item{o.items.length === 1 ? "" : "s"} · {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                            </td>
                            <td className="max-w-[140px] truncate py-3 text-[#c9c5b8]">{o.customerName}</td>
                            <td className="py-3 font-bold tabular-nums">${o.total.toFixed(2)}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest ${meta.cls}`}>
                                <meta.icon size={10} /> {meta.label}
                              </span>
                            </td>
                            <td className="py-3 pr-5 text-right">
                              {meta.next ? (
                                <button
                                  onClick={() => advance(o.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#e4b45c]/40 bg-[#e4b45c]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#f6d68a] transition hover:bg-[#e4b45c]/20"
                                >
                                  {meta.next} <ChevronRight size={11} strokeWidth={3} />
                                </button>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#5a5850]">Complete</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* supplier scorecard */}
              <div className="rounded-3xl border border-white/10 bg-[#121318]">
                <div className="border-b border-white/10 px-6 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Supplier scorecard · by revenue</p>
                  <p className="mt-1 text-[10px] text-[#5a5850]">AI routes each order to the best-scoring lane</p>
                </div>
                <ol className="divide-y divide-white/5">
                  {stats.suppliers.slice(0, 6).map((s, i) => (
                    <li key={s.name} className="flex items-center gap-3 px-5 py-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-black ${i === 0 ? "bg-[#e4b45c] text-[#0b0c0e]" : "bg-white/5 text-[#9a978c]"}`}>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-[#f4efe6]">{s.name}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-[9px] text-[#75726a]">
                          <span className="flex items-center gap-0.5"><Star size={9} fill="#e4b45c" className="text-[#e4b45c]" />{s.rating.toFixed(1)}</span>
                          · {s.fastestDays}–{s.fastestDays + 5}d · {s.orders} orders
                        </p>
                      </div>
                      <p className="text-[11px] font-black tabular-nums text-[#f6d68a]">${s.revenue.toFixed(0)}</p>
                    </li>
                  ))}
                </ol>
                {lowStock.length > 0 && (
                  <div className="border-t border-white/10 px-5 py-4">
                    <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#f0a08f]"><AlertTriangle size={11} /> Reorder risk</p>
                    <ul className="mt-2 space-y-1.5">
                      {lowStock.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 text-[10.5px]">
                          <span className="truncate text-[#c9c5b8]">{p.name}</span>
                          <span className="shrink-0 font-mono text-[9.5px] font-bold text-[#f0a08f]">{p.stock} left</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* top products */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#121318] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Top movers · units sold · 21 days</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.topProducts.map((p) => (
                  <div key={p.name} className="rounded-2xl border border-white/5 bg-[#0b0c0e] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[11.5px] font-bold text-[#f4efe6]">{p.name}</p>
                      <span className="shrink-0 font-display text-lg font-black tabular-nums text-[#f6d68a]">{p.qty}×</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#f6d68a] to-[#9a6b25]" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-[#5a5850]">${p.revenue.toFixed(2)} attributed revenue</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
