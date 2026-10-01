"use client";

import { useEffect, useState } from "react";

export default function FilmGrain() {
  const [patternUrl, setPatternUrl] = useState<string | null>(null);

  useEffect(() => {
    const canSkip = () => {
      if (typeof window === "undefined") return true;
      const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      return motionReduced || coarsePointer;
    };

    if (canSkip()) {
      setPatternUrl(null);
      return;
    }

    const generateGrain = () => {
      const canvas = document.createElement("canvas");
      const patternSize = 64;
      canvas.width = patternSize;
      canvas.height = patternSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgData = ctx.createImageData(patternSize, patternSize);
      const buffer32 = new Uint32Array(imgData.data.buffer);
      const len = buffer32.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.16) {
          const colorVal = Math.floor(Math.random() * 255);
          const isRedTint = Math.random() < 0.06;
          const r = isRedTint ? 255 : colorVal;
          const g = isRedTint ? 0 : colorVal;
          const b = isRedTint ? 0 : colorVal;
          const a = Math.floor(Math.random() * 35 + 10);
          buffer32[i] = (a << 24) | (b << 16) | (g << 8) | r;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setPatternUrl(canvas.toDataURL());
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(generateGrain);
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    }

    const timeoutId = setTimeout(generateGrain, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!patternUrl) return null;

  return (
    <div
      data-fx="grain"
      className="pointer-events-none fixed inset-0 z-[999] transform-gpu opacity-[0.06] select-none"
      style={{
        backgroundImage: `url(${patternUrl})`,
        backgroundRepeat: "repeat",
      }}
      aria-hidden="true"
    />
  );
}


