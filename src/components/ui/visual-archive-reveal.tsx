"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Phase = "idle" | "drop" | "reveal";

interface VisualArchiveRevealProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function VisualArchiveReveal({
  videoSrc = "/showcase_video.mp4",
  posterSrc = "/showcase_poster.jpg",
}: VisualArchiveRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasAnimatedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let revealTimer = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        // Enter section → start animation once
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.32 &&
          !hasAnimatedRef.current
        ) {
          hasAnimatedRef.current = true;

          if (reduceMotion) {
            setPhase("reveal");
            void videoRef.current?.play();
            return;
          }

          setPhase("drop");
          revealTimer = window.setTimeout(() => {
            setPhase("reveal");
            void videoRef.current?.play();
          }, 1050);
          return;
        }

        // Leave upward → reset so it can play again next time
        if (
          hasAnimatedRef.current &&
          entry.intersectionRatio < 0.15 &&
          entry.boundingClientRect.top > 0
        ) {
          window.clearTimeout(revealTimer);
          hasAnimatedRef.current = false;
          setPhase("idle");
          const v = videoRef.current;
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }
      },
      { threshold: [0.15, 0.32] }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(revealTimer);
    };
  }, [reduceMotion]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    void video.play();
  }

  return (
    <section
      ref={sectionRef}
      id="archive"
      aria-labelledby="archive-title"
      className="relative overflow-hidden bg-[#050505] pt-16 md:pt-24"
    >
      {/* Heading */}
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
          Music videos, films and brand stories shot, graded and delivered by
          our crew. Keep scrolling to roll the reel.
        </p>
      </div>

      {/* Stage */}
      <div className="relative mx-auto mt-16 grid w-full place-items-center perspective-[1100px] md:mt-28 md:w-[min(1200px,calc(100%-64px))] md:aspect-video">
        {/* Ball */}
        <AnimatePresence>
          {phase !== "reveal" && (
            <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
              <motion.div
                key="ball"
                initial={{ opacity: 0, y: "-70vh", rotateX: -35, rotateZ: -120, scale: 0.72 }}
                animate={
                  phase === "drop"
                    ? {
                        opacity: 1,
                        y: [null, 18, -42, 0],
                        rotateX: [null, 18, 4, 0],
                        rotateZ: [null, 20, -8, 0],
                        scale: [null, 1.06, 0.97, 1],
                        scaleX: [null, 1.06, 0.97, 1],
                        scaleY: [null, 0.94, 0.97, 1],
                      }
                    : { opacity: 0, y: "-70vh", scale: 0.72 }
                }
                exit={{
                  opacity: 0,
                  scale: 7,
                  transition: { duration: 0.78, ease: [0.7, 0, 0.25, 1] },
                }}
                transition={
                  phase === "drop"
                    ? { duration: 1.05, ease: [0.2, 0.72, 0.24, 1], times: [0, 0.68, 0.82, 1] }
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

              {/* Shadow */}
              {phase === "drop" && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.3 }}
                  animate={{
                    opacity: [0, 0, 0.85, 0.28, 0.58],
                    scaleX: [0.3, 0.3, 1.12, 0.72, 0.9],
                  }}
                  transition={{ duration: 1.05, ease: "easeOut", times: [0, 0.42, 0.68, 0.82, 1] }}
                  className="absolute top-[calc(50%+clamp(80px,8vw,130px))] h-[26px] w-[clamp(125px,12vw,195px)] rounded-full bg-[#E50914]/30 blur-[15px]"
                />
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Video mask — circular reveal */}
        <motion.div
          className="relative z-20 aspect-video w-full overflow-hidden border border-white/15 bg-[#080808] md:rounded-none"
          initial={{ clipPath: "circle(0% at 50% 50%)", opacity: 0, borderRadius: "50%" }}
          animate={
            phase === "reveal"
              ? {
                  clipPath: "circle(78% at 50% 50%)",
                  opacity: 1,
                  borderRadius: ["50%", "28px", "0px"],
                }
              : { clipPath: "circle(0% at 50% 50%)", opacity: 0, borderRadius: "50%" }
          }
          transition={
            phase === "reveal"
              ? { duration: 1.15, delay: 0.18, ease: [0.76, 0, 0.24, 1] }
              : { duration: 0.3 }
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

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/40" />

          <p className="absolute left-4 top-3.5 text-xs font-medium text-white/80 md:left-6 md:top-5 md:text-sm">
            Director&apos;s Cut
          </p>

          <button
            type="button"
            onClick={toggleSound}
            className="absolute bottom-3.5 right-3.5 rounded-full border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white backdrop-blur md:bottom-5 md:right-5 md:px-4 md:text-sm"
            aria-label={muted ? "Turn showreel sound on" : "Mute showreel"}
          >
            {muted ? "Sound off" : "Sound on"}
          </button>
        </motion.div>
      </div>

      {/* Spacer so next section doesn't collide */}
      <div className="h-16 md:h-24" />
    </section>
  );
}