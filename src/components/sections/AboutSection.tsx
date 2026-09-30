"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSound } from "@/components/fx/SoundProvider";

const labels = [
  "WARNER RECORDS",
  "UNIVERSAL MUSIC",
  "INTERSCOPE RECORDS",
  "SONY MUSIC",
  "DEF JAM RECORDINGS",
  "EMPIRE DISTRIBUTION",
  "ATLANTIC RECORDS",
  "EPIC RECORDS",
];

export default function AboutSection() {
  const { playHoverSound } = useSound();

  return (
    <section id="about" className="relative py-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-white/10 pb-8"
        >
          <div>
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-2">
              05 / STUDIO MANIFESTO
            </span>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white">
              BRAND <span className="text-neutral-500">STORY</span>
            </h2>
          </div>
        </motion.div>

        {/* Manifesto Content (Left) & Image (Right) with Framer Motion Entrance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-7 space-y-8"
          >
            <h3 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white leading-[0.9]">
              WE DON'T JUST FILM. <br />
              <span className="text-[#E50914]">WE CREATE CULTURE.</span>
            </h3>

            <p className="text-neutral-300 font-sans text-lg sm:text-xl font-light leading-relaxed max-w-2xl">
              <strong className="text-white font-medium">onsetproduction</strong> was built for directors, record labels, and independent creators who demand visual excellence. Born on real sets with raw lighting, heavy bass, and pure black aesthetics.
            </p>

            <p className="text-neutral-400 font-sans text-base font-light leading-relaxed max-w-2xl">
              We eliminate technical friction between concept and final master. Whether directing a multi-location music video or dispatching an ARRI Alexa LF package at 4 AM, our crew operates with absolute precision.
            </p>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 font-mono">
              <div>
                <span className="font-display text-4xl sm:text-5xl text-white block tracking-wider">150+</span>
                <span className="text-xs text-neutral-400 uppercase mt-1 block">MUSIC VIDEOS</span>
              </div>
              <div>
                <span className="font-display text-4xl sm:text-5xl text-[#E50914] block tracking-wider">45+</span>
                <span className="text-xs text-neutral-400 uppercase mt-1 block">EP VISUALIZERS</span>
              </div>
              <div>
                <span className="font-display text-4xl sm:text-5xl text-white block tracking-wider">99.8%</span>
                <span className="text-xs text-neutral-400 uppercase mt-1 block">ON-TIME DISPATCH</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 aspect-[4/5] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
                alt="Founder on set with cinema camera"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover filter contrast-125 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />

              <div className="absolute bottom-8 left-8 right-8 space-y-1">
                <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-widest block font-bold">
                  FOUNDER & EXECUTIVE DIRECTOR
                </span>
                <h4 className="font-display text-3xl text-white uppercase tracking-wider">
                  DARSHAN @ ONSET
                </h4>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Client Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="border-t border-b border-white/10 py-10 space-y-4"
        >
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest block text-center">
            TRUSTED BY WORLD-CLASS RECORD LABELS & DIRECTORS
          </span>

          <div className="relative overflow-hidden w-full flex">
            <div className="flex shrink-0 animate-marquee space-x-12 py-2">
              {labels.concat(labels).map((label, idx) => (
                <span
                  key={idx}
                  onMouseEnter={playHoverSound}
                  className="font-display text-2xl sm:text-3xl text-neutral-500 hover:text-white tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer"
                >
                  {label} <span className="text-[#E50914] ml-12">•</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
