"use client";

import { motion } from "framer-motion";
import VisualArchiveReveal from "@/components/ui/visual-archive-reveal";

interface PortfolioSectionProps {
  onFullscreenChange?: (hidden: boolean) => void;
}

const CLIENT_VIDEOS = [
  {
    id: "client-1",
    title: "Client Project 01",
    subtitle: "Music Video · 2025",
    // Replace these paths with your real client videos
    src: "/client-video-1.mp4",
    poster: "/client-poster-1.jpg",
  },
  {
    id: "client-2",
    title: "Client Project 02",
    subtitle: "EP Visualizer · 2025",
    src: "/client-video-2.mp4",
    poster: "/client-poster-2.jpg",
  },
];

export default function PortfolioSection({ onFullscreenChange }: PortfolioSectionProps) {
  return (
    <section id="work" className="relative bg-[#050505] text-white">
      <SectionBanner />

      {/* Cinematic showreel (ball + circle reveal – replays on downward entry) */}
      <VisualArchiveReveal
        videoSrc="/showcase_video.mp4"
        posterSrc="/showcase_poster.jpg"
        onFullscreenChange={onFullscreenChange}
      />

      {/* Extra client videos – pure normal scroll, zero animation */}
      <ClientVideosGrid />
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
        transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8 }}
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

function ClientVideosGrid() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-24 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {CLIENT_VIDEOS.map((item) => (
          <ClientVideoCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

function ClientVideoCard({
  title,
  subtitle,
  src,
  poster,
}: {
  title: string;
  subtitle: string;
  src: string;
  poster: string;
}) {
  return (
    <div className="group">
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/10">
        <video
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          controls
          // plain native controls – no custom animation
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl tracking-wide uppercase text-white">
            {title}
          </h3>
          <p className="text-neutral-500 text-sm mt-1 font-mono tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}