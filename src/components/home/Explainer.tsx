"use client";

import dynamic from "next/dynamic";
import {
  Handshake,
  Store,
  ShoppingCart,
  Send,
  PackageCheck,
  Home,
  Quote,
  Sparkles,
  Truck,
  FileText,
  Radar,
  Boxes,
  CircleCheck,
} from "lucide-react";
import { Reveal, AnimatedNumber, SectionHead } from "@/components/fx";

const Globe3D = dynamic(() => import("@/components/Globe3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-56 w-56 animate-pulse rounded-full border border-[#e4b45c]/30 bg-[#e4b45c]/5" />
    </div>
  ),
});

const steps = [
  { n: "01", icon: Handshake, title: "Partner with a supplier", body: "Vet 5+ year operators. Order the $50–$100 sample before you ever list the product.", ai: false },
  { n: "02", icon: Store, title: "Set up your store", body: "List their catalog at your price. Inventory syncs live — zero boxes in your garage.", ai: false },
  { n: "03", icon: ShoppingCart, title: "Customer checks out", body: "Normal checkout: payment, confirmation, and a delivery promise set by supplier stock.", ai: false },
  { n: "04", icon: Send, title: "AI forwards the order", body: "Vendora pays the supplier and routes the slip — order-to-supplier in a median 2.3s.", ai: true },
  { n: "05", icon: PackageCheck, title: "Supplier ships direct", body: "They pick, pack and ship under your invoice. Your brand, zero warehouse.", ai: false },
  { n: "06", icon: Home, title: "Customer unboxes", body: "The customer receives the parcel. You own inbox, returns and 5-star reviews.", ai: false },
];

export default function Explainer() {
  return (
    <>
      {/* ============ WHAT IS DROPSHIPPING ============ */}
      <section id="dropshipping" className="relative border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-28">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#e4b45c]/5 blur-[140px]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
          {/* left rail — sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">The model, explained</span>
              <h2 className="mt-3 font-display text-4xl font-black leading-[1.0] tracking-tight text-[#f4efe6] sm:text-5xl">
                What is
                <br />
                <span className="gold-text">dropshipping?</span>
              </h2>
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#121318] p-6">
                <Quote size={22} className="text-[#e4b45c]" fill="#e4b45c" strokeWidth={0} />
                <p className="mt-3 font-display text-lg leading-snug text-[#f4efe6]">
                  “I wanted to work with a supplier that was at least five years active. Any business that was around one year seemed like a risk to me.”
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a978c]">
                  Corey Ferreira <span className="text-[#5a5850]">· Shopify Masters interview</span>
                </p>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-[#75726a]">
                Dropshipping is an ecommerce fulfillment model where your store never holds inventory. When a sale happens, the order is routed to a third-party supplier who picks, packs and ships the product directly to your customer — under your name.
              </p>
            </div>
          </div>

          {/* right column */}
          <div className="lg:col-span-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-[#d8d5cb]">
                It’s the retail engine behind a{" "}
                <strong className="text-[#f6d68a]">$167 billion industry in 2026</strong> — and it’s
                projected to compound at <strong className="text-[#f6d68a]">18.9% a year through 2033</strong>.
                No warehouse. No pallets. No unsold inventory bleeding cash. You win on{" "}
                <em>marketing, branding and customer experience</em>; suppliers win on logistics.
              </p>
            </Reveal>

            {/* stat tiles */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { v: 167, prefix: "$", suffix: "B", label: "Global dropshipping market size in 2026", decimals: 0 },
                { v: 18.9, prefix: "", suffix: "%", label: "Compound annual growth rate through 2033", decimals: 1 },
                { v: 562, prefix: "$", suffix: "B", label: "Projected market value by 2033 (18.9% CAGR)", decimals: 0 },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div className="group h-full rounded-2xl border border-[#e4b45c]/20 bg-gradient-to-b from-[#e4b45c]/10 to-transparent p-5 transition-colors hover:border-[#e4b45c]/45">
                    <p className="font-display text-4xl font-black tabular-nums tracking-tight text-[#f6d68a] sm:text-5xl">
                      <AnimatedNumber value={s.v} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                    </p>
                    <p className="mt-2 text-[11px] font-medium leading-snug text-[#9a978c]">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* seller of record card */}
            <Reveal delay={0.15}>
              <div id="seller-of-record" className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#121318]">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-3">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#e4b45c]">
                    <FileText size={13} /> Seller of record — who owns the customer?
                  </span>
                  <span className="hidden text-[10px] font-bold uppercase tracking-widest text-[#5a5850] sm:block">Packing slip, illustrated</span>
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-[#d8d5cb]">
                      In dropshipping, <strong className="text-[#f4efe6]">you are the seller of record</strong> — the legal
                      face of the transaction. You set prices, collect payment and taxes, sign every packaging
                      slip and own support: returns, refunds, “where is my order?”. Suppliers stay invisible.
                    </p>
                    <ul className="mt-4 space-y-2 text-[12px] text-[#c9c5b8]">
                      {[
                        "You keep the customer relationship — and the data",
                        "Your name and address print on slips & invoices",
                        "Refunds and returns route through your support",
                        "Marketplace rules (e.g. Amazon) ban supplier-branded packaging",
                      ].map((t) => (
                        <li key={t} className="flex items-start gap-2">
                          <CircleCheck size={14} className="mt-0.5 shrink-0 text-[#7ee2a8]" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* mock packing slip */}
                  <div className="relative flex items-center justify-center border-t border-white/10 bg-[#0b0c0e] p-6 md:border-l md:border-t-0">
                    <div className="w-full max-w-[240px] rotate-[-1.5deg] rounded-md bg-[#f4efe6] p-4 font-mono text-[8.5px] leading-snug text-[#22231f] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
                      <div className="flex items-center justify-between border-b border-[#22231f]/20 pb-2">
                        <span className="text-[10px] font-black tracking-widest">VENDORA</span>
                        <span className="text-[7px] uppercase">packing slip</span>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="font-bold">Order VND-2916</p>
                        <p>Ship to: Maya Bennett</p>
                        <p>88 Harbor Ln, Austin TX</p>
                      </div>
                      <div className="mt-2 space-y-0.5 border-t border-[#22231f]/20 pt-2">
                        <p>1× Aurora X9 Headphones — $89.99</p>
                        <p>1× PawHaven Collar — $16.99</p>
                      </div>
                      <div className="mt-2 border-t border-[#22231f]/20 pt-2 text-[7px] uppercase text-[#55534a]">
                        Fulfilled by partner warehouse<br />Returns: vendora.example/returns
                      </div>
                      <div className="mt-2 h-7 w-full" style={{ backgroundImage: "repeating-linear-gradient(90deg,#22231f 0 2px,transparent 2px 5px,#22231f 5px 6px,transparent 6px 10px)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 3D SUPPLY CHAIN ============ */}
      <section id="network" className="relative overflow-hidden border-b border-white/5 bg-[#08090b] py-20 lg:py-24">
        <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(228,180,92,0.14)_0%,transparent_65%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">The living network · drag the globe</span>
            <h2 className="mt-3 font-display text-4xl font-black leading-[1.0] tracking-tight sm:text-5xl">
              Sixteen hubs.
              <br />
              <span className="gold-text">Zero warehouses.</span>
              <br />
              All yours.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-[#b8b5a9]">
              Every glowing node is a vetted supplier warehouse — US, EU, UK and Asia — holding
              real stock that syncs to your storefront in near real-time. When an order drops,
              Vendora AI picks the closest warehouse with the best score, pays the supplier, and
              prints your slip.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {[
                { icon: Truck, v: 2148, suffix: "", label: "packages in transit now", decimals: 0 },
                { icon: Send, v: 2.3, suffix: "s", label: "median AI forward time", decimals: 1 },
                { icon: Radar, v: 99.1, suffix: "%", label: "supplier match accuracy", decimals: 1 },
                { icon: Boxes, v: 38, suffix: "k", label: "SKUs synced live today", decimals: 0 },
              ].map((s, i) => (
                <div key={i} className="bg-[#121318] p-5">
                  <s.icon size={17} className="text-[#e4b45c]" />
                  <p className="mt-2 font-display text-3xl font-black tabular-nums text-[#f4efe6]">
                    <AnimatedNumber value={s.v} suffix={s.suffix} decimals={s.decimals} />
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider leading-tight text-[#9a978c]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-[540px] overflow-hidden rounded-[2rem] border border-[#e4b45c]/20 bg-[radial-gradient(circle_at_50%_40%,#14120c_0%,#08090b_75%)]">
              <Globe3D />
              <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#f6d68a] backdrop-blur">
                <span className="ping-dot h-2 w-2 rounded-full bg-[#7ee2a8]" /> Live mesh
              </div>
              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div className="rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#9a978c]">Shanghai → Austin</p>
                  <p className="text-xs font-bold text-[#f6d68a]">Container 88-241 · ETA day 11</p>
                </div>
                <div className="hidden rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-right backdrop-blur sm:block">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#9a978c]">Las Vegas → Denver</p>
                  <p className="text-xs font-bold text-[#7ee2a8]">Ground 2-day · on time 98.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="relative border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            eyebrow="The fulfillment loop"
            title={<>From click to doorstep,<br /><span className="gold-text">in six moves</span></>}
            sub="Every Vendora order runs the same battle-tested circuit our 2.4M merchants use — with AI doing the routing humans used to do by hand."
          />
          <div className="relative mt-14">
            {/* connector line */}
            <div aria-hidden className="absolute left-0 right-0 top-10 hidden border-t-2 border-dashed border-[#e4b45c]/25 lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.09} y={44}>
                  <div className="group relative h-full rounded-2xl border border-white/10 bg-[#121318] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e4b45c]/40 hover:shadow-[0_28px_60px_-28px_rgba(228,180,92,0.35)]">
                    <span className="absolute right-4 top-3 font-display text-4xl font-black text-white/[0.06] transition-colors group-hover:text-[#e4b45c]/25">
                      {step.n}
                    </span>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#e4b45c]/35 bg-[#e4b45c]/10 text-[#e4b45c]">
                      <step.icon size={22} strokeWidth={1.8} />
                      {step.ai && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e4b45c] text-[#0b0c0e]">
                          <Sparkles size={11} strokeWidth={2.6} />
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-[15px] font-bold leading-snug text-[#f4efe6]">{step.title}</h3>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9a978c]">{step.body}</p>
                    {step.ai && (
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#e4b45c]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#f6d68a]">
                        <Sparkles size={9} /> AI automated
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.25em] text-[#5a5850]">
            Orders auto-route to the best supplier by stock, price score & ship-speed — Vendora Flow
          </p>
        </div>
      </section>
    </>
  );
}
