"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

const FULLSCREEN_AT = 0.7; // progress where the card is fully expanded

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getServerSnapshot() {
  return false;
}

interface PortfolioSectionProps {
  onFullscreenChange?: (hidden: boolean) => void;
}

export default function PortfolioSection({ onFullscreenChange }: PortfolioSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="work" className="relative bg-[#050505] text-white">
      <SectionBanner />
      {reduceMotion ? (
        <StaticVideo />
      ) : (
        <ScrollVideo onFullscreenChange={onFullscreenChange} />
      )}
    </section>
  );
}

function SectionBanner() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
        style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
        className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8"
      >
        <div>
          <span className="text-xs font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-2">
            03 / SELECTED WORK
          </span>
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white">
            VISUAL <span className="text-neutral-500">ARCHIVE</span>
          </h2>
        </div>
        <p className="text-neutral-400 font-sans text-base max-w-md mt-4 md:mt-0 leading-relaxed font-light">
          Music videos, films and brand stories shot, graded and delivered by our crew. Keep scrolling to roll the reel.
        </p>
      </motion.div>
    </div>
  );
}

function StaticVideo() {
  return (
    <div className="relative h-screen">
      <video
        src="/showcase_video.mp4"
        poster="/showcase_poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 px-4 text-center">
        <h3 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-widest text-white uppercase font-normal">
          ROLL CAMERA
        </h3>
      </div>
    </div>
  );
}

function ScrollVideo({ onFullscreenChange }: PortfolioSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef(false);
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // 0 -> 1 while the stage is pinned
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // 0 while pinned, then 0 -> 1 as the stage scrolls away
  const { scrollYProgress: exitProgress } = useScroll({
    target: trackRef,
    offset: ["end end", "end start"],
  });

  const clip = useTransform(scrollYProgress, (pos) => {
    const progress = Math.min(Math.max(pos / FULLSCREEN_AT, 0), 1);
    const topBottom = isMobile ? 25 * (1 - progress) : 35 * (1 - progress);
    const leftRight = isMobile ? 8 * (1 - progress) : 30 * (1 - progress);
    const radius = isMobile ? 20 * (1 - progress) : 24 * (1 - progress);
    return `inset(${topBottom}% ${leftRight}% ${topBottom}% ${leftRight}% round ${radius}px)`;
  });

  const videoScale = useTransform(scrollYProgress, [0, FULLSCREEN_AT], [1.3, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 2.2]);

  const update = () => {
    const shouldHide = scrollYProgress.get() >= FULLSCREEN_AT && exitProgress.get() <= 0.02;
    if (shouldHide !== hiddenRef.current) {
      hiddenRef.current = shouldHide;
      onFullscreenChange?.(shouldHide);
    }
  };

  useMotionValueEvent(scrollYProgress, "change", update);
  useMotionValueEvent(exitProgress, "change", update);

  useEffect(() => () => onFullscreenChange?.(false), [onFullscreenChange]);

  return (
    <div ref={trackRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <motion.video
          style={{ clipPath: clip, scale: videoScale, willChange: "clip-path, transform" }}
          src="/showcase_video.mp4"
          poster="/showcase_poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.div
          style={{ opacity: titleOpacity, willChange: "opacity" }}
          className="pointer-events-none absolute inset-0 bg-black/40"
        />
        <motion.div
          style={{ opacity: titleOpacity, scale: titleScale, willChange: "opacity, transform" }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center"
        >
          <h3 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-widest text-white uppercase font-normal">
            ROLL CAMERA
          </h3>
        </motion.div>
      </div>
    </div>
  );
}
