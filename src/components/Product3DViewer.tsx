"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Box,
  Layers,
  Palette,
  Check,
  Eye,
  Play,
  Pause,
  Compass,
  ZoomIn,
  ZoomOut,
  Sun,
  ShieldCheck,
  Info,
} from "lucide-react";

type LightingPreset = "studio" | "warm" | "daylight";

// High-precision isolated transparent cutouts (background removed) for catalog products
const CATALOG_CUTOUTS: Record<string, string> = {
  "glowroot": "/products/cutouts/glowroot-cutout.png",
  "serum": "/products/cutouts/glowroot-cutout.png",
  "aurora": "/products/cutouts/headphones-cutout.png",
  "headphones": "/products/cutouts/headphones-cutout.png",
  "pulsefit": "/products/cutouts/watch-cutout.png",
  "watch": "/products/cutouts/watch-cutout.png",
  "lumeoak": "/products/cutouts/lamp-cutout.png",
  "lamp": "/products/cutouts/lamp-cutout.png",
  "terra": "/products/cutouts/vase-cutout.png",
  "vase": "/products/cutouts/vase-cutout.png",
  "droplet": "/products/cutouts/drops-cutout.png",
  "candle": "/products/cutouts/candle-cutout.png",
};

function resolveCutout(name: string, img: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, path] of Object.entries(CATALOG_CUTOUTS)) {
    if (lowerName.includes(key)) return path;
  }
  return img;
}

export default function Product3DViewer({
  productName,
  category = "Electronics",
  image = "https://images.pexels.com/photos/39392892/pexels-photo-39392892.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  supplier = "Verified Supplier Showroom",
  cutoutImage,
}: {
  productName: string;
  category?: string;
  image?: string;
  supplier?: string;
  cutoutImage?: string;
}) {
  const activeCutout = cutoutImage || resolveCutout(productName, image);
  const isTransparentCutout = activeCutout.endsWith(".png") && activeCutout.includes("cutouts");
  const [rotationY, setRotationY] = useState(15);
  const [rotationX, setRotationX] = useState(5);
  const [zoom, setZoom] = useState(1);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lighting, setLighting] = useState<LightingPreset>("warm");
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startRotY: number; startRotX: number }>({
    x: 0,
    y: 0,
    startRotY: 0,
    startRotX: 0,
  });

  // Auto-spin animation loop
  useEffect(() => {
    if (!isAutoSpinning || isDragging) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.4) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, [isAutoSpinning, isDragging]);

  // Pointer drag event handlers for full 360 orbit
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startRotY: rotationY,
      startRotX: rotationX,
    };
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const newRotY = (dragStartRef.current.startRotY + deltaX * 0.6) % 360;
      const newRotX = Math.max(-25, Math.min(25, dragStartRef.current.startRotX - deltaY * 0.4));

      setRotationY(newRotY);
      setRotationX(newRotX);
    },
    [isDragging]
  );

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  // Reset to front view
  const resetView = () => {
    setRotationY(0);
    setRotationX(0);
    setZoom(1);
    setIsAutoSpinning(true);
  };

  // Calculate dynamic lighting position based on rotation angle
  const lightAngleRad = (rotationY * Math.PI) / 180;
  const glareX = 50 + Math.sin(lightAngleRad) * 45;
  const glareY = 45 - Math.cos(lightAngleRad) * 20;

  // Lighting atmosphere styles
  const getLightingGlow = () => {
    switch (lighting) {
      case "warm":
        return "radial-gradient(circle at 50% 30%, rgba(228, 180, 92, 0.18) 0%, rgba(18, 19, 24, 0.95) 75%)";
      case "daylight":
        return "radial-gradient(circle at 50% 30%, rgba(147, 197, 253, 0.15) 0%, rgba(18, 19, 24, 0.95) 75%)";
      case "studio":
      default:
        return "radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.12) 0%, rgba(18, 19, 24, 0.95) 75%)";
    }
  };

  const normalizedAngle = Math.round(((rotationY % 360) + 360) % 360);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f15] shadow-2xl select-none">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#12141c]/90 px-4 py-3 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e4b45c]/20 text-[#e4b45c]">
            <Compass size={14} className={isAutoSpinning ? "animate-spin" : ""} />
          </span>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              360° VR Spatial Tour
            </span>
            <span className="ml-2 font-mono text-[10px] text-[#e4b45c]">
              {normalizedAngle}°
            </span>
          </div>
        </div>

        {/* Toolbar: Auto-spin, Reset, Hotspots, Lighting */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoSpinning(!isAutoSpinning)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              isAutoSpinning
                ? "bg-[#e4b45c] text-[#0b0c0e]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
            title={isAutoSpinning ? "Pause Auto-Spin" : "Start 360° Auto-Spin"}
          >
            {isAutoSpinning ? <Pause size={11} /> : <Play size={11} />}
            <span className="hidden sm:inline">{isAutoSpinning ? "Spinning" : "Auto-Spin"}</span>
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              showHotspots
                ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
            title="Toggle Feature Hotspots"
          >
            <Info size={11} />
            <span className="hidden sm:inline">Hotspots</span>
          </button>

          <button
            onClick={resetView}
            className="rounded-lg bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
            title="Reset Angle to Front"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 3D Interactive Stage Area */}
      <div
        ref={containerRef}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        style={{
          background: getLightingGlow(),
          perspective: "1200px",
        }}
        className="relative flex items-center justify-center h-[360px] sm:h-[440px] w-full overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* Dynamic Studio Ambient Lighting Glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`,
          }}
        />

        {/* 3D Showroom Platform / Pedestal */}
        <div
          className="pointer-events-none absolute bottom-8 h-24 w-72 rounded-full blur-xl opacity-60 transition-transform duration-300"
          style={{
            background:
              lighting === "warm"
                ? "radial-gradient(ellipse, rgba(228, 180, 92, 0.4) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(255, 255, 255, 0.25) 0%, transparent 70%)",
            transform: `scale(${1 + Math.abs(rotationX) * 0.02})`,
          }}
        />

        {/* 3D ROTATABLE PRODUCT CONTAINER (REAL PRODUCT IMAGE) */}
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${-rotationX}deg) rotateY(${rotationY}deg) scale(${zoom})`,
          }}
        >
          {/* Transparent Cutout Isolated Product View (No Background Card) */}
          {isTransparentCutout ? (
            <div className="relative h-[290px] w-[290px] sm:h-[360px] sm:w-[360px] flex items-center justify-center">
              <div className="relative h-full w-full filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)]">
                <Image
                  src={activeCutout}
                  alt={productName}
                  fill
                  priority
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 768px) 300px, 400px"
                />

                {/* Dynamic Specular Sheen across transparent cutout */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-color-dodge transition-transform duration-100"
                  style={{
                    background: `linear-gradient(${normalizedAngle + 45}deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)`,
                  }}
                />
              </div>

              {/* Interactive Feature Hotspots on Cutout */}
              {showHotspots && (
                <>
                  <div
                    className="absolute top-[28%] left-[25%] z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(activeHotspot === "quality" ? null : "quality");
                    }}
                  >
                    <button
                      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#e4b45c] text-black shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      title="Inspection Note"
                    >
                      <span className="absolute -inset-1 rounded-full bg-[#e4b45c]/40 animate-ping" />
                      <Sparkles size={11} strokeWidth={3} />
                    </button>
                    {activeHotspot === "quality" && (
                      <div className="absolute left-7 top-0 w-44 rounded-xl border border-white/20 bg-black/90 p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-[#f6d68a]">Verified Formula Spec</p>
                        <p className="mt-0.5 text-slate-300">
                          100% authentic batch inspection passed with 4.8★ supplier certification.
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute bottom-[28%] right-[25%] z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(activeHotspot === "packaging" ? null : "packaging");
                    }}
                  >
                    <button
                      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-400 text-black shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      title="Packaging Note"
                    >
                      <span className="absolute -inset-1 rounded-full bg-blue-400/40 animate-ping" />
                      <ShieldCheck size={12} strokeWidth={3} />
                    </button>
                    {activeHotspot === "packaging" && (
                      <div className="absolute right-7 bottom-0 w-44 rounded-xl border border-white/20 bg-black/90 p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-blue-300">Blind Dropship Verified</p>
                        <p className="mt-0.5 text-slate-300">
                          Custom branded unboxing packaging without supplier markings.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Fallback Card if no transparent cutout is available yet */
            <div className="relative h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] rounded-2xl overflow-hidden border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-[#171a23]">
              <Image
                src={image}
                alt={productName}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 300px, 400px"
              />

              {/* Dynamic Glass Reflection Sheen */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay transition-transform duration-100"
                style={{
                  background: `linear-gradient(${normalizedAngle + 45}deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)`,
                }}
              />

              {/* Realistic Rim Shadow */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />

              {/* Interactive Feature Hotspots */}
              {showHotspots && (
                <>
                  <div
                    className="absolute top-[28%] left-[28%] z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(activeHotspot === "quality" ? null : "quality");
                    }}
                  >
                    <button
                      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#e4b45c] text-black shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      title="Inspection Note"
                    >
                      <span className="absolute -inset-1 rounded-full bg-[#e4b45c]/40 animate-ping" />
                      <Sparkles size={11} strokeWidth={3} />
                    </button>
                    {activeHotspot === "quality" && (
                      <div className="absolute left-7 top-0 w-44 rounded-xl border border-white/20 bg-black/90 p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-[#f6d68a]">Verified Material Spec</p>
                        <p className="mt-0.5 text-slate-300">
                          100% authentic batch inspection passed with 4.8★ supplier certification.
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute bottom-[30%] right-[32%] z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(activeHotspot === "packaging" ? null : "packaging");
                    }}
                  >
                    <button
                      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-400 text-black shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      title="Packaging Note"
                    >
                      <span className="absolute -inset-1 rounded-full bg-blue-400/40 animate-ping" />
                      <ShieldCheck size={12} strokeWidth={3} />
                    </button>
                    {activeHotspot === "packaging" && (
                      <div className="absolute right-7 bottom-0 w-44 rounded-xl border border-white/20 bg-black/90 p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-blue-300">Blind Dropship Verified</p>
                        <p className="mt-0.5 text-slate-300">
                          Custom branded unboxing packaging without supplier markings.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Orbit Drag Helper Badge */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 text-[10px] font-semibold text-slate-200 backdrop-blur-md border border-white/10 shadow-lg">
          <RotateCcw size={12} className="text-[#e4b45c]" />
          <span>Click &amp; drag to inspect 360&deg;</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-xl bg-black/75 p-1 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <span className="font-mono text-[9px] text-slate-400 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.85, z - 0.15))}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
        </div>
      </div>

      {/* Bottom Showroom Environment Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-[#12141c]/80 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sun size={13} className="text-[#e4b45c]" />
          <span className="text-[11px]">Showroom Lighting:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: "warm" as const, label: "Studio Warm", bg: "from-amber-500/20 to-amber-700/20" },
            { id: "daylight" as const, label: "Daylight 5000K", bg: "from-blue-500/20 to-blue-700/20" },
            { id: "studio" as const, label: "Neutral Studio", bg: "from-slate-500/20 to-slate-700/20" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setLighting(preset.id)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                lighting === preset.id
                  ? "bg-[#e4b45c] text-[#0b0c0e] font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
