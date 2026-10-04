"use client";

import { Film } from "lucide-react";
import VisualArchiveReveal from "@/components/ui/visual-archive-reveal";

interface PortfolioSectionProps {
  onFullscreenChange?: (hidden: boolean) => void;
}

const CLIENT_VIDEOS = [
  {
    id: "client-1",
    title: "Client Project 01",
    subtitle: "Music Video · 2025",
  },
  {
    id: "client-2",
    title: "Client Project 02",
    subtitle: "EP Visualizer · 2025",
  },
];

export default function PortfolioSection({
  onFullscreenChange: _onFullscreenChange,
}: PortfolioSectionProps) {
  // onFullscreenChange kept for page.tsx compatibility; this simpler reel doesn't hide nav
  return (
    <section id="work" className="relative bg-[#050505] text-white">
      <VisualArchiveReveal
        videoSrc="/showcase_video.mp4"
        posterSrc="/showcase_poster.jpg"
      />

      <div className="mx-auto w-[min(1280px,calc(100%-36px))] pb-20 pt-8 md:w-[min(1280px,calc(100%-64px))] md:pb-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {CLIENT_VIDEOS.map((item) => (
            <ClientVideoCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientVideoCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div
        role="img"
        aria-label={`${title} preview coming soon`}
        className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] text-neutral-500"
      >
        <Film className="size-8 text-[#E50914]/80" aria-hidden />
        <span className="font-mono text-xs uppercase tracking-[0.18em]">
          Preview coming soon
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl uppercase tracking-wide text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1 font-mono text-sm tracking-wider text-neutral-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}