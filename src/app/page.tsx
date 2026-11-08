import Hero from "@/components/Hero";
import Explainer from "@/components/home/Explainer";
import { VideoShowcase, Margins, MarketGrowth, SupplierNetwork } from "@/components/home/Showcase";
import { ShouldYou, ProsCons, Trends, Faq } from "@/components/home/MoreSections";
import EmailCapture from "@/components/EmailCapture";
import { CheckCircle2, Sparkles } from "lucide-react";

const channels = ["Google", "YouTube", "TikTok Shop", "Meta", "Instagram", "Walmart", "Amazon", "Etsy"];

export default function Home() {
  return (
    <>
      <Hero />

      {/* channel marquee */}
      <div className="border-b border-white/10 bg-[#08090b] py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:px-6">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#5a5850]">Inventory syncs in real time · orders flow back from every channel</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 sm:gap-x-12">
            {channels.map((c) => (
              <span key={c} className="font-display text-lg font-black tracking-tight text-[#3d3e46] transition-colors hover:text-[#f4efe6]">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Explainer />
      <VideoShowcase />
      <Margins />
      <MarketGrowth />
      <SupplierNetwork />
      <ShouldYou />
      <ProsCons />
      <Trends />
      <Faq />

      {/* ============ FINAL CTA ============ */}
      <section id="start" className="relative overflow-hidden border-t border-[#e4b45c]/20 bg-[#0b0c0e] py-24">
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[18vw] font-black leading-none text-white/[0.025]">
          DROPSHIP
        </span>
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(228,180,92,0.16)_0%,transparent_65%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e4b45c]/35 bg-[#e4b45c]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#f6d68a]">
            <Sparkles size={12} /> Limited — LAUNCH20, 20% off today
          </span>
          <h2 className="mt-6 font-display text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">
            Start selling
            <br />
            <span className="gold-text">without a warehouse.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#b8b5a9]">
            Join the dropshipping era — free to start, 14-day premium trial, AI on every plan.
            Pick products. We forward orders. Suppliers ship. You get paid.
          </p>
          <div className="mt-8 flex w-full max-w-md justify-center">
            <EmailCapture cta="Start for free" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-[#9a978c]">
            {["No credit card required", "Cancel anytime", "Your brand on every parcel", "AI assistant included"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#7ee2a8]" />{t}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
