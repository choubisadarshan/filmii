"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

const categories = [
  {
    id: "cameras",
    title: "CAMERAS",
    brands: "ARRI • RED • SONY",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=2032&auto=format&fit=crop",
  },
  {
    id: "lenses",
    title: "LENSES",
    brands: "COOKE • ZEISS • ATLAS",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "lighting",
    title: "LIGHTING",
    brands: "APUTURE • NANLITE • ARRI",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2058&auto=format&fit=crop",
  },
  {
    id: "grip",
    title: "GRIP & SUPPORT",
    brands: "DJI • RONIN • TRIPODS",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function EquipmentSection() {
  const { playHoverSound, playShutterSound } = useSound();

  return (
    <section id="equipment" className="relative py-16 sm:py-24 md:py-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
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
            <motion.a
              key={cat.id}
              href="#contact"
              onMouseEnter={playHoverSound}
              onClick={playShutterSound}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001, delay: idx * 0.1 }}
              style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
              className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 block select-none cursor-pointer"
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
                  <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                    0{idx + 1} / CATEGORY
                  </span>
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
                    <span className="hidden sm:inline">EXPLORE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.a>
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
    </section>
  );
}