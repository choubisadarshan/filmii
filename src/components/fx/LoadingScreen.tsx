"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Skip loader on repeat visits in same session
    if (typeof window !== "undefined" && sessionStorage.getItem("onset_loader_seen")) {
      queueMicrotask(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      });
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          try {
            sessionStorage.setItem("onset_loader_seen", "true");
          } catch {
            // sessionStorage unavailable fallback
          }
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 150);
          return 100;
        }
        const diff = Math.floor(Math.random() * 20) + 15;
        return Math.min(prev + diff, 100);
      });
    }, 40);

    return () => {
      clearInterval(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
          style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 select-none"
        >
          {/* Center Slate Clapperboard & Title */}
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md">
            <motion.div
              initial={{ rotate: -12 }}
              animate={{ rotate: [ -12, 0, -5, 0 ] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-900 border-2 border-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.4)]"
            >
              <Film className="w-12 h-12 text-red-500 animate-pulse" />
              
              {/* Clapperboard Top Strip */}
              <motion.div
                initial={{ rotate: -25 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001, delay: 0.3 }}
                style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
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
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-neutral-500 uppercase tracking-widest">Initializing On-Set Rig</span>
                <span className="text-red-500 font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-800 to-red-600 shadow-[0_0_12px_#ff0000]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

