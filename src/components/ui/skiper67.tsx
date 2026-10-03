"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Play } from "lucide-react";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export const Skiper67 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Establish a stable scroll pinned tracking runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 2. Smoothly morph dimensions on scroll (Hardware Accelerated / GPU Optimized)
  // Delays activation to 0.05 so it stays perfectly full-screen upon immediate entry
  const width = useTransform(scrollYProgress, [0.10, 0.50], ["100vw", "85vw"]);
  const height = useTransform(scrollYProgress, [0.10, 0.50], ["100vh", "75vh"]);
  const borderRadius = useTransform(scrollYProgress, [0.10, 0.50], ["0px", "24px"]);

   // 3. Native Low-Level Audio Management (Triggers ONLY when animation is finished)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video) return;

    // AUDIO IS "ON" ONLY AFTER SHRINK ANIMATION COMPLETES (From 0.45 to 0.95 scroll depth)
    if (latest >= 0.45 && latest < 0.95) {
      if (video.paused) {
        video.play().catch(() => {});
      }
      video.muted = false;
      video.volume = 0.8; // High-fidelity production volume active
    } else {
      // Mute instantly during the shrink animation or when scrolled completely away
      video.muted = true;
      // Optional: keep video playing silently, or call video.pause() if you want it stopped
    }
  });

  return (
    /* Tracking Runway Track Wrapper Container */
    <div ref={containerRef} className="relative h-[200vh] w-full bg-black select-none m-0 p-0">
      
      {/* Viewport Frame Canvas (Locks screen down tightly against the top edge) */}
      <div className="sticky top-0 h-screen w-screen overflow-hidden flex items-center justify-center bg-black z-40">
        
        {/* Absolute Viewport Bounds Override Map (Prevents collapsing to 0x0 size) */}
        <motion.div
          style={{ 
            width, 
            height, 
            borderRadius,
            willChange: "width, height, transform, border-radius" 
          }}
          className="relative overflow-hidden border border-neutral-900 bg-neutral-950 shadow-[0_0_60px_rgba(0,0,0,0.95)] transform-gpu"
        >
          {/* Top Interface Overlay Badges Layer */}
          <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-center opacity-90 pointer-events-none">
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-300">
                DIRECTOR'S CUT • 4K MASTER SHOWREEL
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#E50914] font-semibold">
                SCROLL CINEMATIC PIN
              </span>
              <div className="bg-[#E50914]/10 border border-[#E50914]/30 px-2 py-0.5 rounded text-[9px] text-[#E50914] font-bold tracking-wider uppercase">
                AUDIO ON
              </div>
            </div>
          </div>

          {/* Vignette Lighting Shield Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 z-10 pointer-events-none" />

          {/* Underlying High-Performance Cinema Video Asset Element */}
          <video
            ref={videoRef}
            src="https://skiper-ui.com"
            loop
            muted 
            playsInline
            className="w-full h-full object-cover select-none pointer-events-none layout-fill transform-gpu"
          />

          {/* Center Indicator Banner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-neutral-400 bg-black/40 backdrop-blur-sm px-5 py-2.5 rounded-full border border-neutral-800/40">
              <Play className="size-3 fill-neutral-400" /> Keep scrolling to roll reel
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Skiper67;
