"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronDown,
  BadgeCheck,
  Zap,
} from "lucide-react";
import EmailCapture from "@/components/EmailCapture";

const HERO_VIDEO =
  "https://videos.pexels.com/video-files/35907910/15231515_3840_2160_25fps.mp4";
const HERO_POSTER =
  "https://images.pexels.com/videos/35907910/pexels-photo-35907910.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200";

const ticker = [
  "$167B dropshipping market in 2026",
  "18.9% CAGR through 2033",
  "$562B projected by 2033",
  "2.4M+ active dropship stores",
  "500+ supplier apps in the ecosystem",
  "75% of merchants now run AI daily",
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[94svh] flex-col overflow-hidden">
      {/* cinematic background video */}
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07080a]/95 via-[#07080a]/70 to-[#07080a]/15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b0c0e] via-transparent to-[#0b0c0e]/70" />
      {/* film grain scan line */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60">
        <div className="scan-line absolute left-0 h-24 w-full bg-gradient-to-b from-transparent via-[#f6d68a]/10 to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-28 pt-14 sm:px-6 lg:pb-32">
        <div className="max-w-2xl">
          {/* eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4b45c]/40 bg-[#e4b45c]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#f6d68a] backdrop-blur-md">
              <Zap size={11} strokeWidth={2.6} /> AI-powered dropshipping
            </span>
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#c9c5b8] sm:flex">
              <span className="ping-dot h-2 w-2 rounded-full bg-[#7ee2a8]" /> 2,148 orders shipping right now
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12 }}
            className="mt-6 font-display text-[42px] font-black leading-[0.98] tracking-tight text-[#f4efe6] sm:text-6xl lg:text-[76px]"
          >
            The world’s products.
            <br />
            <span className="gold-text">Zero inventory.</span>
            <br />
            One store.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-[#d8d5cb] sm:text-lg"
          >
            Vendora is the dropshipping flagship — a $167B industry, merchandised.
            Vetted suppliers, AI-curated catalog, checkout in under a minute, and every
            order auto-forwarded to the supplier who ships it straight to your door.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/shop"
              className="group flex items-center gap-2 rounded-2xl bg-[#e4b45c] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#0b0c0e] transition hover:bg-[#f6d68a]"
            >
              Shop the catalog
              <ArrowRight size={18} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
            <Link
              href="#how"
              className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#f4efe6] backdrop-blur-md transition hover:border-[#e4b45c]/60 hover:text-[#f6d68a]"
            >
              How it works
            </Link>
          </motion.div>

          {/* email capture */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.46 }}
            className="mt-6"
          >
            <EmailCapture cta="Start for free" />
          </motion.div>

          {/* social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-5 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {["AK", "MR", "JS", "TW", "+"].map((i, idx) => (
                <span
                  key={idx}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0b0c0e] bg-gradient-to-br from-[#2a2b33] to-[#17181d] text-[9px] font-black text-[#f6d68a]"
                >
                  {i}
                </span>
              ))}
            </div>
            <div className="text-xs leading-tight text-[#9a978c]">
              <span className="flex items-center gap-1 font-bold text-[#f4efe6]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="#e4b45c" className="text-[#e4b45c]" />
                ))}
                <b className="ml-1">4.9/5</b>
              </span>
              82,400 merchants · 31M orders fulfilled
            </div>
          </motion.div>
        </div>

        {/* floating live-commerce cards (desktop) */}
        <div className="pointer-events-none absolute right-10 top-24 hidden w-[340px] xl:block">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="float-y glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee2a8]">
                <CheckCircle2 size={14} /> Auto-forwarded
              </span>
              <span className="text-[10px] font-bold text-[#9a978c]">just now</span>
            </div>
            <p className="mt-2 text-sm font-bold text-[#f4efe6]">Order VND-2916 → CloudRest Home (US)</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#9a978c]">
              <span>AI matched supplier in <b className="text-[#f6d68a]">2.3s</b></span>
              <span>Margin kept <b className="text-[#f6d68a]">52%</b></span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-[#7ee2a8] to-[#e4b45c]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.88 }}
            className="float-y-late glass ml-10 mt-4 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d68a]">
                <Sparkles size={13} /> Vendora AI insight
              </span>
              <TrendingUp size={14} className="text-[#7ee2a8]" />
            </div>
            <p className="mt-2 text-[13px] leading-snug text-[#e8e4d8]">
              “PawHaven Reflective Collar” demand <b className="text-[#7ee2a8]">+38% WoW</b>. Stock is synced — 1,500 units across 2 US suppliers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 1.05 }}
            className="glass float-y mr-6 mt-4 rounded-2xl p-4"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-[#e4b45c]" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#f4efe6]">Seller of record</p>
                  <p className="text-[10px] text-[#9a978c]">Your brand on every slip & invoice</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#dropshipping"
        className="absolute bottom-14 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9c5b8] transition hover:text-[#f6d68a] md:flex"
      >
        Scroll the story
        <ChevronDown size={16} className="animate-bounce" />
      </a>

      {/* industry ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="overflow-hidden py-2.5">
          <div className="marquee-track flex whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.24em] text-[#c9c5b8]">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="mx-8 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#e4b45c]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
