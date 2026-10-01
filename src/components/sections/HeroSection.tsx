"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, Film } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

export default function HeroSection() {
  const { playHoverSound, playShutterSound } = useSound();

  // Outer container reference for sticky scroll pinning (150vh height)
  const containerRef = useRef<HTMLElement>(null);

  // Track scroll progress of the hero section relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth scrub scroll progress with spring inertia
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.8,
    restDelta: 0.001,
  });

  // Background visual parallax zoom & brightness reveal on scroll
  const bgScale = useTransform(smoothProgress, [0, 0.8], [1, 1.15]);
  const dim = useTransform(smoothProgress, [0, 0.5], [0.65, 0.45]);

  // --- 3 HORIZONTAL TRACKING SLICES PARALLAX DISPLACEMENT ---
  // Top Slice (Line 1: "WE MAKE" + Brand Tag) -> Shifts Left
  const topSliceX = useTransform(smoothProgress, [0.05, 0.55], [0, -200]);

  // Middle Slice (Line 2: "STORIES LOOK") -> Shifts Right
  const middleSliceX = useTransform(smoothProgress, [0.05, 0.55], [0, 200]);

  // Bottom Slice (Line 3: "EXPENSIVE." + Paragraph & CTAs) -> Shifts Left
  const bottomSliceX = useTransform(smoothProgress, [0.05, 0.55], [0, -120]);

  // Fast, crisp Slices Fade to Opacity 0 as next section scrolls up
  const slicesOpacity = useTransform(smoothProgress, [0.2, 0.55], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[150vh] bg-[#050505]">
      {/* Sticky Viewport Container (Pinned in place during initial scroll) */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 px-6 sm:px-8 lg:px-12 bg-[#050505] select-none overflow-hidden">
        
        {/* Visual Cinematic Background Poster */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            style={{
              scale: bgScale,
              transformPerspective: 1000,
            }}
            className="relative w-full h-full transform-gpu"
          >
            <Image
              src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop"
              alt="Cinematic production set"
              fill
              priority
              sizes="100vw"
              quality={75}
              className="object-cover contrast-125 saturate-90"
            />
            <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black pointer-events-none" />
          </motion.div>

          {/* Vignette & Glitch Edge Lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
          <div className="absolute inset-0 scanlines opacity-30" />
        </div>

        {/* --- MAIN HERO WRAPPER (SLICED INTO 3 HORIZONTAL TRACKING LAYERS) --- */}
        <motion.div
          style={{
            opacity: slicesOpacity,
            transformPerspective: 1000,
          }}
          className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start justify-center my-auto transform-gpu"
        >
          {/* TOP SLICE (Brand Tag + Line 1: "WE MAKE") */}
          <motion.div
            style={{
              x: topSliceX,
              transformPerspective: 1000,
              willChange: "transform, opacity",
            }}
            className="w-full origin-left transform-gpu"
          >
            {/* Brand Tag (Safely clear below Navbar) */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] text-[#E50914] uppercase mb-2 sm:mb-3 font-semibold">
              <Film className="w-4 h-4 text-[#E50914]" />
              <span>ONSET PRODUCTION STUDIO</span>
            </div>

            {/* Line 1 */}
            <h1 className="font-display text-[clamp(3.25rem,9vw,10.5rem)] leading-[0.84] tracking-tight text-white uppercase font-normal">
              WE MAKE
            </h1>
          </motion.div>

          {/* MIDDLE SLICE (Line 2: "STORIES LOOK") */}
          <motion.div
            style={{
              x: middleSliceX,
              transformPerspective: 1000,
              willChange: "transform, opacity",
            }}
            className="w-full origin-left transform-gpu -mt-1"
          >
            <h1 className="font-display text-[clamp(3.25rem,9vw,10.5rem)] leading-[0.84] tracking-tight text-white uppercase font-normal">
              STORIES LOOK
            </h1>
          </motion.div>

          {/* BOTTOM SLICE (Line 3: "EXPENSIVE." + Manifesto Paragraph & 2 Core Buttons) */}
          <motion.div
            style={{
              x: bottomSliceX,
              transformPerspective: 1000,
              willChange: "transform, opacity",
            }}
            className="w-full origin-left transform-gpu -mt-1"
          >
            {/* Line 3 */}
            <h1 className="font-display text-[clamp(3.25rem,9vw,10.5rem)] leading-[0.84] tracking-tight text-[#E50914] uppercase font-normal drop-shadow-[0_0_35px_rgba(229,9,20,0.55)]">
              EXPENSIVE.
            </h1>

            {/* Manifesto Quote Paragraph */}
            <div className="mt-6 sm:mt-7 max-w-xl text-left">
              <p className="text-neutral-400 text-xs sm:text-sm lg:text-base font-sans font-light leading-relaxed tracking-wide">
                Bridging the gap between raw creative vision and elite cinema production. We build premium visual worlds for global artists and commercial directors.
              </p>

              {/* Two Core Action Buttons (Side-by-side, safely above screen bottom edge) */}
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-5">
                {/* Primary CTA: Solid Red */}
                <a
                  href="#work"
                  onMouseEnter={playHoverSound}
                  onClick={playShutterSound}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
                >
                  <span>VIEW OUR WORK</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {/* Secondary CTA: Outline Style */}
                <a
                  href="#contact"
                  onMouseEnter={playHoverSound}
                  onClick={playShutterSound}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all hover:scale-105"
                >
                  <span>START A PROJECT</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
