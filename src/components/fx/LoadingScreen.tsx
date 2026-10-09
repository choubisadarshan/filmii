"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";

// How long the intro lasts. Long enough for the clapperboard logo to finish animating.
const LOADER_DURATION = 2200; // ms
const HOLD_AT_100 = 250; // ms

// Module-level: lives as long as the page is open (a full reload resets it),
// and survives in-app navigation. So the intro plays on every fresh load of
// the home page, but NOT when you come back from a /work/<category> page.
let introShown = false;

function shouldSkipIntro() {
  if (introShown) return true;
  try {
    // If the browser first loaded some other page (e.g. a /work/ page) and we
    // arrived at home by in-app navigation, this is a return visit: skip.
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && new URL(nav.name).pathname !== "/") return true;
  } catch {
    // fall through: show the intro
  }
  return false;
}

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  // Decided once at mount (server always renders the loader: matches a fresh load)
  const [alreadySeen] = useState(() => (typeof window === "undefined" ? false : shouldSkipIntro()));
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (alreadySeen) {
      onComplete?.();
      return;
    }

    introShown = true;

    const start = performance.now();
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      const t = Math.min((performance.now() - start) / LOADER_DURATION, 1);
      setProgress(Math.round((1 - Math.pow(1 - t, 2.2)) * 100));

      if (t >= 1) {
        // Stop ticking at 100%: nothing keeps running afterwards
        clearInterval(timer);
        finishTimer = setTimeout(() => {
          setIsDone(true);
          onComplete?.();
        }, HOLD_AT_100);
      }
    }, 50);

    return () => {
      clearInterval(timer);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [alreadySeen, onComplete]);

  const show = !alreadySeen && !isDone;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ willChange: "transform, opacity" }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 select-none"
        >
          {/* Center Slate Clapperboard & Title */}
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md">
            <motion.div
              initial={{ rotate: -12 }}
              animate={{ rotate: [ -12, 0, -5, 0 ] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ willChange: "transform, opacity" }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-900 border-2 border-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.4)]"
            >
              <Film className="w-12 h-12 text-red-500 animate-pulse" />
              
              {/* Clapperboard Top Strip */}
              <motion.div
                initial={{ rotate: -25 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001, delay: 0.3 }}
                style={{ willChange: "transform, opacity" }}
                className="absolute -top-4 left-0 right-0 h-4 bg-red-600 border-b-2 border-black rounded-t-md flex items-center justify-between px-2 overflow-hidden"
              >
                <div className="w-2 h-full bg-white transform -skew-x-12" />
                <div className="w-2 h-full bg-white transform -skew-x-12" />
                <div className="w-2 h-full bg-white transform -skew-x-12" />
              </motion.div>
            </motion.div>

            <div className="text-center">
              <h1 className="font-display text-4xl sm:text-6xl tracking-wider text-white uppercase">
                ONSET<span className="text-red-600">PRODUCTION</span>
              </h1>
            </div>

            {/* Progress Bar & Numeric Indicator */}
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center font-mono text-[13px]">
                <span className="text-neutral-500 uppercase tracking-widest">Initializing On-Set Rig</span>
                <span className="text-red-500 font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full w-full origin-left bg-gradient-to-r from-red-800 to-red-600 shadow-[0_0_12px_#ff0000] transition-transform duration-100 ease-out"
                  style={{ transform: `scaleX(${progress / 100})`, willChange: "transform" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}