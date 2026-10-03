"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * SCROLL  = enter / exit only
 * TIME    = cinematic ball + circle reveal (replays on each downward entry)
 */
const T_DROP = 800;
const T_B1 = 1300;
const T_B2 = 1600;
const T_TOTAL = 2400;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Status = "idle" | "running" | "expanded" | "normal";

interface ShowreelRevealProps {
  videoSrc: string;
  posterSrc?: string;
  onFullscreenChange?: (hidden: boolean) => void;
}

export default function ShowreelReveal({
  videoSrc,
  posterSrc,
  onFullscreenChange,
}: ShowreelRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingStageTopRef = useRef<number | null>(null);

  const [muted, setMuted] = useState(true);
  const [phase, setPhase] = useState<Status>("idle");
  const [videoReady, setVideoReady] = useState(false);

  useLayoutEffect(() => {
    const previousTop = pendingStageTopRef.current;
    const stage = stageRef.current;
    if (previousTop === null || !stage) return;

    pendingStageTopRef.current = null;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + stage.getBoundingClientRect().top - previousTop);
    root.style.scrollBehavior = previousScrollBehavior;
  }, [phase]);

  // user-controlled sound only
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (!muted) v.play().catch(() => {});
  }, [muted]);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const ball = ballRef.current!;
    const reveal = revealRef.current!;
    const video = videoRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let status: Status = "idle";
    let raf = 0;
    let scrollRaf = 0;
    let t0 = 0;
    let previousY = window.scrollY;
    let direction = 0;
    let queued = false;
    let navbarHidden = false;
    let sectionStart = 0;
    let W = 0;
    let H = 0;
    let frameTop = 0;
    let S = 0;

    let hasPlayedOnce = false;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const frameRect = reveal.getBoundingClientRect();
      W = reveal.clientWidth || stage.clientWidth;
      H = reveal.clientHeight || stage.clientHeight;
      frameTop = frameRect.top - stageRect.top;
      S = ball.offsetWidth;
    };

    const measureBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionStart = rect.top + window.scrollY;
    };

    const play = () => video.play().catch(() => {});

    const setNavbarHidden = (hidden: boolean) => {
      if (navbarHidden === hidden) return;
      navbarHidden = hidden;
      onFullscreenChange?.(hidden);
    };

    const draw = (t: number) => {
      const floorY = frameTop + H * 0.5 - S / 2;
      const startY = frameTop - S * 1.5;
      let y = floorY;
      let scale = 1;
      let opacity = 1;
      let r = 0;

      if (t < T_DROP) {
        const u = t / T_DROP;
        y = startY + (floorY - startY) * u * u;
      } else if (t < T_B1) {
        const u = (t - T_DROP) / (T_B1 - T_DROP);
        y = floorY - H * 0.18 * 4 * u * (1 - u);
      } else if (t < T_B2) {
        const u = (t - T_B1) / (T_B2 - T_B1);
        y = floorY - H * 0.06 * 4 * u * (1 - u);
      } else {
        const u = Math.min(1, (t - T_B2) / (T_TOTAL - T_B2));
        const fade = Math.min(1, u / 0.35);
        const R = Math.hypot(W / 2, H / 2) * 1.15;
        r = S / 2 + (R - S / 2) * easeInOutCubic(u);
        opacity = 1 - fade;
        scale = 1 + 0.35 * fade;
      }

      ball.style.transform = `translate3d(-50%, ${y}px, 0) scale(${scale})`;
      ball.style.opacity = String(opacity);
      reveal.style.clipPath = `circle(${r}px at ${W / 2}px ${H / 2}px)`;
    };

    /** Return the video to normal document flow without moving it on screen. */
    const showNormal = () => {
      cancelAnimationFrame(raf);
      // Capture position BEFORE layout change so useLayoutEffect can correct scroll
      pendingStageTopRef.current = stage.getBoundingClientRect().top;
      status = "normal";
      ball.style.opacity = "0";
      reveal.style.clipPath = "none";
      reveal.style.transform = "scale(1)";
      setNavbarHidden(false);
      play();
      // Defer React phase change by one frame so DOM styles settle first (reduces flash)
      requestAnimationFrame(() => {
        setPhase("normal");
      });
    };

    const showFinal = () => {
      cancelAnimationFrame(raf);
      ball.style.opacity = "0";
      reveal.style.clipPath = "none";
      play();

      status = "expanded";
      setPhase("expanded");
      setNavbarHidden(true);
    };

    const resetForReplay = () => {
      cancelAnimationFrame(raf);
      status = "idle";
      hasPlayedOnce = false;
      ball.style.opacity = "1";
      ball.style.transform = `translate3d(-50%, ${-S * 1.5}px, 0) scale(1)`;
      reveal.style.clipPath = `circle(0px at ${W / 2}px ${H / 2}px)`;
      reveal.style.transform = "scale(1)";
      setPhase("idle");
      setNavbarHidden(false);
    };

    const tick = () => {
      const t = performance.now() - t0;
      if (t >= T_TOTAL) {
        draw(T_TOTAL);
        showFinal();
        return;
      }
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (hasPlayedOnce || status === "running" || status === "expanded") return;
      measure();
      if (reduce.matches) {
        hasPlayedOnce = true;
        showNormal();
        return;
      }
      hasPlayedOnce = true;
      status = "running";
      setPhase("running");
      setNavbarHidden(true);
      t0 = performance.now();
      play();
      raf = requestAnimationFrame(tick);
    };

    const check = () => {
      scrollRaf = 0;
      queued = false;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      sectionStart = rect.top + window.scrollY;
      const currentY = window.scrollY;

      // Reset only after leaving above, so the next downward entry can replay.
      if (
        hasPlayedOnce &&
        direction < 0 &&
        rect.top >= vh &&
        status !== "idle"
      ) {
        resetForReplay();
      }

      // ── Enter from ABOVE → play cinematic ─────────────────────────────────
      if (
        status === "idle" &&
        !hasPlayedOnce &&
        direction >= 0 &&
        rect.top < vh * (window.matchMedia("(max-width: 768px)").matches ? 0.9 : 0.75) &&
        rect.bottom > vh * 0.2
      ) {
        start();
      }

      // ── Enter from BELOW → always show normal size, never ball ────────────
      if (status === "idle" && hasPlayedOnce) {
        showNormal();
      }

      // Hold the revealed video in place, then return it to normal flow at the
      // end of the runway so the next archive cards scroll up naturally.
      if (status === "expanded") {
        const releaseAt = sectionStart + Math.max(1, section.offsetHeight - window.innerHeight);
        if (currentY >= releaseAt - 12) {
          showNormal();
        }
      }

      // Pause / resume video when section leaves viewport
      const out = rect.bottom <= 0 || rect.top >= vh;
      if (out && !video.paused) video.pause();
      else if (
        !out &&
        video.paused &&
        status !== "idle" &&
        status !== "running"
      ) {
        play();
      }
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > previousY) direction = 1;
      else if (currentY < previousY) direction = -1;
      previousY = currentY;

      if (queued) return;
      queued = true;
      scrollRaf = requestAnimationFrame(check);
    };

    const onResize = () => {
      measure();
      measureBounds();
      if (status === "expanded" || status === "normal") check();
    };

    // Reliable first-entry detection
    const entryThreshold = window.matchMedia("(max-width: 768px)").matches ? 0.9 : 0.75;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (
          entry.isIntersecting &&
          status === "idle" &&
          !hasPlayedOnce &&
          direction >= 0 &&
          entry.boundingClientRect.top < window.innerHeight * entryThreshold
        ) {
          start();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
    );
    io.observe(section);

    measure();
    measureBounds();

    // Initial state: ball ready, clip closed
    ball.style.opacity = "1";
    ball.style.transform = `translate3d(-50%, ${-S * 1.5}px, 0) scale(1)`;
    reveal.style.clipPath = `circle(0px at 50% 50%)`;
    reveal.style.transform = "scale(1)";

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      setNavbarHidden(false);
    };
  }, [onFullscreenChange]);

  // When phase is "normal" the section is pure document flow (no sticky, no extra height)
  const isCinematic = phase === "idle" || phase === "running" || phase === "expanded";

  return (
    <section
      ref={sectionRef}
      aria-label="Showreel"
      className={`showreel-section relative bg-black ${isCinematic ? "min-h-[180svh]" : ""}`}
      data-cinematic={isCinematic}
    >
        <div
          ref={stageRef}
          className={`${isCinematic ? "sticky top-0 h-svh" : "relative h-auto py-8 sm:py-12"} showreel-stage flex w-full items-center justify-center overflow-hidden bg-black`}
      >
        {/* Main showreel video */}
        <div
          ref={revealRef}
          className="showreel-video-frame relative mx-auto aspect-video overflow-hidden rounded-xl sm:rounded-2xl"
          style={{
            clipPath: "circle(0px at 50% 50%)",
            willChange: "clip-path, transform",
          }}
        >
          {posterSrc && (
            // Keep the poster underneath the first decoded video frame to avoid
            // a black/white flash while mobile browsers initialize playback.
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
            />
          )}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady || !posterSrc ? "opacity-100" : "opacity-0"}`}
            src={videoSrc}
            poster={posterSrc}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            muted
            loop
            playsInline
            autoPlay={false}
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
          />
        </div>

        {/* Red ball (only visible during cinematic phase) */}
        <div
          ref={ballRef}
          className="pointer-events-none absolute top-0 rounded-full"
          style={{
            left: "50%",
            width: "clamp(56px, 9vmin, 96px)",
            height: "clamp(56px, 9vmin, 96px)",
            background:
              "radial-gradient(circle at 32% 28%, #ff8a7a 0%, #e11d2e 38%, #7a0a14 100%)",
            boxShadow: "0 20px 60px rgba(225,29,46,0.35)",
            transform: "translate3d(-50%, -200px, 0)",
            willChange: "transform, opacity",
            opacity: isCinematic ? 1 : 0,
          }}
        >
          <span
            className="absolute rounded-full bg-white/60 blur-[3px]"
            style={{ left: "22%", top: "16%", width: "22%", height: "14%" }}
          />
        </div>

        <div className="pointer-events-none absolute left-6 top-6 text-sm font-medium text-white/80">
          Director&apos;s Cut
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={!muted}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-5 sm:right-5 sm:size-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          {muted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
          <span className="hidden sm:inline">{muted ? "Sound off" : "Sound on"}</span>
        </button>
      </div>
    </section>
  );
}
