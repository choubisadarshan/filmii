"use client";

import { useState, useEffect } from "react";
import { useSound } from "@/components/fx/SoundProvider";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ShoppingBag, Menu, X } from "lucide-react";

interface NavbarProps {
  hidden?: boolean;
}

export default function Navbar({ hidden = false }: NavbarProps) {
  const { soundEnabled, toggleSound, playHoverSound, playBeepSound } = useSound();
  const { isCartOpen, setIsCartOpen, totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMenuOpen = mobileMenuOpen && !hidden;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "WORK", href: "#work" },
    { label: "SERVICES", href: "#services" },
    { label: "EQUIPMENT", href: "#equipment" },
    { label: "ABOUT", href: "#about" },
    { label: "CONTACT", href: "#contact" },
  ];

  return (
    <header
      aria-hidden={hidden}
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-[transform,opacity,padding,background-color,border-color] duration-[400ms] ease-in-out ${
        hidden
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      } ${
        scrolled
          ? "bg-[#050505]/95 backdrop-blur-md border-neutral-900 py-4"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Minimal Studio Brand Mark */}
        <a
          href="#"
          onMouseEnter={playHoverSound}
          className="group flex items-center gap-3 text-decoration-none"
        >
          <span className="font-display text-2xl sm:text-3xl tracking-widest text-white uppercase font-normal group-hover:text-neutral-300 transition-colors">
            ONSET <span className="text-[#E50914]">PRODUCTION</span>
          </span>
        </a>

        {/* Minimal Editorial Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onMouseEnter={playHoverSound}
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white transition-colors relative py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E50914] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Studio Controls & CTA */}
        <div className="flex items-center gap-4">
          {/* Mute/Sound SFX Toggle */}
          <button
            onClick={() => {
              toggleSound();
              playBeepSound();
            }}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute On-Set Audio" : "Enable Audio"}
            aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#E50914]" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {/* Rental Cart Trigger */}
          <button
            onClick={() => {
              playHoverSound();
              setIsCartOpen(!isCartOpen);
            }}
            className="relative p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Rental Cart"
            aria-label={`Open rental cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#E50914] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Minimal Studio CTA Button */}
          <a
            href="#contact"
            onMouseEnter={playHoverSound}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
          >
            START A PROJECT
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="md:hidden bg-[#0A0A0A] border-b border-white/10 px-8 py-6 space-y-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-mono tracking-widest text-neutral-300 hover:text-[#E50914]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 bg-[#E50914] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-full"
            >
              START A PROJECT
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
