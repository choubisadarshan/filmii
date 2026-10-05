"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SoundProvider } from "@/components/fx/SoundProvider";
import { CartProvider } from "@/context/CartContext";
import FilmGrain from "@/components/fx/FilmGrain";
import RedSpotlight from "@/components/fx/RedSpotlight";
import CustomCursor from "@/components/fx/CustomCursor";
import LoadingScreen from "@/components/fx/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ScrollToHash from "@/components/ui/scroll-to-hash";

// Dynamically import below-the-fold sections & overlays for optimal initial JS payload
const CartDrawer = dynamic(() => import("@/components/layout/CartDrawer"), { ssr: false });
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"));
const PortfolioSection = dynamic(() => import("@/components/sections/PortfolioSection"));
const EquipmentSection = dynamic(() => import("@/components/sections/EquipmentSection"));
const RateCalculator = dynamic(() => import("@/components/sections/RateCalculator"));
const AboutSection = dynamic(() => import("@/components/sections/AboutSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

export default function Home() {
  const [navHidden, setNavHidden] = useState(false);

  return (
    <SoundProvider>
      <CartProvider>
        {/* Initial Film Slate Loader */}
        <LoadingScreen />
        <ScrollToHash />

        {/* Global Film Grain Overlay & Red Spotlight */}
        <FilmGrain />
        <RedSpotlight />
        <CustomCursor />

        <div className="relative min-h-screen bg-black font-sans text-neutral-100">
          {/* Header Navigation */}
          <Navbar hidden={navHidden} />

          {/* Slide-out Rental Cart Drawer */}
          <CartDrawer />

          {/* Page Sections */}
          <main>
            <HeroSection />
            <ServicesSection />
            <PortfolioSection onFullscreenChange={setNavHidden} />
            <EquipmentSection />
            <RateCalculator />
            <AboutSection />
            <ContactSection />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </CartProvider>
    </SoundProvider>
  );
}
