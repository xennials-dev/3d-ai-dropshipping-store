"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- Reveal on scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated number (count-up on view) ---------- */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(2, -10 * t);
      setDisplay(value * (t === 1 ? 1 : eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "mx-auto text-center items-center" : "items-start text-left";
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignCls}`}>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#e4b45c]/30 bg-[#e4b45c]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#e4b45c]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#e4b45c]" />
        {eyebrow}
      </span>
      <h2 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-[#f4efe6] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {sub && <p className="max-w-2xl text-base leading-relaxed text-[#9a978c]">{sub}</p>}
    </div>
  );
}

/* ---------- Horizontal infographic bar ---------- */
export function MeterBar({
  label,
  note,
  pct,
  tone = "gold",
  delay = 0,
}: {
  label: string;
  note?: string;
  pct: number;
  tone?: "gold" | "green" | "red" | "grey";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const gradient =
    tone === "gold"
      ? "from-[#f6d68a] via-[#e4b45c] to-[#9a6b25]"
      : tone === "green"
        ? "from-[#b8f4cd] via-[#5fd98d] to-[#1f7a45]"
        : tone === "red"
          ? "from-[#ffb3a1] via-[#f0715c] to-[#8a2e1f]"
          : "from-[#d8d5cb] via-[#a8a59a] to-[#5a5850]";
  return (
    <div ref={ref} className="w-full">
      <div className="mb-1.5 flex items-end justify-between gap-4">
        <span className="text-sm font-semibold text-[#f4efe6]">{label}</span>
        <span className="text-xs font-bold tabular-nums text-[#e4b45c]">{note}</span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-[width] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]`}
          style={{ width: inView ? `${pct}%` : "2%", transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
