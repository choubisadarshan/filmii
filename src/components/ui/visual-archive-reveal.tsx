"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "drop" | "ready" | "reveal";

interface VisualArchiveRevealProps {
  videoSrc?: string;
  posterSrc?: string;
  onFullscreenChange?: (hidden: boolean) => void;
}

export default function VisualArchiveReveal({
  videoSrc = "/showcase_video.mp4",
  posterSrc = "/showcase_poster.jpg",
  onFullscreenChange,
}: VisualArchiveRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const wasIntersectingRef = useRef(false);
  const dropTimerRef = useRef<number | undefined>(undefined);

  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const reduceMotion = useReducedMotion();

  /* ---------------------------------------------------------
   * RESPONSIVE CHECK
   * --------------------------------------------------------- */

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ---------------------------------------------------------
   * SCROLL PROGRESS (DESKTOP SHRINK ONLY)
   *
   * Desktop: after the circular reveal, scrolling shrinks the
   * fullscreen video down to max 1200px.
   *
   * Mobile: NO shrink. The video is always full width, 16:9.
   * --------------------------------------------------------- */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const desktopWidth = useTransform(
    scrollYProgress,
    [0.62, 0.82],
    ["100vw", "min(1200px, calc(100vw - 64px))"],
  );

  const videoScale = useTransform(
    scrollYProgress,
    [0.62, 0.82],
    [1, 0.96],
  );

  /* ---------------------------------------------------------
   * BALL ENTRY
   * --------------------------------------------------------- */

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          if (wasIntersectingRef.current) return;

          wasIntersectingRef.current = true;

          // Don't replay the ball when coming back upward.
          if (entry.boundingClientRect.top < 0) return;

          if (reduceMotion) {
            setPhase("ready");
            return;
          }

          setPhase("drop");

          dropTimerRef.current = window.setTimeout(() => {
            dropTimerRef.current = undefined;
            // Ball finished bouncing — wait for the user to click PLAY.
            setPhase("ready");
          }, 1100);
        } else {
          wasIntersectingRef.current = false;

          if (dropTimerRef.current !== undefined) {
            window.clearTimeout(dropTimerRef.current);
            dropTimerRef.current = undefined;
          }
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(stage);

    return () => {
      observer.disconnect();

      if (dropTimerRef.current !== undefined) {
        window.clearTimeout(dropTimerRef.current);
      }
    };
  }, [reduceMotion]);

  /* ---------------------------------------------------------
   * PLAY / CIRCULAR REVEAL
   * --------------------------------------------------------- */

  function startVideoReveal() {
    if (phase !== "ready") return;

    setPhase("reveal");
    onFullscreenChange?.(true);

    const video = videoRef.current;

    if (video) {
      video.currentTime = 0;
      video.muted = muted;

      void video.play().catch(() => {
        // Browser autoplay restriction.
      });
    }
  }

  /* ---------------------------------------------------------
   * SOUND
   * --------------------------------------------------------- */

  function toggleSound() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);

    void video.play();
  }

  /* ---------------------------------------------------------
   * VIDEO SIZING
   *
   * Mobile  -> always 100vw wide, 16:9, never scales.
   * Desktop -> 100vw, then shrinks on scroll during "reveal".
   * --------------------------------------------------------- */

  const shrinkOnDesktop = !isMobile && phase === "reveal";

  // Ball fall distance: shorter on mobile because the stage is only video-height.
  const dropFrom = isMobile ? "-45vh" : "-110vh";

  /* ---------------------------------------------------------
   * RENDER
   * --------------------------------------------------------- */

  return (
    <section
      ref={sectionRef}
      id="archive"
      aria-labelledby="archive-title"
      className="relative overflow-x-clip bg-[#050505] pt-16 md:pt-24"
    >
      {/* HEADER */}

      <div className="mx-auto flex w-[min(1280px,calc(100%-36px))] flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 md:w-[min(1280px,calc(100%-64px))] md:flex-row md:items-end md:gap-16">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">
            03 / Selected work
          </p>

          <h2
            id="archive-title"
            className="font-display text-[clamp(3.5rem,18vw,6rem)] font-normal uppercase leading-[0.95] tracking-[0.05em] text-white md:text-[clamp(4.25rem,7vw,6rem)]"
          >
            VISUAL <span className="text-neutral-500">ARCHIVE</span>
          </h2>
        </div>

        <p className="max-w-md text-sm font-light leading-relaxed text-neutral-400 md:text-base">
          Music videos, films and brand stories shot, graded and
          delivered by our crew. Keep scrolling to roll the reel.
        </p>
      </div>

      {/* CINEMATIC STAGE
          Mobile has no shrink phase, so the sticky track is shorter. */}

      <div
        ref={stageRef}
        className="relative mt-16 w-full md:mt-28 md:min-h-[180vh]"
      >
        {/* Mobile: stage is exactly the video's 16:9 size (no black bars, no sticky).
            Desktop: full-screen sticky stage for the shrink effect. */}
        <div className="relative flex aspect-video w-full items-center justify-center md:sticky md:top-0 md:aspect-auto md:h-screen md:overflow-hidden">
          {/* BALL */}

          <AnimatePresence>
            {phase !== "reveal" && (
              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                <motion.div
                  key="ball"
                  initial={{
                    opacity: 0,
                    y: dropFrom,
                    rotateX: -35,
                    rotateZ: -120,
                    scale: 0.72,
                  }}
                  animate={
                    phase === "drop"
                      ? {
                          opacity: [0, 1, 1, 1],
                          y: [dropFrom, "0vh", "-7vh", "0vh"],
                          rotateX: [-35, 18, 4, 0],
                          rotateZ: [-120, 20, -8, 0],
                          scale: [0.72, 1.06, 0.97, 1],
                          scaleX: [1, 1.06, 0.97, 1],
                          scaleY: [0.72, 0.94, 0.97, 1],
                        }
                      : {
                          opacity: phase === "ready" ? 1 : 0,
                          y: "0vh",
                          rotateX: 0,
                          rotateZ: 0,
                          scale: 1,
                        }
                  }
                  exit={{
                    opacity: 0,
                    scale: 7,
                    transition: {
                      duration: 0.78,
                      ease: [0.7, 0, 0.25, 1],
                    },
                  }}
                  transition={
                    phase === "drop"
                      ? {
                          duration: 1.05,
                          ease: [0.2, 0.72, 0.24, 1],
                          times: [0, 0.68, 0.84, 1],
                        }
                      : { duration: 0.3 }
                  }
                  className="relative aspect-square w-[clamp(130px,13vw,210px)] overflow-hidden rounded-full border border-white/30"
                  style={{
                    background:
                      "radial-gradient(circle at 31% 24%, rgba(255,255,255,0.95) 0 2%, rgba(255,255,255,0.28) 5%, transparent 19%), radial-gradient(circle at 35% 30%, #ff5b63 0, #e50914 24%, #6d0208 62%, #130002 83%)",
                    boxShadow:
                      "inset -28px -32px 48px rgba(0,0,0,0.72), inset 14px 12px 30px rgba(255,255,255,0.13), 0 0 55px rgba(229,9,20,0.38)",
                  }}
                >
                  <span className="absolute left-[18%] top-[13%] h-[21%] w-[42%] -rotate-[28deg] rounded-full bg-white/20 blur-[13px]" />
                </motion.div>

                {/* Ball shadow */}
                {phase === "drop" && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.3 }}
                    animate={{
                      opacity: [0, 0, 0.85, 0.28, 0.58],
                      scaleX: [0.3, 0.3, 1.12, 0.72, 0.9],
                    }}
                    transition={{
                      duration: 1.05,
                      ease: "easeOut",
                      times: [0, 0.42, 0.68, 0.82, 1],
                    }}
                    className="absolute top-[calc(50%+clamp(80px,8vw,130px))] h-[26px] w-[clamp(125px,12vw,195px)] rounded-full bg-[#E50914]/30 blur-[15px]"
                  />
                )}
              </div>
            )}
          </AnimatePresence>

          {/* PLAY BUTTON + ROTATING DOTTED RING */}

          <AnimatePresence>
            {phase === "ready" && (
              <motion.button
                type="button"
                onClick={startVideoReveal}
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="group absolute z-[60] flex aspect-square w-[clamp(150px,16vw,220px)] items-center justify-center rounded-full"
                aria-label="Play showreel"
              >
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-dashed border-white/70"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />

                <motion.span
                  className="absolute inset-[10px] rounded-full border border-white/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                <span className="relative flex aspect-square w-[68px] items-center justify-center rounded-full border border-white/40 bg-black/70 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                  <Play size={25} fill="white" className="ml-1 text-white" />
                </span>

                <span className="absolute -bottom-9 whitespace-nowrap text-[10px] uppercase tracking-[0.28em] text-white/70">
                  Play Showreel
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* VIDEO */}

          <motion.div
            className="relative z-20 overflow-hidden bg-black"
            style={{
              // Mobile: fixed full width. Desktop: shrinks on scroll.
              width: shrinkOnDesktop ? desktopWidth : "100vw",

              // Always 16:9 — on mobile it never changes.
              aspectRatio: "16 / 9",

              // Scale only on desktop.
              scale: shrinkOnDesktop ? videoScale : 1,

              transformOrigin: "center center",

              willChange: shrinkOnDesktop
                ? "clip-path, width, transform"
                : "clip-path",
            }}
            initial={{
              clipPath: "circle(0% at 50% 50%)",
              opacity: 0,
              borderRadius: "50%",
            }}
            animate={
              phase === "reveal"
                ? {
                    clipPath: "circle(75% at 50% 50%)",
                    opacity: 1,
                    borderRadius: ["50%", "35%", "0%"],
                  }
                : {
                    clipPath: "circle(0% at 50% 50%)",
                    opacity: 0,
                    borderRadius: "50%",
                  }
            }
            transition={
              phase === "reveal"
                ? { duration: 1.15, ease: [0.76, 0, 0.24, 1] }
                : { duration: 0.25 }
            }
          >
            <video
              ref={videoRef}
              className="block h-full w-full object-cover"
              poster={posterSrc}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              aria-label="Onset Production director's cut showreel"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>

            {/* Cinematic overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/40" />

            {/* Label */}
            <p className="absolute left-4 top-3.5 text-xs font-medium text-white/80 md:left-6 md:top-5 md:text-sm">
              Director&apos;s Cut
            </p>

            {/* Sound button */}
            <button
              type="button"
              onClick={toggleSound}
              className="absolute bottom-3.5 right-3.5 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white backdrop-blur md:bottom-5 md:right-5 md:px-4 md:text-sm"
              aria-label={muted ? "Turn showreel sound on" : "Mute showreel"}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "Sound off" : "Sound on"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 md:h-24" />
    </section>
  );
}