"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Box,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import Product3DViewer from "./Product3DViewer";
import { getCategoryVideo } from "./HoverVideoCard";

type MediaViewMode = "photo" | "video" | "vr";

export default function ProductGallery({
  name,
  image,
  category = "Electronics",
  supplier = "Verified Supplier Showroom",
}: {
  name: string;
  image: string;
  category?: string;
  supplier?: string;
}) {
  const [viewMode, setViewMode] = useState<MediaViewMode>("photo");
  const [origin, setOrigin] = useState("50% 50%");
  const [zooming, setZooming] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = getCategoryVideo(category);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Header Mode Indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e4b45c]">
            <Sparkles size={12} />
            {viewMode === "vr"
              ? "360° VR Spatial Tour"
              : viewMode === "video"
              ? "Supplier Showroom Video"
              : "High-Res 4K Macro Photo"}
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:block">
          {supplier}
        </span>
      </div>

      {/* Main Interactive Media Container */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121318] shadow-2xl">
        {/* VIEW 1: High-Res Photo with Hover-to-Zoom */}
        {viewMode === "photo" && (
          <div
            className="relative aspect-square cursor-crosshair overflow-hidden md:aspect-[4/4.6]"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setOrigin(`${x}% ${y}%`);
            }}
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
          >
            <Image
              src={image}
              alt={name}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={{
                transformOrigin: origin,
                transform: zooming ? "scale(1.75)" : "scale(1)",
              }}
            />
            {/* Top Badge */}
            <span className="pointer-events-none absolute left-5 top-5 rounded-full border border-[#e4b45c]/40 bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#f6d68a] backdrop-blur">
              Supplier-verified imagery
            </span>
          </div>
        )}

        {/* VIEW 2: Interactive Product Demonstration / Showroom Video */}
        {viewMode === "video" && (
          <div className="relative aspect-square overflow-hidden bg-black md:aspect-[4/4.6]">
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="h-full w-full object-cover"
              onClick={toggleVideoPlay}
            />

            {/* Video Controls Overlay */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-950/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Showroom Reel
              </span>
            </div>

            <div className="absolute top-5 right-5 flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/90 cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                onClick={toggleVideoPlay}
                className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/90 cursor-pointer"
                title={isVideoPlaying ? "Pause" : "Play"}
              >
                {isVideoPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Interactive 3D / VR Orbit Spatial View */}
        {viewMode === "vr" && (
          <div className="relative aspect-square overflow-hidden bg-[#0d0e12] md:aspect-[4/4.6]">
            <Product3DViewer
              productName={name}
              category={category}
              image={image}
              supplier={supplier}
            />
            {/* VR Badge */}
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-950/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-purple-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                360° VR Spatial Tour
              </span>
            </div>
          </div>
        )}

        {/* BOTTOM RIGHT: Status indicator alongside the floating media bar */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden md:block">
          {viewMode === "photo" && (
            <span className="rounded-lg bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9c5b8] backdrop-blur border border-white/5">
              Hover to zoom
            </span>
          )}
          {viewMode === "video" && (
            <span className="rounded-lg bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#93c5fd] backdrop-blur border border-white/5">
              HD Supplier Stream
            </span>
          )}
          {viewMode === "vr" && (
            <span className="rounded-lg bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c084fc] backdrop-blur border border-white/5">
              Drag to Orbit 360°
            </span>
          )}
        </div>

        {/* FLOATING MEDIA OVERLAY BAR (ALIBABA-STYLE PREVIEW BAR) */}
        {/* Layered at the bottom center alongside the zoom indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-black/65 px-2.5 py-1.5 backdrop-blur-md border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {/* VR Tour Button */}
          <button
            onClick={() => setViewMode("vr")}
            className={`media-btn vr-btn flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === "vr"
                ? "bg-[#e4b45c] text-[#0b0c0e] shadow-md shadow-amber-500/25 scale-105"
                : "bg-white/15 text-white hover:bg-white/30 hover:scale-105"
            }`}
            title="360° VR Tour & 3D Spatial Orbit"
          >
            <span className="text-[11px] font-black tracking-wider">VR</span>
          </button>

          {/* Video Player Button */}
          <button
            onClick={() => setViewMode("video")}
            className={`media-btn video-btn flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === "video"
                ? "bg-[#e4b45c] text-[#0b0c0e] shadow-md shadow-amber-500/25 scale-105"
                : "bg-white/15 text-white hover:bg-white/30 hover:scale-105"
            }`}
            title="Supplier Showroom Video"
          >
            {/* Video Camera SVG */}
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" fill="currentColor" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide">Video</span>
          </button>

          {/* Photos Button */}
          <button
            onClick={() => setViewMode("photo")}
            className={`media-btn photo-btn flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === "photo"
                ? "bg-[#e4b45c] text-[#0b0c0e] shadow-md shadow-amber-500/25 scale-105"
                : "bg-white/15 text-white hover:bg-white/30 hover:scale-105"
            }`}
            title="High-Res Macro Photo Gallery"
          >
            {/* Gallery / Photo SVG */}
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide">Photos</span>
          </button>

          {/* Fullscreen Modal trigger */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition cursor-pointer ml-0.5"
            title="Open Fullscreen Showroom Lightbox"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* FULLSCREEN SHOWROOM LIGHTBOX MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 sm:p-8">
          <div className="relative flex flex-col w-full max-w-5xl h-[85vh] rounded-3xl border border-white/15 bg-[#0e1017] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#141722]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#e4b45c]" />
                <div>
                  <h3 className="font-display font-bold text-white text-sm sm:text-base">
                    {name} — {supplier}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Alibaba Verified Supplier Showroom Inspection
                  </p>
                </div>
              </div>

              {/* View switch inside modal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("vr")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === "vr" ? "bg-[#e4b45c] text-black" : "bg-white/10 text-white"
                  }`}
                >
                  VR 360°
                </button>
                <button
                  onClick={() => setViewMode("video")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === "video" ? "bg-[#e4b45c] text-black" : "bg-white/10 text-white"
                  }`}
                >
                  Video Reel
                </button>
                <button
                  onClick={() => setViewMode("photo")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === "photo" ? "bg-[#e4b45c] text-black" : "bg-white/10 text-white"
                  }`}
                >
                  4K Photo
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition cursor-pointer ml-3"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              {viewMode === "vr" && (
                <div className="w-full h-full">
                  <Product3DViewer
                    productName={name}
                    category={category}
                    image={image}
                    supplier={supplier}
                  />
                </div>
              )}
              {viewMode === "video" && (
                <video
                  src={videoUrl}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                />
              )}
              {viewMode === "photo" && (
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
