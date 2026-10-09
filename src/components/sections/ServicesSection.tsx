"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { RevealDiv } from "@/components/ui/reveal";
import { ArrowRight } from "lucide-react";
import { useSound } from "@/components/fx/SoundProvider";

const services = [
  {
    num: "01",
    title: "MUSIC VIDEO & FILM PRODUCTION",
    category: "CREATIVE & DIRECTING",
    description:
      "Full-spectrum visual creation for record labels and independent artists. From high-concept creative treatments to 8K master color grading and 3D visual effects.",
    features: [
      "Custom Creative Treatment & World Building",
      "Direction & Cinematography (ARRI 4K/8K)",
      "Davinci Resolve Studio Master Color",
      "Fast 72-Hour Rough Cut Delivery",
    ],
    priceTag: "CUSTOM TREATMENT INQUIRY",
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop",
    href: "#contact",
  },
  {
    num: "02",
    title: "FULL ON-SET CREWING",
    category: "LINE PRODUCTION & TECHNICAL",
    description:
      "Complete technical film set staffing. We deploy battle-tested DPs, Gaffers, Key Grips, Sound Engineers, and DIT specialists for seamless production logistics.",
    features: [
      "Director of Photography (DP) & Camera Crew",
      "Gaffers & Stage Lighting Technicians",
      "Key Grip & Rigging Specialists",
      "On-Set DIT & Instant Data Offloading",
    ],
    priceTag: "CREW STAFFING DISPATCH",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    href: "#contact",
  },
  {
    num: "03",
    title: "CINEMA EQUIPMENT RENTALS",
    category: "GEAR & DISPATCH",
    description:
      "Direct rental access to camera-ready ARRI Alexa Mini LF, RED V-Raptor 8K, Cooke Anamorphic lenses, Aputure LED lighting, and wireless video monitoring packages.",
    features: [
      "ARRI Alexa Mini LF & RED V-Raptor 8K",
      "Cooke & Atlas Anamorphic Prime Sets",
      "Aputure 1200d & Nanlite 720B Lighting",
      "DJI Ronin 2 & Wireless Video Rigs",
    ],
    priceTag: "SAME-DAY LOCAL DISPATCH",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=2032&auto=format&fit=crop",
    href: "#equipment",
  },
];

export default function ServicesSection() {
  const { playHoverSound, playShutterSound } = useSound();

  return (
    <section id="services" className="relative -mt-[40vh] sm:-mt-[50vh] z-20 pt-12 pb-16 sm:pb-24 md:pt-16 md:pb-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <RevealDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 md:mb-20 border-b border-white/10 pb-8"
        >
          <div>
            <span className="text-[13px] font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block mb-2">
              02 / PRODUCTION CAPABILITIES
            </span>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase text-white">
              STUDIO <span className="text-neutral-500">SERVICES</span>
            </h2>
          </div>
          <p className="text-neutral-400 font-sans text-base max-w-md mt-4 md:mt-0 leading-relaxed font-light">
            End-to-end film production, camera crewing, and equipment dispatch engineered for record labels and directors.
          </p>
        </RevealDiv>

        {/* Editorial Alternating Left / Right Entrance Cards */}
        <div className="space-y-16">
          {services.map((service, index) => {
            const isEven = index % 2 === 0;

            return (
              <RevealDiv
                key={service.num}
                initial={{ opacity: 0, x: isEven ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
                                onMouseEnter={playHoverSound}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-10 md:pb-16"
              >
                {/* Service Number & Titles */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="font-display text-6xl lg:text-7xl text-neutral-600 block group-hover:text-[#E50914] transition-colors">
                    {service.num}
                  </span>
                  <span className="text-[13px] font-mono text-[#E50914] tracking-widest uppercase block font-semibold">
                    {service.category}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white uppercase group-hover:text-neutral-200 transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Service Description & Features */}
                <div className="lg:col-span-4 space-y-6">
                  <p className="text-neutral-300 font-sans text-base font-light leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-2 font-mono text-[13px] text-neutral-400">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Service Visual Preview & CTA */}
                <div className="lg:col-span-3 space-y-6 flex flex-col items-start lg:items-end">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
                                        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-125 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                  </motion.div>

                  <a
                    href={service.href}
                    onClick={playShutterSound}
                    className="inline-flex items-center gap-3 text-[13px] font-mono font-bold text-white group-hover:text-[#E50914] uppercase tracking-wider transition-colors"
                  >
                    <span>VIEW SERVICE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </a>
                </div>
              </RevealDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}