"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

interface GearItem {
  name: string;
  type: string;
  qty: number;
  specs: string;
}

interface Category {
  id: string;
  title: string;
  brands: string;
  image: string;
  summary: string;
  stats: { value: string; label: string }[];
  items: GearItem[];
}

// Subscribes to the viewport width so mobile gets a bottom sheet, desktop a centered dialog.
function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  );
}

const categories: Category[] = [
  {
    id: "cameras",
    title: "CAMERAS",
    brands: "ARRI • RED • SONY",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=2032&auto=format&fit=crop",
    summary: "Cinema bodies for features, commercials and music videos, all supplied with batteries, media and monitoring.",
    stats: [
      { value: "08", label: "Camera bodies" },
      { value: "3", label: "Brands" },
      { value: "8K", label: "Max resolution" },
    ],
    items: [
      { name: "ARRI Alexa Mini LF", type: "Large format cinema", qty: 2, specs: "4.5K LF • ARRIRAW • 14+ stops" },
      { name: "RED V-Raptor 8K VV", type: "Cinema", qty: 2, specs: "8K VV • 120 fps • REDCODE RAW" },
      { name: "Sony FX6", type: "Compact cinema", qty: 3, specs: "4K 120 fps • Full-frame • Dual ISO" },
      { name: "Sony A7S III", type: "Mirrorless / B-cam", qty: 1, specs: "4K 120 fps • 10-bit 4:2:2" },
    ],
  },
  {
    id: "lenses",
    title: "LENSES",
    brands: "COOKE • ZEISS • ATLAS",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
    summary: "Matched prime sets and anamorphics for a distinct look, with fully calibrated focus marks.",
    stats: [
      { value: "20", label: "Lenses" },
      { value: "4", label: "Prime & zoom sets" },
      { value: "T1.3", label: "Fastest stop" },
    ],
    items: [
      { name: "Cooke S4/i Prime Set", type: "Spherical primes", qty: 8, specs: "18–100mm • T2 • PL mount" },
      { name: "Zeiss Supreme Prime", type: "Full-frame primes", qty: 6, specs: "21–135mm • T1.5 • PL / LPL" },
      { name: "Atlas Orion Anamorphic", type: "Anamorphic 2x", qty: 4, specs: "40–100mm • T2 • 2x squeeze" },
      { name: "Angénieux EZ-1", type: "Zoom", qty: 2, specs: "30–90mm • T2 • Super 35" },
    ],
  },
  {
    id: "lighting",
    title: "LIGHTING",
    brands: "APUTURE • NANLITE • ARRI",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2058&auto=format&fit=crop",
    summary: "From hard sources to soft panels, with modifiers, stands and distro included in every kit.",
    stats: [
      { value: "24", label: "Fixtures" },
      { value: "3", label: "Brands" },
      { value: "1200W", label: "Max output" },
    ],
    items: [
      { name: "Aputure 1200d Pro", type: "Daylight COB", qty: 2, specs: "1200W • 5600K • Bowens mount" },
      { name: "Aputure 600d Pro", type: "Daylight COB", qty: 4, specs: "600W • 5600K • Wireless DMX" },
      { name: "Nanlite Forza 500B", type: "Bi-colour LED", qty: 6, specs: "500W • 2700–6500K" },
      { name: "ARRI SkyPanel S60-C", type: "Soft panel", qty: 4, specs: "RGBW • 2800–10000K • DMX" },
    ],
  },
  {
    id: "grip",
    title: "GRIP & SUPPORT",
    brands: "DJI • RONIN • TRIPODS",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop",
    summary: "Stabilisation, tripods and rigging to keep every shot steady, whether on a stage or on location.",
    stats: [
      { value: "16", label: "Support units" },
      { value: "4", label: "Gimbals" },
      { value: "13kg", label: "Max payload" },
    ],
    items: [
      { name: "DJI Ronin 2", type: "3-axis gimbal", qty: 2, specs: "13.6 kg payload • Dual battery" },
      { name: "DJI RS 3 Pro", type: "Compact gimbal", qty: 2, specs: "4.5 kg payload • Carbon fibre" },
      { name: "Sachtler Video 18", type: "Fluid-head tripod", qty: 4, specs: "100mm bowl • 18 kg payload" },
      { name: "Dana Dolly + Track", type: "Dolly", qty: 2, specs: "Portable • 8 ft straight track" },
    ],
  },
];

export default function EquipmentSection() {
  const { playHoverSound, playShutterSound } = useSound();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const active = categories.find((c) => c.id === activeId) ?? null;

  const closeModal = useCallback(() => setActiveId(null), []);

  // Lock page scroll while open and close on Escape
  useEffect(() => {
    if (!activeId) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeId, closeModal]);

  return (
    <section id="equipment" className="relative py-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8"
        >
          <div>
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-2">
              04 / CINEMA GEAR / RENTAL
            </span>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white">
              EQUIPMENT
            </h2>
          </div>

          <p className="text-neutral-400 font-sans text-base max-w-md mt-4 md:mt-0 leading-relaxed font-light">
            Professional cinema equipment for productions that demand more.
          </p>
        </motion.div>

        {/* Editorial 2x2 Category Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              aria-haspopup="dialog"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playShutterSound();
                setActiveId(cat.id);
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001, delay: idx * 0.1 }}
              style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
              className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 block w-full text-left select-none cursor-pointer"
            >
              {/* Cinematic Background Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out filter contrast-125 brightness-90"
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-500" />

              {/* Category Info Overlay */}
              <div className="absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  {/* <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                    0{idx + 1} / CATEGORY
                  </span> */}
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase group-hover:text-neutral-200 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-neutral-400 tracking-widest uppercase font-medium">
                      {cat.brands}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white group-hover:text-[#E50914] transition-colors pb-1 shrink-0">
                    <span className="hidden sm:inline">VIEW GEAR</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Studio Equipment Inquiry CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div className="space-y-2 max-w-xl">
            <h3 className="font-display text-3xl sm:text-4xl tracking-wider text-white uppercase">
              NEED SPECIFIC GEAR?
            </h3>
            <p className="font-sans text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
              Tell us what you&apos;re shooting and we&apos;ll help build the right kit.
            </p>
          </div>

          <a
            href="#contact"
            onMouseEnter={playHoverSound}
            onClick={playShutterSound}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(229,9,20,0.3)] shrink-0"
          >
            <span>REQUEST EQUIPMENT</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
      {/* Category Detail Modal */}
      <AnimatePresence>
        {active && (
          <div
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} equipment details`}
          >
            {/* Blurred backdrop: click outside to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                playHoverSound();
                closeModal();
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Mobile: bottom sheet. Desktop: centered dialog. */}
            <motion.div
              key={active.id}
              initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.94, y: 24 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) closeModal();
              }}
              className="relative z-10 w-full md:max-w-4xl max-h-[88dvh] md:max-h-[80vh] flex flex-col md:flex-row overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-[0_0_80px_rgba(229,9,20,0.15)]"
            >
              {/* Drag handle (mobile only) */}
              <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 z-20 h-1 w-10 rounded-full bg-white/40" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  playHoverSound();
                  closeModal();
                }}
                aria-label="Close"
                className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 border border-white/15 text-white hover:text-[#E50914] hover:border-[#E50914]/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image: banner on mobile, side panel on desktop */}
              <div className="relative h-36 sm:h-44 md:h-auto md:w-[38%] shrink-0">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover filter contrast-125 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-[#0A0A0A]" />
                <div className="absolute bottom-3 left-5 right-5 md:bottom-8 md:left-8 md:right-8">
                  <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-1">
                    {active.brands}
                  </span>
                  <h3 className="font-display text-3xl md:text-5xl tracking-wider text-white uppercase leading-none">
                    {active.title}
                  </h3>
                </div>
              </div>

              {/* Details (scrolls inside the box) */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 md:p-8">
                <p className="font-sans text-sm md:text-base text-neutral-400 font-light leading-relaxed mb-5">
                  {active.summary}
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
                  {active.stats.map((st) => (
                    <div key={st.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center md:text-left">
                      <div className="font-display text-2xl md:text-3xl tracking-wider text-white">{st.value}</div>
                      <div className="font-mono text-[9px] md:text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item list */}
                <ul className="divide-y divide-white/10 border-y border-white/10 mb-6">
                  {active.items.map((item) => (
                    <li key={item.name} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-sans text-sm md:text-base text-white font-medium">{item.name}</p>
                        <p className="font-mono text-[10px] md:text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
                          {item.type}
                        </p>
                        <p className="font-sans text-xs md:text-sm text-neutral-400 font-light mt-1">{item.specs}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-[#E50914] border border-[#E50914]/30 rounded-full px-2.5 py-1">
                        ×{item.qty}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playShutterSound();
                    closeModal();
                  }}
                  className="flex w-full md:inline-flex md:w-auto items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_30px_rgba(229,9,20,0.3)]"
                >
                  <span>REQUEST THIS KIT</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}