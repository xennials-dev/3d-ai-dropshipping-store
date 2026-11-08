"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Megaphone,
  Target,
  LayoutGrid,
  Hourglass,
  Headset,
  ChevronDown,
  Sparkles,
  Bot,
  Globe2,
  Package,
  Printer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Reveal, SectionHead } from "@/components/fx";

/* ================= FIT CHECKLIST ================= */
const greenLights: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Megaphone, title: "You’re all about marketing", body: "Traffic is the game — Meta, TikTok, Google, SEO. Dropshipping rewards distribution skill over operations." },
  { icon: Target, title: "You’re sales-driven, not brand-first", body: "Fewer branding windows (packaging, exclusivity). You optimize for conversion rate and creative, not identity systems." },
  { icon: LayoutGrid, title: "You want endless product variety", body: "Thousands of SKUs, zero inventory risk. Test 20 products this month, keep the 2 that convert." },
  { icon: Hourglass, title: "You can set ship-time expectations", body: "Domestic lanes land in 2–7 days; cross-border in 7–15. Clear delivery copy beats silent carts." },
  { icon: Headset, title: "You’re ready to own support", body: "You’re the seller of record — returns, refunds and “where’s my order?” land in your inbox. Ours come with templates and AI drafts." },
];
const redLights = [
  { title: "You need exclusivity or white-label rights", body: "The same SKU ships from dozens of stores. Go private-label or print-on-demand instead." },
  { title: "You want guaranteed <3-day delivery, globally", body: "Sourcing from China averages 7–15 days. Filter the catalog to Fast-Ship US/EU suppliers." },
  { title: "You won’t touch samples", body: "$50–$100 per sample protects your reputation. No sample, no listing — it’s our rule too." },
];

export function ShouldYou() {
  return (
    <section id="fit" className="border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Honest filter"
          title={<>Should you<br /><span className="gold-text">start dropshipping?</span></>}
          sub="Not every business should. Here’s the straight list — green lights we’d start on, red ones we’d walk away from."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="rounded-3xl border border-[#7ee2a8]/20 bg-gradient-to-b from-[#7ee2a8]/[0.07] to-transparent p-6 lg:col-span-3">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#7ee2a8]">Green lights — start here</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {greenLights.map((g) => (
                <div key={g.title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#7ee2a8]/30 bg-[#7ee2a8]/10 text-[#7ee2a8]">
                    <g.icon size={17} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-snug text-[#f4efe6]">{g.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#9a978c]">{g.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[#f0715c]/20 bg-gradient-to-b from-[#f0715c]/[0.07] to-transparent p-6 lg:col-span-2">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f0a08f]">Think twice — or adjust the plan</p>
            <div className="mt-5 space-y-4">
              {redLights.map((r) => (
                <div key={r.title} className="flex gap-3 rounded-2xl border border-white/5 bg-[#0b0c0e]/60 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f0715c]/30 bg-[#f0715c]/10 text-[#f0715c]">
                    <X size={17} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-snug text-[#f4efe6]">{r.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#9a978c]">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-[10.5px] leading-snug text-[#75726a]">
              Established retailer? Use dropshipping to test new categories alongside your stocked line — Sweet Water Decor grew this way, merchandised by 35 Collective partners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= PROS & CONS ================= */
const benefits = [
  ["Minimal upfront investment", "No pallets, no warehouse lease — start from a laptop."],
  ["Endless catalog freedom", "Swap SKUs with supplier stock in near real-time."],
  ["Zero product-development cost", "Sell what already exists and ships today."],
  ["Run it from anywhere", "Home, airport, Lisbon — just internet and suppliers."],
  ["No fulfillment ops", "Picking, packing, carrier labels: not your job."],
  ["Perfect for demand testing", "Trial categories before committing to bulk buys."],
  ["Scales without infrastructure", "1,000 orders/day needs zero new square footage."],
];
const drawbacks = [
  ["Thinner margins (15–25%)", "Competition undercuts price — differentiate on speed & brand."],
  ["Inventory volatility", "Suppliers sell to everyone; stock vanishes. Flow auto-hides sold-out SKUs."],
  ["Multi-supplier complexity", "3 items from 3 suppliers = 3 parcels, 3 tracking numbers."],
  ["Less control over quality", "Mitigate with sample orders and 4.5+ rated partners only."],
];

export function ProsCons() {
  return (
    <section id="proscons" className="border-b border-white/5 bg-[#08090b] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="The honest ledger"
          title={<>7 wins, 4 trade-offs —<br /><span className="gold-text">read both columns</span></>}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#7ee2a8]/20 bg-[#121318] p-6 sm:p-8">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#7ee2a8]"><Plus size={14} strokeWidth={3} /> Seven reasons it wins</p>
            <ol className="mt-5 divide-y divide-white/5">
              {benefits.map(([t, d], i) => (
                <li key={t} className="flex gap-4 py-3.5">
                  <span className="font-display text-xl font-black text-white/10">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="text-sm font-bold text-[#f4efe6]">{t}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-[#9a978c]">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-3xl border border-[#f0715c]/20 bg-[#121318] p-6 sm:p-8">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#f0a08f]"><Minus size={14} strokeWidth={3} /> Four trade-offs to price in</p>
              <ol className="mt-5 divide-y divide-white/5">
                {drawbacks.map(([t, d], i) => (
                  <li key={t} className="flex gap-4 py-3.5">
                    <span className="font-display text-xl font-black text-white/10">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="text-sm font-bold text-[#f4efe6]">{t}</span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-[#9a978c]">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-[#e4b45c]/25 bg-gradient-to-br from-[#e4b45c]/15 to-transparent p-6">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#f6d68a]"><TrendingUp size={13} /> The tiebreaker</p>
              <p className="mt-2 text-sm leading-relaxed text-[#e8e4d8]">
                “Content is king and data is queen. People over-strategize the store — but step one is the ads and the content.”
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-[#9a978c]">AC Hampton · Supreme Ecom · Shopify Masters</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= 2027 TRENDS ================= */
const trends = [
  { icon: Bot, stat: "75%", label: "of merchants already run AI daily", title: "Rise of the AI operator", body: "Sidekick-style agents rewrite listings, watch margins and text you when a customer complains. Vendora ships AI on every plan — free." },
  { icon: Globe2, stat: "35.2%", label: "US tariff on Chinese imports vs 16.3% elsewhere", title: "De minimis is over", body: "Sub-$800 imports are no longer duty-free. Smart stores add HS codes per SKU and route EU/US suppliers first — Vendora does both automatically." },
  { icon: Package, stat: "500+", label: "dropshipping apps in the ecosystem", title: "More suppliers, more choice", body: "Free sourcing from thousands of retailers. Connect Shopify Collective, Syncee or DropCommerce in one click and sync stock live." },
  { icon: Printer, stat: "POD", label: "private-label dropshipping goes mainstream", title: "Brand-first dropshipping", body: "Print-on-demand and private label give you exclusive designs with dropshipping logistics — the Collective + Printful stack, one checkout here." },
];

export function Trends() {
  return (
    <section id="trends" className="border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Looking ahead"
          title={<>Dropshipping in 2027:<br /><span className="gold-text">four shifts to ride</span></>}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trends.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-white/10 bg-[#121318] p-6 transition hover:-translate-y-1 hover:border-[#e4b45c]/35">
                <t.icon size={22} className="text-[#e4b45c]" strokeWidth={1.8} />
                <p className="mt-4 font-display text-4xl font-black tracking-tight text-[#f6d68a]">{t.stat}</p>
                <p className="mt-1 text-[9.5px] font-semibold uppercase leading-snug tracking-wider text-[#75726a]">{t.label}</p>
                <h3 className="mt-4 text-base font-bold text-[#f4efe6]">{t.title}</h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9a978c]">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ACCORDION ================= */
const faqs = [
  { q: "What is dropshipping, exactly?", a: "An ecommerce model where your store sells products you don’t physically hold. When a customer buys, the order is forwarded to a third-party supplier who picks, packs and ships directly to the customer — under your brand. You pay the supplier wholesale; you keep the spread." },
  { q: "How does fulfillment work on Vendora, step by step?", a: "1) You connect vetted suppliers (Collective, DropCommerce, Syncee, DSers, AI Dropship). 2) Their catalog syncs to your store at your markup. 3) A customer checks out normally. 4) Vendora AI matches the best supplier by stock score and ship-speed and forwards the order in a median of 2.3 seconds. 5) The supplier ships under your invoice. 6) The customer unboxes; you keep the relationship." },
  { q: "Who is the “seller of record” — and why should I care?", a: "You are. That means you set prices, collect payment and taxes, and own all support — returns, refunds, delivery issues. Your business name (not the supplier’s) appears on packing slips. It also means suppliers can add their own marketing materials unless you negotiate it out — always confirm packaging terms before you list." },
  { q: "How fast is shipping, really?", a: "US/Canada lanes via Collective or DropCommerce: 2–7 days. EU lanes via Syncee or AI Dropship: often under 7 days. China lanes via ePacket: 7–15 business days. Toggle “Fast-Ship only” in the catalog filter to restrict listings to domestic stock." },
  { q: "What margins should I expect?", a: "Trueprofit’s 2026 analysis: 15–25% net on average for cross-border operations, 20–50% for Shopify Collective retailers, and 40–60% reported by TikTok-organic operators. Vendora’s catalog shows live margin per SKU so you never guess — head to the Margins section for the full breakdown." },
  { q: "Returns and refunds — who handles what?", a: "You (the seller of record) handle the customer; the supplier’s return policy governs whether they refund you. Many suppliers now run self-serve return portals that sync back to us automatically. Damaged or wrong orders: we open a claim with the supplier and make the customer whole first — that’s the marketplace promise." },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-[#08090b] py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Ask anything"
          title={<>Dropshipping,<br /><span className="gold-text">answered</span></>}
        />
        <div className="mt-10 divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/10 bg-[#121318]">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-white/[0.03]"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-bold text-[#f4efe6]">{item.q}</span>
                  <ChevronDown size={19} className={`shrink-0 text-[#e4b45c] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="max-w-3xl text-sm leading-relaxed text-[#b8b5a9]">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("vendora:ask-ai", { detail: "I have a question about dropshipping" }))}
          className="mx-auto mt-6 flex items-center gap-2 rounded-2xl border border-[#e4b45c]/40 bg-[#e4b45c]/10 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#f6d68a] transition hover:bg-[#e4b45c]/20"
        >
          <Sparkles size={16} /> Still curious? Ask Vendora AI
        </button>
      </div>
    </section>
  );
}
