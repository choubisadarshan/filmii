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

const DROP_DURATION = 1.5; // seconds: fall + 2 bounces + settle
const BOUNCE_TIMES = [0, 0.5, 0.65, 0.8, 0.9, 1];

type Phase = "idle" | "drop" | "ready" | "reveal" | "paused";

interface VisualArchiveRevealProps {
  videoSrc?: string;
  mobileVideoSrc?: string;
  posterSrc?: string;
  onFullscreenChange?: (hidden: boolean) => void;
}

export default function VisualArchiveReveal({
  videoSrc = "/showcase_video.mp4",
  mobileVideoSrc,
  posterSrc = "/showcase_poster.jpg",
  onFullscreenChange,
}: VisualArchiveRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const clickScrollYRef = useRef(0);
  // true while the user has been to the Hero and the ball/reveal has not been used yet
  const hasVisitedHeroRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");

  const wasIntersectingRef = useRef(false);
  const dropTimerRef = useRef<number | undefined>(undefined);

  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [revealedOnce, setRevealedOnce] = useState(false);
  // Pixel values (numbers animate far smoother than "vh" strings). Set right before the drop.
  const [drop, setDrop] = useState({ from: -800, b1: 56, b2: 18 });

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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
   * HERO FLAG  (hasVisitedHero)
   *
   * true  -> user has been at the Hero: next time they scroll down
   *          into the video, the ball + reveal plays.
   * false -> ball/reveal was already used: the video is simply there.
   *
   * Becomes true every time the Hero is visible (also re-arms the
   * animation when the user scrolls all the way back up).
   * Becomes false once the ball animation has played.
   *
   * The Hero is the first <section> inside <main>, so no other
   * file needs to be touched.
   * --------------------------------------------------------- */

  useEffect(() => {
    const hero = document.querySelector("main > section");

    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;

      hasVisitedHeroRef.current = true;

      // Re-arm: stop/rewind the video and put the ball back,
      // so the animation plays again on the next scroll down.
      const video = videoRef.current;

      if (video && !video.paused) {
        video.pause();
        if (video.readyState > 0) video.currentTime = 0;
      }

      onFullscreenChange?.(false);
      setRevealedOnce(false);
      setPhase((p) => (p === "drop" ? p : "idle"));
    });

    observer.observe(hero);

    return () => observer.disconnect();
  }, [onFullscreenChange]);

  /* ---------------------------------------------------------
   * VIDEO SECTION ENTRY
   *
   * - flag true  -> ball drops (once ~75% of the stage is visible)
   * - flag false -> no ball, the normal (paused) video is shown
   * --------------------------------------------------------- */

  useEffect(() => {
    const stage = stickyRef.current;

    if (!stage) return;

    // Normal video: no ball, no circle animation.
    const showNormalVideo = () => {
      setRevealedOnce(true);
      setPhase((p) => (p === "idle" ? "paused" : p));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        const ratio = entry.intersectionRatio;

        if (ratio > 0 && !hasVisitedHeroRef.current) {
          // Ball already dropped and is waiting for a click: keep it there,
          // never reveal the video without a click.
          if (phaseRef.current === "ready") return;

          showNormalVideo();
          return;
        }

        if (ratio >= 0.75) {
          if (wasIntersectingRef.current) return;

          wasIntersectingRef.current = true;

          if (!hasVisitedHeroRef.current) return;

          // Reduced motion: static ball, no animation.
          if (reduceMotion) {
            hasVisitedHeroRef.current = false;
            setPhase("ready");
            return;
          }

          const mobile = window.innerWidth < 768;
          const h = window.innerHeight;

          setDrop({
            // desktop stage clips at the screen edge, so start just above it
            from: -Math.round(mobile ? h * 0.45 : h / 2 + 240),
            b1: mobile ? 34 : 56,
            b2: mobile ? 10 : 18,
          });
          setPhase("drop");

          dropTimerRef.current = window.setTimeout(() => {
            dropTimerRef.current = undefined;

            // Ball animation finished: flag is used up.
            hasVisitedHeroRef.current = false;
            setPhase("ready");
          }, DROP_DURATION * 1000 + 50);
        } else if (ratio < 0.2) {
          wasIntersectingRef.current = false;

          if (dropTimerRef.current !== undefined) {
            window.clearTimeout(dropTimerRef.current);
            dropTimerRef.current = undefined;
          }

          // Left the section mid-drop: reset so the next entry drops the ball again.
          // If the ball is already waiting ("ready"), it stays until the user clicks it.
          setPhase((p) => (p === "drop" ? "idle" : p));
        }
      },
      { threshold: [0, 0.2, 0.75] },
    );

    observer.observe(stage);

    return () => {
      observer.disconnect();

      if (dropTimerRef.current !== undefined) {
        window.clearTimeout(dropTimerRef.current);
        dropTimerRef.current = undefined;
      }
    };
  }, [reduceMotion]);

  /* ---------------------------------------------------------
   * PLAY / CIRCULAR REVEAL
   * --------------------------------------------------------- */

  function playFromStart() {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = 0;

    // The tap is a user gesture, so browsers allow sound here.
    video.muted = false;
    video.volume = 1;
    setMuted(false);

    void video.play().catch((err: unknown) => {
      // pause() while play() is pending rejects with AbortError: that is us
      // stopping the video on purpose, not a blocked autoplay.
      if (err instanceof DOMException && err.name === "AbortError") return;

      // The user may already have scrolled away (video stopped): do nothing then.
      if (phaseRef.current !== "reveal") return;

      // Rare: sound blocked. Fall back to muted playback.
      video.muted = true;
      setMuted(true);
      void video.play().catch(() => {});
    });
  }

  function startVideoReveal() {
    // Coming back later: the video is already on screen, just play it.
    if (phase === "paused") {
      setPhase("reveal");
      playFromStart();
      return;
    }

    if (phase !== "ready") return;

    hasVisitedHeroRef.current = false; // animation used up
    setPhase("reveal");

    // Hide the navbar only on desktop, where the video goes full-screen.
    if (!isMobile) {
      clickScrollYRef.current = window.scrollY;
      onFullscreenChange?.(true);
    }

    playFromStart();
  }

  /* ---------------------------------------------------------
   * STOP + RESET when the user scrolls away
   *
   * Video and audio stop, rewind to 0 and the ball/play button
   * comes back. Tapping again plays from the start with sound.
   * --------------------------------------------------------- */

  useEffect(() => {
    if (phase !== "reveal") return;

    // Observe the stage wrapper (never clipped/hidden), NOT the video box,
    // which starts at clip-path: circle(0%) / opacity 0 during the reveal.
    const box = stickyRef.current;
    if (!box) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Ratio check: isIntersecting stays true until fully off-screen.
        if (!entry || entry.intersectionRatio >= 0.3) return;

        const video = videoRef.current;

        if (video) {
          video.pause();
          video.currentTime = 0;
        }

        phaseRef.current = "paused";
        onFullscreenChange?.(false);
        setRevealedOnce(true);
        setPhase("paused");
      },
      { threshold: 0.3 },
    );

    observer.observe(box);

    return () => observer.disconnect();
  }, [phase, onFullscreenChange]);

  /* ---------------------------------------------------------
   * NAVBAR: hidden only while the video sits full-screen on
   * desktop. As soon as the user scrolls, it comes back.
   * --------------------------------------------------------- */

  useEffect(() => {
    if (phase !== "reveal" || isMobile) return;

    const onScroll = () => {
      if (Math.abs(window.scrollY - clickScrollYRef.current) > 30) {
        onFullscreenChange?.(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, isMobile, onFullscreenChange]);

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

  const shrinkOnDesktop =
    !isMobile && (phase === "reveal" || phase === "paused");


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
        <div
          ref={stickyRef}
          className="relative flex aspect-video w-full items-center justify-center md:sticky md:top-0 md:aspect-auto md:h-screen md:overflow-hidden"
        >
          {/* BALL (transform + opacity only, so it runs on the GPU) */}

          <AnimatePresence>
            {phase !== "reveal" && phase !== "paused" && (
              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                <motion.div
                  key="ball"
                  initial={{ opacity: 0, y: drop.from, scaleX: 0.97, scaleY: 1.05 }}
                  animate={
                    phase === "drop"
                      ? {
                          opacity: 1,
                          y: [drop.from, 0, -drop.b1, 0, -drop.b2, 0],
                          scaleY: [1.05, 0.82, 1.02, 0.92, 1.01, 1],
                          scaleX: [0.97, 1.12, 0.99, 1.06, 0.995, 1],
                        }
                      : {
                          opacity: phase === "ready" ? 1 : 0,
                          y: 0,
                          scaleX: 1,
                          scaleY: 1,
                        }
                  }
                  exit={{
                    opacity: 0,
                    scale: 4,
                    originY: 0.5,
                    transition: { duration: 0.65, ease: [0.7, 0, 0.25, 1] },
                  }}
                  transition={
                    phase === "drop"
                      ? {
                          opacity: { duration: 0.15 },
                          y: {
                            duration: DROP_DURATION,
                            times: BOUNCE_TIMES,
                            // fall = ease-in (gravity), each rise = ease-out, each fall = ease-in
                            ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
                          },
                          scaleX: { duration: DROP_DURATION, times: BOUNCE_TIMES, ease: "linear" },
                          scaleY: { duration: DROP_DURATION, times: BOUNCE_TIMES, ease: "linear" },
                        }
                      : { duration: 0.25 }
                  }
                  className="relative aspect-square w-[clamp(130px,13vw,210px)] overflow-hidden rounded-full border border-white/30"
                  style={{
                    originY: 1, // squash from the ground, not the center
                    willChange: "transform, opacity",
                    background:
                      "radial-gradient(circle at 31% 24%, rgba(255,255,255,0.95) 0 2%, rgba(255,255,255,0.28) 5%, transparent 19%), radial-gradient(circle at 35% 30%, #ff5b63 0, #e50914 24%, #6d0208 62%, #130002 83%)",
                    boxShadow:
                      "inset -28px -32px 48px rgba(0,0,0,0.72), inset 14px 12px 30px rgba(255,255,255,0.13), 0 0 55px rgba(229,9,20,0.38)",
                  }}
                >
                  <span className="absolute left-[18%] top-[13%] h-[21%] w-[42%] -rotate-[28deg] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3),transparent_70%)]" />
                </motion.div>

                {/* Ball shadow (gradient instead of blur filter) */}
                {(phase === "drop" || phase === "ready") && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.2 }}
                    animate={
                      phase === "drop"
                        ? {
                            opacity: [0, 0.75, 0.4, 0.7, 0.5, 0.6],
                            scaleX: [0.2, 1.15, 0.8, 1.05, 0.95, 1],
                          }
                        : { opacity: 0.6, scaleX: 1 }
                    }
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={
                      phase === "drop"
                        ? { duration: DROP_DURATION, times: BOUNCE_TIMES, ease: "linear" }
                        : { duration: 0.2 }
                    }
                    style={{
                      willChange: "transform, opacity",
                      background:
                        "radial-gradient(ellipse at center, rgba(229,9,20,0.5) 0%, rgba(229,9,20,0.18) 45%, transparent 70%)",
                    }}
                    className="absolute top-[calc(50%+clamp(80px,8vw,130px))] h-[34px] w-[clamp(140px,14vw,220px)] rounded-full"
                  />
                )}
              </div>
            )}
          </AnimatePresence>

          {/* PLAY BUTTON (glass core + light-sweep ring + pulse ripples) */}

          <AnimatePresence>
            {phase === "ready" && (
              <motion.button
                type="button"
                onClick={startVideoReveal}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: "transform, opacity" }}
                className="group absolute z-[60] flex aspect-square w-[clamp(150px,16vw,220px)] items-center justify-center rounded-full outline-none"
                aria-label="Play showreel with sound"
              >
                {/* Pulse ripples */}
                {[0, 1].map((i) => (
                  <motion.span
                    key={i}
                    style={{ willChange: "transform, opacity" }}
                    className="absolute inset-0 rounded-full border border-[#E50914]/70"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 1.2,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Rotating light-sweep ring */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    willChange: "transform",
                    background:
                      "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.95) 70deg, rgba(229,9,20,0.9) 120deg, rgba(255,255,255,0) 190deg, rgba(255,255,255,0) 360deg)",
                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                />

                {/* Faint static ring */}
                <span className="absolute inset-0 rounded-full border border-white/15" />

                {/* Frosted glass core with play icon */}
                <span className="relative flex aspect-square w-[34%] min-w-[64px] items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-colors duration-300 group-hover:bg-white/20">
                  <Play size={26} fill="white" className="ml-1 text-white drop-shadow" />
                </span>

                {/* Label pill */}
                <span className="absolute -bottom-9 flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/65 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/80">
                  <Volume2 size={12} className="text-[#E50914]" />
                  Play showreel
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
              phase === "reveal" || phase === "paused"
                ? {
                    clipPath: "circle(75% at 50% 50%)",
                    opacity: 1,
                    // First reveal morphs the corners; afterwards it just stays put.
                    borderRadius: revealedOnce ? "0%" : ["50%", "35%", "0%"],
                  }
                : {
                    clipPath: "circle(0% at 50% 50%)",
                    opacity: 0,
                    borderRadius: "50%",
                  }
            }
            transition={
              phase === "paused"
                ? { duration: 0 }
                : phase === "reveal"
                  ? { duration: 1.15, ease: [0.76, 0, 0.24, 1] }
                  : { duration: 0.25 }
            }
          >
            <video
              ref={videoRef}
              src={isMobile && mobileVideoSrc ? mobileVideoSrc : videoSrc}
              className="block h-full w-full object-cover"
              poster={posterSrc}
              muted={muted}
              loop
              playsInline
              preload="none"
              aria-label="Onset Production director's cut showreel"
            />

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
              className="absolute bottom-3.5 right-3.5 flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3.5 py-2 text-xs text-white md:bottom-5 md:right-5 md:px-4 md:text-sm"
              aria-label={muted ? "Turn showreel sound on" : "Mute showreel"}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "Sound off" : "Sound on"}
            </button>

            {/* Tap to play (shown when the video was stopped after scrolling away) */}
            <AnimatePresence>
              {phase === "paused" && (
                <motion.button
                  type="button"
                  onClick={startVideoReveal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/35 outline-none"
                  aria-label="Play showreel with sound"
                >
                  <span className="flex aspect-square w-[72px] items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-110 md:w-[88px]">
                    <Play size={28} fill="white" className="ml-1 text-white drop-shadow" />
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/80">
                    <Volume2 size={12} className="text-[#E50914]" />
                    Tap to play
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 md:h-24" />
    </section>
  );
}