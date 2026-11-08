"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Sliders, ArrowLeftRight } from "lucide-react";

export type BeforeAfterProps = {
  title?: string;
  subtitle?: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export default function BeforeAfterSlider({
  title = "Instant Transformation",
  subtitle = "Drag the slider to compare traditional store alternatives against Vendora factory-direct precision.",
  beforeImage,
  afterImage,
  beforeLabel = "Standard Alternative",
  afterLabel = "Vendora Direct",
}: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="relative my-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f15] p-6 shadow-2xl">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e4b45c]/20 text-[#e4b45c]">
              <Sparkles size={14} />
            </span>
            <h3 className="text-base font-black uppercase tracking-wider text-white">
              {title}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <ArrowLeftRight size={13} className="text-[#e4b45c]" />
          <span>Slide to Compare</span>
        </div>
      </div>

      {/* Comparison Canvas */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative h-[320px] sm:h-[420px] w-full select-none overflow-hidden rounded-2xl cursor-ew-resize"
      >
        {/* After Image (Full width background) */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            {afterLabel}
          </span>
        </div>

        {/* Before Image (Clipped overlay) */}
        <div
          className="absolute inset-0 h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="relative h-full w-full" style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}>
            <Image
              src={beforeImage}
              alt={beforeLabel}
              fill
              unoptimized
              className="object-cover filter contrast-75 brightness-75"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className="absolute left-4 top-4 rounded-full bg-black/80 border border-white/20 text-slate-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#e4b45c] text-[#0b0c0e] shadow-xl border-2 border-white">
            <ArrowLeftRight size={16} strokeWidth={2.8} />
          </div>
        </div>
      </div>
    </div>
  );
}
