"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageSquare, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSound } from "@/components/fx/SoundProvider";

export default function ContactSection() {
  const { cart, totalEstimate } = useCart();
  const { playHoverSound, playShutterSound } = useSound();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "Music Video",
    shootDate: "",
    budgetRange: "$5,000 - $10,000",
    details: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playShutterSound();
    setIsSubmitting(true);

    setTimeout(async () => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E50914", "#FFFFFF", "#8B0000"],
        });
      } catch {
        // Fallback if dynamic import blocked
      }
    }, 1200);
  };

  return (
    <section id="contact" className="relative py-16 sm:py-24 md:py-32 px-6 sm:px-8 lg:px-12 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Cinematic Ending Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="max-w-4xl mx-auto text-center mb-20 space-y-6"
        >
          <span className="text-xs font-mono text-[#E50914] uppercase tracking-[0.2em] font-semibold block">
            07 / START A SESSION
          </span>

          <h2 className="font-display text-6xl sm:text-8xl lg:text-9xl tracking-wider uppercase text-white leading-[0.88]">
            LET&apos;S MAKE <br />
            <span className="text-white">SOMETHING</span> <br />
            <span className="text-[#E50914]">WORTH WATCHING.</span>
          </h2>

          <p className="text-neutral-300 font-sans text-lg max-w-xl mx-auto font-light leading-relaxed">
            Have a music video concept, EP visualizer, or camera rental inquiry? Connect with our studio team below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Studio Hotline Details (Enters from Left) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="bg-gradient-to-br from-neutral-900 to-black p-8 lg:p-10 rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(220,38,38,0.1)] space-y-8">
              <h3 className="font-display text-3xl tracking-wider text-white uppercase">
                STUDIO <span className="text-[#E50914]">HOTLINE</span>
              </h3>

              <div className="space-y-6 font-sans">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-[#E50914]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-neutral-400 text-xs uppercase tracking-wider font-semibold block mb-1">PHONE / WHATSAPP</span>
                    <a
                      href="https://wa.me/18005556673"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:text-[#E50914] font-semibold transition-colors text-base"
                    >
                      +1 (800) 555-ONSET / +1 (800) 555-6673
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-[#E50914]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-neutral-400 text-xs uppercase tracking-wider font-semibold block mb-1">EMAIL INQUIRIES</span>
                    <a
                      href="mailto:create@onsetproduction.com"
                      className="text-white hover:text-[#E50914] font-semibold transition-colors text-base"
                    >
                      create@onsetproduction.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-[#E50914]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-neutral-400 text-xs uppercase tracking-wider font-semibold block mb-1">LOCATIONS</span>
                    <p className="text-neutral-200 font-medium text-sm tracking-wide">
                      LOS ANGELES • NEW YORK • LONDON
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/18005556673"
                target="_blank"
                rel="noreferrer"
                onMouseEnter={playHoverSound}
                className="w-full py-4 px-6 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>INSTANT WHATSAPP CHAT</span>
              </a>
            </div>

            {cart.length > 0 && (
              <div className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-2xl border border-neutral-800 font-sans text-xs space-y-3">
                <div className="flex justify-between items-center text-[#E50914] font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-2">
                  <span>ATTACHED RENTAL LIST ({cart.length} ITEMS)</span>
                  <span>${totalEstimate} EST.</span>
                </div>
                {cart.map((i) => (
                  <div key={i.id} className="flex justify-between text-neutral-200 text-sm font-medium">
                    <span>{i.name} ({i.days}d)</span>
                    <span className="text-neutral-400">${i.dailyRate * i.days}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Minimal Production Inquiry Form (Enters from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="lg:col-span-7 bg-gradient-to-br from-neutral-900 to-black p-8 sm:p-10 rounded-2xl border border-neutral-800"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
                style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
                className="py-12 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#E50914] text-white mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="font-display text-4xl text-white uppercase tracking-wider">
                  SESSION SUBMITTED
                </h3>
                <p className="text-neutral-300 font-sans text-sm max-w-md mx-auto font-light leading-relaxed">
                  Our production team has received your inquiry. We will respond within 2 hours with creative treatment details.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white font-sans font-semibold text-xs uppercase tracking-wider"
                >
                  SUBMIT ANOTHER INQUIRY
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 font-sans text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                      YOUR NAME / ARTIST NAME *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Travis Scott / Management"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full py-3 bg-transparent border-b border-neutral-700 rounded-none text-white font-sans text-sm placeholder-neutral-500 focus:outline-none focus:border-[#E50914] px-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="artist@recordlabel.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full py-3 bg-transparent border-b border-neutral-700 rounded-none text-white font-sans text-sm placeholder-neutral-500 focus:outline-none focus:border-[#E50914] px-0 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="block text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                      PHONE / WHATSAPP
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full py-3 bg-transparent border-b border-neutral-700 rounded-none text-white font-sans text-sm placeholder-neutral-500 focus:outline-none focus:border-[#E50914] px-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-project-type" className="block text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                      PROJECT TYPE
                    </label>
                    <select
                      id="contact-project-type"
                      aria-label="Select production project type"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full py-3 bg-transparent border-b border-neutral-700 rounded-none text-white font-sans text-sm focus:outline-none focus:border-[#E50914] px-0 transition-colors cursor-pointer"
                    >
                      <option value="Music Video" className="bg-neutral-900 text-white">Music Video Production</option>
                      <option value="EP Visualizer" className="bg-neutral-900 text-white">EP Visualizer Series</option>
                      <option value="Equipment Rental" className="bg-neutral-900 text-white">Equipment Rental Dispatch</option>
                      <option value="Full On-Set Crewing" className="bg-neutral-900 text-white">Full On-Set Crewing</option>
                      <option value="Commercial" className="bg-neutral-900 text-white">Commercial / Brand Shoot</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-details" className="block text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                    PROJECT VISION & DETAILS
                  </label>
                  <textarea
                    id="contact-details"
                    rows={4}
                    placeholder="Tell us about your song concept, target dates, location, or gear needs..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full py-3 bg-transparent border-b border-neutral-700 rounded-none text-white font-sans text-sm placeholder-neutral-500 focus:outline-none focus:border-[#E50914] px-0 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={playHoverSound}
                  className="w-full py-4 px-8 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <span>TRANSMITTING INQUIRY...</span>
                  ) : (
                    <>
                      <span>START A PROJECT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}