"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

export default function RateCalculator() {
  const { playHoverSound, playShutterSound } = useSound();

  const [days, setDays] = useState<number>(2);
  const [projectType, setProjectType] = useState<"mv" | "ep" | "commercial">("mv");
  const [crewTier, setCrewTier] = useState<"minimal" | "standard" | "full">("standard");
  const [cameraTier, setCameraTier] = useState<"fx9" | "red" | "arri">("arri");
  const [vfxTier, setVfxTier] = useState<boolean>(true);

  // Price Calculation Logic
  const getBaseRate = () => {
    let base = 2500;
    if (projectType === "ep") base = 4200;
    if (projectType === "commercial") base = 5500;

    let crewCost = 850;
    if (crewTier === "standard") crewCost = 1800;
    if (crewTier === "full") crewCost = 3400;

    let cameraCost = 450;
    if (cameraTier === "red") cameraCost = 850;
    if (cameraTier === "arri") cameraCost = 1250;

    const vfxCost = vfxTier ? 1200 : 0;

    const totalPerDay = base + crewCost + cameraCost;
    return totalPerDay * days + vfxCost;
  };

  const estimatedTotal = getBaseRate();

  const handleApplyToQuote = () => {
    playShutterSound();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="calculator" className="relative py-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
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
              05 / PRODUCTION ESTIMATOR
            </span>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white leading-[0.9]">
              PLAN YOUR <br className="hidden sm:block" />
              <span className="text-white">PRODUCTION</span>
            </h2>
          </div>
          <p className="text-neutral-400 font-sans text-base max-w-md mt-6 md:mt-0 leading-relaxed font-light">
            Build your production setup and get a clear estimate for your project.
          </p>
        </motion.div>

        {/* Clean Editorial Two-Column Estimator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Configuration Panel (Enters from Left) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-7 space-y-10"
          >
            {/* 01. Shoot Duration */}
            <div className="space-y-3">
              <span className="block font-mono text-xs text-[#E50914] font-semibold uppercase tracking-[0.15em]">
                01 / SHOOT DURATION
              </span>
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl p-3 max-w-xs sm:max-w-sm">
                <button
                  type="button"
                  onClick={() => {
                    playHoverSound();
                    setDays((prev) => Math.max(1, prev - 1));
                  }}
                  aria-label="Decrease shoot duration by 1 day"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold hover:bg-white/10 transition-colors flex items-center justify-center text-base cursor-pointer"
                  title="Decrease Days"
                >
                  −
                </button>
                <div className="text-center font-mono">
                  <span className="text-base sm:text-lg font-bold text-white tracking-widest uppercase">
                    {days} DAY{days > 1 ? "S" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHoverSound();
                    setDays((prev) => Math.min(10, prev + 1));
                  }}
                  aria-label="Increase shoot duration by 1 day"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold hover:bg-white/10 transition-colors flex items-center justify-center text-base cursor-pointer"
                  title="Increase Days"
                >
                  +
                </button>
              </div>
            </div>

            {/* 02. Project Type */}
            <div className="space-y-3">
              <span className="block font-mono text-xs text-[#E50914] font-semibold uppercase tracking-[0.15em]">
                02 / PROJECT TYPE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "mv", label: "MUSIC VIDEO" },
                  { id: "ep", label: "EP VISUALIZER" },
                  { id: "commercial", label: "COMMERCIAL" },
                ].map((item) => {
                  const isSelected = projectType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        playHoverSound();
                        setProjectType(item.id as "mv" | "ep" | "commercial");
                      }}
                      className={`py-3.5 px-4 rounded-xl border text-center font-mono text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-white/10 border-white text-white font-bold"
                          : "bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:border-neutral-500 font-medium"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03. Crew & Staffing */}
            <div className="space-y-3">
              <span className="block font-mono text-xs text-[#E50914] font-semibold uppercase tracking-[0.15em]">
                03 / CREW & STAFFING
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "minimal", label: "SOLO DP" },
                  { id: "standard", label: "STANDARD CREW" },
                  { id: "full", label: "FULL PRODUCTION" },
                ].map((item) => {
                  const isSelected = crewTier === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        playHoverSound();
                        setCrewTier(item.id as "minimal" | "standard" | "full");
                      }}
                      className={`py-3.5 px-4 rounded-xl border text-center font-mono text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-white/10 border-white text-white font-bold"
                          : "bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:border-neutral-500 font-medium"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 04. Camera Package */}
            <div className="space-y-3">
              <span className="block font-mono text-xs text-[#E50914] font-semibold uppercase tracking-[0.15em]">
                04 / CAMERA PACKAGE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "fx9", label: "SONY FX9" },
                  { id: "red", label: "RED V-RAPTOR" },
                  { id: "arri", label: "ARRI ALEXA LF" },
                ].map((item) => {
                  const isSelected = cameraTier === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        playHoverSound();
                        setCameraTier(item.id as "fx9" | "red" | "arri");
                      }}
                      className={`py-3.5 px-4 rounded-xl border text-center font-mono text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-white/10 border-white text-white font-bold"
                          : "bg-white/[0.02] border-white/10 text-neutral-300 hover:text-white hover:border-neutral-500 font-medium"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 05. Post Production */}
            <div className="space-y-3">
              <span className="block font-mono text-xs text-[#E50914] font-semibold uppercase tracking-[0.15em]">
                05 / POST PRODUCTION
              </span>
              <div className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] rounded-xl border border-white/10">
                <div className="space-y-1 pr-4">
                  <span className="font-mono text-xs text-white font-semibold uppercase tracking-wider block">
                    INCLUDE POST PRODUCTION
                  </span>
                  <span className="text-xs font-sans text-neutral-300 block font-light">
                    Full-production color pass + 3D motion elements.
                  </span>
                </div>
                <button
                  type="button"
                  aria-pressed={vfxTier}
                  aria-label={vfxTier ? "Disable post production add-on" : "Enable post production add-on"}
                  onClick={() => {
                    playHoverSound();
                    setVfxTier(!vfxTier);
                  }}
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    vfxTier
                      ? "bg-white/10 border border-white text-white"
                      : "bg-white/5 border border-white/10 text-neutral-400"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${vfxTier ? "bg-[#E50914]" : "bg-neutral-500"}`} />
                  <span>{vfxTier ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Summary & Estimated Budget Panel (Enters from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-5 bg-gradient-to-br from-neutral-900 to-black p-8 sm:p-10 rounded-2xl border border-neutral-800 space-y-8 flex flex-col justify-between"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="font-mono text-xs text-[#E50914] uppercase tracking-[0.15em] font-semibold block">
                  ESTIMATED PRODUCTION BUDGET
                </span>
                <div className="font-display text-6xl sm:text-7xl lg:text-8xl text-white tracking-wider">
                  ${estimatedTotal.toLocaleString()}
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block pt-1">
                  ESTIMATED DIRECTING & PRODUCTION COST
                </span>
              </div>

              <div className="border-t border-neutral-800 pt-6 space-y-3.5 font-mono text-xs">
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500 uppercase tracking-wider">SHOOT DAYS</span>
                  <span className="font-bold text-white tracking-wider">{days} DAYS</span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500 uppercase tracking-wider">CAMERA PACKAGE</span>
                  <span className="font-bold text-white tracking-wider uppercase">
                    {cameraTier === "fx9" ? "SONY FX9" : cameraTier === "red" ? "RED V-RAPTOR" : "ARRI ALEXA LF"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500 uppercase tracking-wider">ON-SET CREW</span>
                  <span className="font-bold text-white tracking-wider uppercase">
                    {crewTier === "minimal" ? "SOLO DP" : crewTier === "standard" ? "STANDARD CREW" : "FULL PRODUCTION"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500 uppercase tracking-wider">VFX & COLOR</span>
                  <span className="font-bold text-white tracking-wider uppercase">
                    {vfxTier ? "INCLUDED" : "NONE"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyToQuote}
              onMouseEnter={playHoverSound}
              className="w-full py-4 px-8 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-8"
            >
              <span>APPLY TO PRODUCTION INQUIRY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

