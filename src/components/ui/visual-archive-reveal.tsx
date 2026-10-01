"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
const VIDEO_SRC = "/showcase_video.mp4";
const POSTER_SRC = "/showcase_poster.jpg";

/**
 * Scroll-DRIVEN showreel reveal.
 *
 * Design rules that keep it smooth at any scroll speed:
 *  1. Every stage is a function of scroll progress (0..1) — never a setTimeout
 *     chain. Fast scrolling can therefore never "skip" or desync a stage.
 *  2. The page scroll is never hijacked: no wheel/touch preventDefault, no
 *     scrollTo/scrollBy correction, no scroll "hold" listener.
 *  3. The expanded video fills the pinned stage (a sticky block inside the
 *     page), not a `position: fixed` layer — so it never takes over a phone
 *     screen and the rest of the page stays reachable.
 *  4. Exactly one <video> element exists, it is muted + playsInline, its src is
 *     attached only when the section is near the viewport, and it is paused
 *     whenever the reveal is not open.
 */

// Scroll-progress breakpoints for each stage.
const DROP_END = 0.18;
const FLIP_START = 0.18;
const FLIP_END = 0.42;
const OPEN_START = 0.42;
const OPEN_END = 0.68;

export default function ShowreelReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const reduce = useReducedMotion();

  const [nearViewport, setNearViewport] = useState(false);
  const [muted, setMuted] = useState(true);

  // Progress through the tall wrapper: 0 = section top hits the top of the
  // screen, 1 = its bottom does.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });


  // --- Stage 1: the box drops in -------------------------------------------
  const boxY = useTransform(scrollYProgress, [0, DROP_END], ["-55vh", "0vh"]);
  const boxOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, OPEN_START, OPEN_START + 0.04],
    [0, 1, 1, 0],
  );

  // --- Stage 2: the flip ----------------------------------------------------
  const flipY = useTransform(scrollYProgress, [FLIP_START, FLIP_END], [0, 540]);
  const flipScale = useTransform(
    scrollYProgress,
    [FLIP_START, FLIP_START + 0.12, FLIP_END, OPEN_START + 0.04],
    [1, 1.18, 1, 1.3],
  );
  const glow = useTransform(
    scrollYProgress,
    [FLIP_END - 0.06, OPEN_START],
    ["0 20px 60px -20px rgba(0,0,0,0.6)", "0 0 90px 12px hsl(357 92% 47% / 0.55)"],
  );

  // --- Stage 3: the expand --------------------------------------------------
  // The clip-path starts exactly where the box sits, so the handoff is seamless.
  // Percentage-only inset: mixing % and px is what makes an expand snap
  // instead of glide.
  const [startInset, setStartInset] = useState({ y: 38, x: 38 });
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const box = boxRef.current;
      if (!stage || !box) return;
      const s = stage.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      if (!s.width || !s.height) return;
      setStartInset({
        y: Math.max(0, ((s.height - b.height) / 2 / s.height) * 100),
        x: Math.max(0, ((s.width - b.width) / 2 / s.width) * 100),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const insetY = useTransform(scrollYProgress, [OPEN_START, OPEN_END], [startInset.y, 0]);
  const insetX = useTransform(scrollYProgress, [OPEN_START, OPEN_END], [startInset.x, 0]);
  const radius = useTransform(scrollYProgress, [OPEN_START, OPEN_END], [20, 0]);
  const clip = useTransform(
    [insetY, insetX, radius],
    ([y, x, r]: number[]) => `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`,
  );
  // Hidden until the box has finished flipping, so it can never peek through.
  const stageOpacity = useTransform(
    scrollYProgress,
    [OPEN_START - 0.01, OPEN_START + 0.01],
    [0, 1],
  );
  const stageScale = useTransform(scrollYProgress, [OPEN_START, OPEN_END], [1.25, 1]);
  const stageBrightness = useTransform(
    scrollYProgress,
    [OPEN_START, OPEN_END],
    ["brightness(0.35)", "brightness(1)"],
  );
  const chromeOpacity = useTransform(scrollYProgress, [OPEN_END - 0.04, OPEN_END], [0, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04, OPEN_START], [1, 1, 0]);


  // Attach the video source only when the section is close, so scrolling past
  // the top of the page never pays for a video decode.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play only while the reveal is actually open; pause otherwise. This is the
  // single biggest win against scroll lag.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const v = videoRef.current;
    if (!v) return;
    const shouldPlay = p > OPEN_START - 0.04 && p < 1;
    if (shouldPlay && v.paused) void v.play().catch(() => {});
    if (!shouldPlay && !v.paused) v.pause();
  });

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.volume = 1;
    setMuted(v.muted);
  };

  return (
    // Tall wrapper = the scroll budget for the whole sequence.
    // No `overflow: hidden` here or on any ancestor, or sticky stops working.
    <div ref={wrapRef} className="relative h-[280vh] w-full bg-background">
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden"
      >
        {/* Expanding video stage — fills this pinned block, never the device */}
        <motion.div
          style={{
            clipPath: reduce ? "inset(0% 0% 0% 0% round 0px)" : clip,
            opacity: reduce ? 1 : stageOpacity,
            willChange: "clip-path",
          }}
          className="absolute inset-0 bg-black"
        >

          <motion.div
            style={{
              scale: reduce ? 1 : stageScale,
              filter: reduce ? "none" : stageBrightness,
            }}
            className="h-full w-full transform-gpu"
          >
            <video
              ref={videoRef}
              src={nearViewport ? VIDEO_SRC : undefined}
              poster={POSTER_SRC}
              preload="none"
              muted
              loop
              playsInline
              disablePictureInPicture
              controlsList="nodownload noplaybackrate nofullscreen"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </motion.div>

          <motion.div
            style={{ opacity: chromeOpacity }}
            className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-10"
          >
            <p className="font-display text-2xl uppercase tracking-[0.2em] text-foreground md:text-4xl">
              Director&rsquo;s Cut
            </p>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? "Unmute showreel" : "Mute showreel"}
              className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {muted ? "Sound off" : "Sound on"}
            </button>
          </motion.div>
        </motion.div>

        {/* Dropping + flipping box */}
        <motion.div
          ref={boxRef}

          style={{
            y: reduce ? 0 : boxY,
            opacity: boxOpacity,
            scale: reduce ? 1 : flipScale,
            boxShadow: glow,
            perspective: 1400,
            willChange: "transform, opacity",
          }}
          className="relative z-10 h-44 w-44 transform-gpu md:h-60 md:w-60"
        >
          <motion.div
            style={{
              rotateY: reduce ? 180 : flipY,
              transformStyle: "preserve-3d",
            }}
            className="h-full w-full"
          >
            <div
              className="absolute inset-0 grid place-items-center border border-border bg-card font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground"
              style={{ backfaceVisibility: "hidden" }}
            >
              Archive
            </div>
            <div
              className="absolute inset-0 grid place-items-center overflow-hidden bg-primary font-mono text-xs uppercase tracking-[0.35em] text-primary-foreground"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <img
                src={POSTER_SRC}
                alt=""
                aria-hidden
                width={1600}
                height={912}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <span className="relative">Reel</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.span
          style={{ opacity: hintOpacity }}
          className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
        >
          Keep scrolling
        </motion.span>
      </div>
    </div>
  );
}
