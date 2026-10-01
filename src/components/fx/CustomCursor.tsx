"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(pointer: coarse), (max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
}

function getServerSnapshot() {
  return false;
}

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Framer Motion continuous motion values for ultra-smooth tracking
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Physics-based spring trailing animation for outer aura
  const auraSpringConfig = { damping: 28, stiffness: 450, mass: 0.08 };
  const auraX = useSpring(mouseX, auraSpringConfig);
  const auraY = useSpring(mouseY, auraSpringConfig);

  // High-stiffness spring for central red dot pointer
  const dotSpringConfig = { damping: 32, stiffness: 850, mass: 0.03 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    if (isMobile) return;

    let isScheduled = false;
    let pendingTarget: HTMLElement | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      pendingTarget = e.target as HTMLElement | null;

      if (!isScheduled) {
        isScheduled = true;
        requestAnimationFrame(() => {
          isScheduled = false;
          const target = pendingTarget;
          if (
            target?.tagName === "BUTTON" ||
            target?.tagName === "A" ||
            target?.tagName === "INPUT" ||
            target?.tagName === "SELECT" ||
            target?.tagName === "TEXTAREA" ||
            target?.closest("button") ||
            target?.closest("a") ||
            target?.closest("[data-cursor]")
          ) {
            setIsHovered(true);
          } else {
            setIsHovered(false);
          }
        });
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mouseX, mouseY, isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer Spring-Animated Red Laser Aura */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99998] w-6 h-6 rounded-full bg-[#E50914]/25 blur-[2px]"
        style={{
          x: auraX,
          y: auraY,
          translateX: "-50%",
          translateY: "-50%",
          transformPerspective: 1000,
          willChange: "transform, opacity",
        }}
        animate={{
          scale: isClicking ? 0.6 : isHovered ? 1.4 : 0.8,
          opacity: isHovered ? 0.9 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.5, restDelta: 0.001 }}
      />

      {/* Central Framer Motion Red Dot Pointer */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999] w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_10px_#E50914]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          transformPerspective: 1000,
          willChange: "transform, opacity",
        }}
        animate={{
          scale: isClicking ? 0.5 : isHovered ? 1.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.3, restDelta: 0.001 }}
      />
    </>
  );
}
