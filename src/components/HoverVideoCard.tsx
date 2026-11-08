"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";

// Curated aesthetic looping Pexels MP4 clips by product category for ambient video previews
const PREVIEW_VIDEOS: Record<string, string> = {
  electronics: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-with-green-screen-42998-large.mp4",
  phone: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-with-green-screen-42998-large.mp4",
  audio: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-wearing-headphones-41314-large.mp4",
  kitchen: "https://assets.mixkit.co/videos/preview/mixkit-woman-pouring-tea-into-a-cup-41551-large.mp4",
  dining: "https://assets.mixkit.co/videos/preview/mixkit-woman-pouring-tea-into-a-cup-41551-large.mp4",
  beauty: "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-skincare-cream-on-her-face-41549-large.mp4",
  fitness: "https://assets.mixkit.co/videos/preview/mixkit-athlete-tying-running-shoe-laces-41348-large.mp4",
  pets: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-small-dog-in-the-grass-41484-large.mp4",
  decor: "https://assets.mixkit.co/videos/preview/mixkit-hands-lighting-a-candle-with-a-match-42589-large.mp4",
  default: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-with-green-screen-42998-large.mp4",
};

export function getCategoryVideo(category: string): string {
  const c = category.toLowerCase();
  for (const [key, url] of Object.entries(PREVIEW_VIDEOS)) {
    if (c.includes(key)) return url;
  }
  return PREVIEW_VIDEOS.default;
}

export default function HoverVideoCard({
  slug,
  name,
  image,
  category,
}: {
  slug: string;
  name: string;
  image: string;
  category: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = getCategoryVideo(category);

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered]);

  return (
    <Link
      href={`/product/${slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative block aspect-square overflow-hidden bg-[#1a1b21] group"
    >
      {/* High-res still image */}
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized
        className={`object-cover transition-all duration-700 ease-out ${
          isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
        }`}
      />

      {/* Looping Ambient Micro-Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 pointer-events-none ${
          isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/70 via-transparent to-transparent pointer-events-none" />

      {/* Hover Micro-Badge */}
      <div
        className={`absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/75 border border-white/20 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <Play size={9} fill="currentColor" /> Preview
      </div>
    </Link>
  );
}
