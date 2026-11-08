"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Sparkles,
  LayoutDashboard,
  PackageSearch,
  Compass,
  Menu,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/cart";

const marqueeItems = [
  "LAUNCH20 — 20% off your first order",
  "Free shipping over $75",
  "Supplier-direct fulfillment · you never touch a warehouse",
  "30-day no-questions returns",
  "$167B industry · 18.9% CAGR through 2033",
];

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Sourcing Radar", href: "/admin/sourcing" },
  { label: "How it works", href: "/#how" },
  { label: "Suppliers", href: "/#suppliers" },
  { label: "Margins", href: "/#margins" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);

  const askAi = () => {
    window.dispatchEvent(new CustomEvent("vendora:open-ai"));
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40">
      {/* announcement marquee */}
      <div className="overflow-hidden border-b border-[#e4b45c]/20 bg-[#0b0c0e] py-1.5">
        <div className="marquee-track flex whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e4b45c]">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-6 flex items-center gap-2">
              <Sparkles size={10} strokeWidth={2.5} /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-white/10 bg-[#0b0c0e]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-[#f4efe6] transition hover:bg-white/5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="group flex items-center gap-2.5">
              <svg width="34" height="34" viewBox="0 0 64 64" className="transition-transform duration-500 group-hover:rotate-[30deg]" aria-hidden>
                <path d="M32 4 58 20v24L32 60 6 44V20L32 4z" fill="#121318" stroke="#e4b45c" strokeWidth="4.5" strokeLinejoin="round" />
                <path d="M21 24l11 17 11-17" fill="none" stroke="#f6d68a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="leading-none">
                <span className="block font-display text-[22px] font-black tracking-tight text-[#f4efe6]">
                  VENDORA
                </span>
                <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9a978c] sm:block">
                  Every product. Zero inventory.
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-semibold text-[#c9c5b8] transition hover:text-[#f6d68a]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/track"
              className="hidden rounded-xl p-2.5 text-[#c9c5b8] transition hover:bg-white/5 hover:text-white sm:block"
              title="Track order"
              aria-label="Track order"
            >
              <PackageSearch size={19} />
            </Link>
            <button
              onClick={askAi}
              className="hidden items-center gap-2 rounded-xl border border-[#e4b45c]/40 bg-[#e4b45c]/10 px-3 py-2 text-[12px] font-bold text-[#f6d68a] transition hover:border-[#e4b45c] hover:bg-[#e4b45c]/20 md:flex"
            >
              <Sparkles size={15} /> Vendora AI
            </button>
            <Link
              href="/admin/sourcing"
              className="hidden rounded-xl p-2.5 text-[#e4b45c] transition hover:bg-white/5 hover:text-[#f6d68a] sm:block"
              title="Autonomous Sourcing Radar & Alibaba Studio"
              aria-label="Autonomous Sourcing Radar"
            >
              <Compass size={19} />
            </Link>
            <Link
              href="/admin"
              className="hidden rounded-xl p-2.5 text-[#c9c5b8] transition hover:bg-white/5 hover:text-white sm:block"
              title="Merchant dashboard"
              aria-label="Merchant dashboard"
            >
              <LayoutDashboard size={19} />
            </Link>
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-xl bg-[#e4b45c] px-3 py-2 text-[12px] font-black uppercase tracking-wide text-[#0b0c0e] transition hover:bg-[#f6d68a] sm:px-4"
              aria-label="Open cart"
            >
              <ShoppingBag size={17} strokeWidth={2.4} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#0b0c0e] bg-[#f4efe6] px-1 text-[10px] font-black text-[#0b0c0e]">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* mobile panel */}
        {open && (
          <div className="border-t border-white/10 bg-[#0b0c0e] px-4 pb-5 pt-2 lg:hidden">
            <nav className="grid gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-[#f4efe6] transition hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#9a978c]">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 p-3"><Truck size={16} className="text-[#e4b45c]" /> 2–15 day ship</div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 p-3"><RotateCcw size={16} className="text-[#e4b45c]" /> 30-day returns</div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 p-3"><ShieldCheck size={16} className="text-[#e4b45c]" /> Buyer protection</div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
