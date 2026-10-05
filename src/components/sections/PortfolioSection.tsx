"use client";

import { motion } from "framer-motion";
import VisualArchiveReveal from "@/components/ui/visual-archive-reveal";
import WorkTimeline from "@/components/sections/WorkTimeline";

interface PortfolioSectionProps {
  onFullscreenChange?: (hidden: boolean) => void;
}

export default function PortfolioSection({ onFullscreenChange }: PortfolioSectionProps) {
  return (
    <section id="work" className="relative bg-[#050505] text-white">

      {/* Cinematic showreel (ball + circle reveal – replays on downward entry) */}
      <VisualArchiveReveal
        videoSrc="/showcase_video.mp4"
        posterSrc="/showcase_poster.jpg"
        onFullscreenChange={onFullscreenChange}
      />

      {/* Scroll timeline: 4 categories, each links to /work/<slug> */}
      <WorkTimeline />
    </section>
  );
}

function SectionBanner() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-5 sm:pt-16 md:pt-24 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8"
      >
        {/* <div>
          <span className="text-xs font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-2">
            03 / SELECTED WORK
          </span>
          <h2 className="font-display text-4xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white">
            VISUAL <span className="text-neutral-500">ARCHIVE</span>
          </h2>
        </div>
        <p className="text-neutral-400 font-sans text-base max-w-md mt-4 md:mt-0 leading-relaxed font-light">
          Music videos, films and brand stories shot, graded and delivered by our crew. Keep scrolling to roll the reel.
        </p> */}
      </motion.div>
    </div>
  );
}
