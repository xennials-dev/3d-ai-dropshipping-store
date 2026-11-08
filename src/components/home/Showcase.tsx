"use client";

import { useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  BadgeCheck,
  Flag,
  CircleCheck,
  CircleAlert,
  TrendingDown,
  Rocket,
  Truck,
  Info,
  Check,
  Sparkles,
} from "lucide-react";
import { Reveal, SectionHead, MeterBar, AnimatedNumber } from "@/components/fx";

/* ================= MP4 SHOWCASE ================= */
type VideoCardProps = {
  src: string;
  thumb: string;
  title: string;
  caption: string;
  tag: string;
  length: string;
};

function VideoCard({ src, thumb, title, caption, tag, length }: VideoCardProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.muted = muted;
      void v.play();
      setPlaying(true);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121318] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="relative aspect-video cursor-pointer overflow-hidden" onClick={toggle} role="button" aria-label={`Play video: ${title}`}>
        <video
          ref={ref}
          src={src}
          poster={thumb}
          muted={muted}
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/25 to-transparent transition-opacity duration-500 ${playing ? "opacity-40" : "opacity-80"}`} />
        {/* center play button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${playing ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#f6d68a]/60 bg-black/55 backdrop-blur-md transition group-hover:scale-110">
            <Play size={24} fill="#f6d68a" className="ml-1 text-[#f6d68a]" />
          </div>
        </div>
        {/* chips */}
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#f6d68a] backdrop-blur">
          {tag}
        </span>
        <span className="absolute right-4 top-4 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] font-bold text-[#f4efe6]">
          {length}
        </span>
        {/* playing controls */}
        {playing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const v = ref.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(!muted);
            }}
            className="absolute bottom-4 right-4 rounded-lg bg-black/60 p-2 text-[#f4efe6] backdrop-blur transition hover:bg-black/80"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className="absolute bottom-4 left-4 rounded-lg bg-black/60 p-2 text-[#f4efe6] backdrop-blur opacity-0 transition group-hover:opacity-100"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
      <div className="border-t border-white/10 p-5">
        <h3 className="font-display text-lg font-bold text-[#f4efe6]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#9a978c]">{caption}</p>
      </div>
    </div>
  );
}

export function VideoShowcase() {
  const videos = [
    {
      src: "https://videos.pexels.com/video-files/6169422/6169422-uhd_3840_2160_25fps.mp4",
      thumb: "https://images.pexels.com/videos/6169422/pexels-photo-6169422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
      tag: "Fulfillment",
      length: "0:29",
      title: "Inside the warehouse your customer never sees",
      caption: "A partner fulfillment center in Shenzhen picks, QC-checks and seals a Vendora order — under your brand’s packing slip, in the time it takes to make coffee.",
    },
    {
      src: "https://videos.pexels.com/video-files/10391545/10391545-hd_3840_2160_24fps.mp4",
      thumb: "https://images.pexels.com/videos/10391545/pexels-photo-10391545.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
      tag: "Freight",
      length: "0:31",
      title: "From container port to your customer’s porch",
      caption: "Trans-Pacific lanes move 2,148 Vendora packages a day. Consolidation, customs HS codes and last-mile handoff — orchestrated, tracked, insured.",
    },
    {
      src: "https://videos.pexels.com/video-files/7018667/7018667-uhd_4096_2160_25fps.mp4",
      thumb: "https://images.pexels.com/videos/7018667/aisle-cardboboard-box-commercial-building-concentration-7018667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
      tag: "Quality control",
      length: "0:16",
      title: "Every unit scanned before it ships",
      caption: "Suppliers verify stock and scan barcodes at pack-out. Out-of-stock SKUs auto-hide from your storefront via Vendora Flow — no overselling, ever.",
    },
  ];
  return (
    <section id="videos" className="border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="The receipts · 4K footage"
          title={<>Watch the machine<br /><span className="gold-text">actually run</span></>}
          sub="Not stock fantasy — real fulfillment footage from the supplier network behind Vendora. Press play."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.src} {...v} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= MARGINS INFOGRAPHIC ================= */
export function Margins() {
  return (
    <section id="margins" className="border-b border-white/5 bg-[#08090b] py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">The margin math</span>
          <h2 className="mt-3 font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
            What a sale
            <br />
            <span className="gold-text">actually pays.</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-[#b8b5a9]">
            Trueprofit’s 2026 analysis pegs dropshipping net margins at{" "}
            <strong className="text-[#f6d68a]">15–25% on average</strong>, while Shopify Collective
            retailers typically run <strong className="text-[#f6d68a]">20–50%</strong> — and TikTok
            organic operators report <strong className="text-[#f6d68a]">40–60%</strong>.
          </p>

          <div className="mt-8 rounded-2xl border border-[#f0715c]/25 bg-[#f0715c]/5 p-5">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#f0a08f]">
              <Truck size={14} /> The delivery expectation trap
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#d8d5cb]">
              AlixPartners’ 2026 study: shoppers now expect <strong>free shipping and arrival in under 3 days</strong>.
              Cross-border lanes run 7–15 days — so Vendora weights domestic US/EU suppliers when you enable
              “Fast-Ship only” in the catalog.
            </p>
          </div>

          {/* unit economics card */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#121318]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-2.5">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9a978c]">Unit economics · Aurora X9</span>
              <span className="rounded-full bg-[#7ee2a8]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#7ee2a8]">Healthy</span>
            </div>
            <div className="px-5 py-4 font-mono text-[11.5px]">
              {[
                ["Retail price", "$89.99", "text-[#f4efe6]"],
                ["Supplier cost (Shenzhen AudioTech)", "−$43.20", "text-[#c9c5b8]"],
                ["Payment + platform fees", "−$4.48", "text-[#c9c5b8]"],
                ["Vendora AI fulfillment", "$0.00", "text-[#7ee2a8]"],
              ].map(([k, v, c]) => (
                <div key={k as string} className="flex items-baseline justify-between gap-4 border-b border-dashed border-white/10 py-1.5 last:border-0">
                  <span className="text-[#9a978c]">{k}</span>
                  <span className={`tabular-nums ${c}`}>{v}</span>
                </div>
              ))}
              <div className="mt-2 flex items-baseline justify-between border-t border-[#e4b45c]/30 pt-2">
                <span className="font-sans font-bold text-[#f6d68a]">You keep</span>
                <span className="font-display text-lg font-black tabular-nums text-[#f6d68a]">$42.31 · 47%</span>
              </div>
            </div>
          </div>
        </div>

        {/* bars */}
        <div className="rounded-3xl border border-white/10 bg-[#121318] p-7 sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Net margin by channel · 2026</p>
          <div className="mt-6 space-y-6">
            <MeterBar label="TikTok Shop — organic" note="40–60%" pct={55} tone="green" />
            <MeterBar label="Shopify Collective retailers" note="20–50%" pct={38} tone="gold" delay={120} />
            <MeterBar label="Print-on-demand (private label)" note="20–40%" pct={31} tone="gold" delay={220} />
            <MeterBar label="Cross-border dropship average" note="15–25%" pct={22} tone="grey" delay={320} />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-center">
            <div>
              <p className="font-display text-3xl font-black text-[#f4efe6]"><AnimatedNumber value={47} suffix="%" /></p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#9a978c]">avg. margin on Vendora bestsellers</p>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-[#f4efe6]"><AnimatedNumber value={2.4} suffix="×" decimals={1} /></p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#9a978c]">AOV lift when bundling accessories</p>
            </div>
          </div>
          <p className="mt-5 flex items-start gap-1.5 text-[10px] leading-snug text-[#5a5850]">
            <Info size={12} className="mt-0.5 shrink-0" /> Sources: Trueprofit 2026 margin analysis; Shopify Collective typical retailer ranges; Kamil Sattar (“The Ecom King”) on TikTok organic economics, via Shopify Masters.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================= MARKET GROWTH CHART ================= */
const growth = [
  { year: "2021", v: 96 },
  { year: "2022", v: 112 },
  { year: "2023", v: 128 },
  { year: "2024", v: 143 },
  { year: "2025", v: 155 },
  { year: "2026", v: 167, hot: true },
  { year: "2029", v: 262 },
  { year: "2033", v: 562, projected: true },
];

export function MarketGrowth() {
  const max = 562;
  return (
    <section id="market" className="border-b border-white/5 bg-[#0b0c0e] py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">The size of the prize</span>
          <p className="mt-6 font-display text-[88px] font-black leading-none tracking-tight text-[#f4efe6] sm:text-[120px]">
            <AnimatedNumber value={167} prefix="$" suffix="B" />
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-[#9a978c]">dropshipping market · 2026</p>
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-[#b8b5a9]">
            <p>
              From <strong className="text-[#f4efe6]">$96B in 2021</strong> to an expected{" "}
              <strong className="text-[#f6d68a]">$562B by 2033</strong> — a{" "}
              <strong className="text-[#f6d68a]">18.9% CAGR</strong>, compounding through platform
              shifts, AI tooling and the print-on-demand wave.
            </p>
            <p>
              Winners in 2027 won’t out-spend; they’ll <strong className="text-[#f4efe6]">out-execute</strong> —
              faster supplier matching, sharper unit economics, cleaner buyer experience. That’s the
              Vendora thesis.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e4b45c]/25 bg-[#e4b45c]/5 px-4 py-3 text-xs text-[#f6d68a]">
            <Rocket size={16} className="shrink-0" />
            Merchants who automate order-routing scale ~3× faster than manual-dispatch stores (Shopify merchant survey, Nov 2025).
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-[#121318] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Market size · $B · 2021 → 2033</p>
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5a5850]"><TrendingDown size={11} className="rotate-180" /> 18.9% CAGR</span>
            </div>
            <div className="mt-6 flex h-64 items-end gap-2 sm:gap-3">
              {growth.map((g) => {
                const hot = g.hot;
                const proj = g.projected;
                return (
                  <div key={g.year} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className={`font-display text-[10px] font-black tabular-nums sm:text-xs ${hot || proj ? "text-[#f6d68a]" : "text-[#75726a] opacity-0 transition group-hover:opacity-100"}`}>
                      ${g.v}B
                    </span>
                    <div
                      title={`${g.year}: $${g.v}B`}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        hot
                          ? "bg-gradient-to-t from-[#9a6b25] via-[#e4b45c] to-[#f6d68a]"
                          : proj
                            ? "border border-dashed border-[#e4b45c]/60 bg-[#e4b45c]/15"
                            : "bg-white/10 group-hover:bg-[#e4b45c]/40"
                      }`}
                      style={{ height: `${(g.v / max) * 78 + 4}%` }}
                    />
                    <span className={`text-[8px] font-bold uppercase tracking-wider sm:text-[10px] ${hot ? "text-[#f6d68a]" : "text-[#75726a]"}`}>
                      {g.year}{hot ? " · now" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-white/10 pt-3 text-[9.5px] leading-snug text-[#5a5850]">
              Projection: 2027–2033 at the reported 18.9% CAGR. Historical figures per Shopify industry reporting; $562B by 2033 estimate. Illustrative for planning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= SUPPLIER NETWORK ================= */
const suppliers = [
  { mark: "SC", name: "Shopify Collective", region: "North America + Global", rating: 4.9, ships: "2–7 days", bestFor: "Bundling vetted Shopify brands into your catalog", tag: "Auto-routes orders", ai: true },
  { mark: "DC", name: "DropCommerce", region: "US & Canada", rating: 4.8, ships: "2–7 days", bestFor: "Fast domestic promises, two-to-seven-day delivery", tag: "US / CA lanes", ai: false },
  { mark: "SY", name: "Syncee", region: "US · UK · EU · global", rating: 4.6, ships: "4–12 days", bestFor: "12,000+ brands — the deepest catalog in the game", tag: "12k+ brands", ai: false },
  { mark: "DS", name: "DSers", region: "AliExpress network", rating: 4.4, ships: "7–15 days", bestFor: "Lowest landed cost + side-by-side supplier comparison", tag: "Price discovery", ai: false },
  { mark: "AD", name: "AI Dropship", region: "US & EU", rating: 4.7, ships: "< 7 days most lanes", bestFor: "AI-matched US/EU suppliers on the fastest lanes", tag: "AI-matched", ai: true },
];

export function SupplierNetwork() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ "Shopify Collective": true });
  return (
    <section id="suppliers" className="border-b border-white/5 bg-[#08090b] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Who ships for you"
          title={<>The supplier network<br /><span className="gold-text">behind the curtain</span></>}
          sub="Vendora ships through the same vetted ecosystems the best shops use. Connect once — orders, tracking and payouts flow automatically."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {suppliers.map((s) => {
            const isOn = connected[s.name];
            return (
              <div key={s.name} className="group flex flex-col rounded-2xl border border-white/10 bg-[#121318] p-5 transition hover:border-[#e4b45c]/35">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e4b45c]/35 bg-[#e4b45c]/10 font-display text-base font-black text-[#f6d68a]">
                    {s.mark}
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#9a978c]">
                    {s.ai && <Sparkles size={9} className="text-[#e4b45c]" />}{s.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold leading-tight text-[#f4efe6]">{s.name}</h3>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#75726a]">{s.region}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-[#c9c5b8]">
                  <span className="flex items-center gap-1 font-bold text-[#f6d68a]"><Star size={12} fill="#e4b45c" className="text-[#e4b45c]" />{s.rating}</span>
                  <span className="text-[#5a5850]">•</span> ships {s.ships}
                </div>
                <p className="mt-3 flex-1 text-[11.5px] leading-snug text-[#9a978c]">{s.bestFor}</p>
                <button
                  onClick={() => setConnected((c) => ({ ...c, [s.name]: !c[s.name] }))}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                    isOn
                      ? "border border-[#7ee2a8]/40 bg-[#7ee2a8]/10 text-[#7ee2a8]"
                      : "bg-[#e4b45c] text-[#0b0c0e] hover:bg-[#f6d68a]"
                  }`}
                >
                  {isOn ? (<><Check size={13} strokeWidth={3} /> Connected</>) : "Connect"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#7ee2a8]/20 bg-[#7ee2a8]/5 p-6">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#7ee2a8]"><Flag size={13} /> Green flags we require</p>
            <ul className="mt-3 grid gap-2 text-[12px] text-[#c9c5b8] sm:grid-cols-2">
              {["5+ years operating history", "Branded invoicing on request", "Sample program ($50–$100)", "Real-time stock-level sync", "Sub-7-day delivery options", "Documented return policy"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CircleCheck size={14} className="mt-0.5 shrink-0 text-[#7ee2a8]" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#f0715c]/20 bg-[#f0715c]/5 p-6">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#f0a08f]"><CircleAlert size={13} /> Red flags we reject</p>
            <ul className="mt-3 grid gap-2 text-[12px] text-[#c9c5b8] sm:grid-cols-2">
              {["Too-good-to-be-true pricing", "No reviews from other retailers", "Newer than 1 year, no track record", "No samples, ever", "Silent on return responsibility", "Supplier-branded packaging on Amazon-bound orders"].map((t) => (
                <li key={t} className="flex items-start gap-2"><BadgeCheck size={14} className="mt-0.5 shrink-0 rotate-45 text-[#f0715c]" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5a5850]">500+ vetted apps &amp; suppliers plugged into the Vendora network</p>
      </div>
    </section>
  );
}
