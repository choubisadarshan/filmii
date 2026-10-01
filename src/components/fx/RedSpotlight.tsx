"use client";

import { useEffect, useRef } from "react";

export default function RedSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch / mobile devices
    if (typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768)) {
      return;
    }

    const el = spotlightRef.current;
    if (!el) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      });
    };

    const handleMouseLeave = () => {
      if (el) el.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      data-fx="spotlight"
      ref={spotlightRef}
      className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full z-10 opacity-0 transition-opacity duration-500 transform-gpu"
      style={{
        background: "radial-gradient(circle, rgba(229, 9, 20, 0.12) 0%, rgba(180, 0, 0, 0.04) 40%, transparent 70%)",
        willChange: "transform, opacity",
      }}
      aria-hidden="true"
    />
  );
}

