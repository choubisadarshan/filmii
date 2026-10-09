"use client";

import { ArrowUp } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

export default function Footer() {
  const { playHoverSound, playShutterSound } = useSound();

  const scrollToTop = () => {
    playShutterSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#050505] border-t border-white/10 text-white pt-14 pb-8 md:pt-20 md:pb-10 px-6 sm:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <span className="font-display text-3xl tracking-widest uppercase text-white block">
              ONSET <span className="text-[#E50914]">PRODUCTION</span>
            </span>
            <p className="text-neutral-400 font-sans text-base max-w-md font-light leading-relaxed">
              Premium film production studio & cinema equipment rental platform for music videos, EP visualizers, and commercial crewing worldwide.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 font-mono text-[13px] space-y-3">
            <span className="text-[#E50914] font-bold block uppercase tracking-widest">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#work" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                  SELECTED WORK
                </a>
              </li>
              <li>
                <a href="#services" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                  STUDIO SERVICES
                </a>
              </li>
              <li>
                <a href="#equipment" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                  EQUIPMENT RENTALS
                </a>
              </li>
              <li>
                <a href="#calculator" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                  RATE CALCULATOR
                </a>
              </li>
              <li>
                <a href="#about" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                  STUDIO MANIFESTO
                </a>
              </li>
            </ul>
          </div>

          {/* Socials & Dispatch Hubs */}
          <div className="md:col-span-3 font-mono text-[13px] space-y-3">
            <span className="text-[#E50914] font-bold block uppercase tracking-widest">
              STUDIO HUBS
            </span>
            <p className="text-neutral-400">LOS ANGELES • NEW YORK • LONDON</p>
            <p className="text-neutral-400">create@onsetproduction.com</p>

            <div className="pt-2 flex gap-4 text-neutral-400">
              <a href="#" aria-label="Onset Production on Instagram" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                INSTAGRAM
              </a>
              <a href="#" aria-label="Onset Production on YouTube" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                YOUTUBE
              </a>
              <a href="#" aria-label="Onset Production on Vimeo" onMouseEnter={playHoverSound} className="hover:text-white transition-colors">
                VIMEO
              </a>
            </div>
          </div>
        </div>

        {/* Oversized Subtle Studio Typography Watermark */}
        <div className="py-4 border-t border-b border-white/5 overflow-hidden select-none">
          <h2 className="font-display text-[11vw] leading-none text-neutral-700 md:text-neutral-900 uppercase tracking-tighter text-center">
            ONSET PRODUCTION
          </h2>
        </div>

        {/* Bottom Bar & Scroll Back to Top */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[13px] text-neutral-400">
          <div>
            © {new Date().getFullYear()} ONSETPRODUCTION. ALL RIGHTS RESERVED.
          </div>

          <button
            onClick={scrollToTop}
            onMouseEnter={playHoverSound}
            aria-label="Scroll back to top of page"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-full bg-white/5 border border-white/10 cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}