"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SCROLL  = enter / exit only (decides whether the section is active)
 * TIME    = the cinematic sequence (performance.now + requestAnimationFrame)
 *
 * Timeline (ms, independent of scroll speed):
 *   0    – 800   ball drops (gravity ease-in)
 *   800  – 1300  bounce 1
 *   1300 – 1600  bounce 2
 *   1600 – 2400  ball fades/grows while circular clip-path reveals the video
 *   2400         reveal completes, then holds until the user scrolls away
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
  const [muted, setMuted] = useState(true);
  const [phase, setPhase] = useState<Status>("idle");

  // sound is user-controlled only
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
    let enteredFromAbove = false;
    let enteredFromBelow = false;
    let queued = false;
    let navbarHidden = false;
    let sectionStart = 0;
    let sectionEnd = 0;
    let W = 0;
    let H = 0;
    let frameTop = 0;
    let S = 0;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const frameRect = reveal.getBoundingClientRect();
      W = reveal.clientWidth;
      H = reveal.clientHeight;
      frameTop = frameRect.top - stageRect.top;
      S = ball.offsetWidth;
    };

    const measureBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionStart = rect.top + window.scrollY;
      sectionEnd = rect.bottom + window.scrollY;
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
        const R = Math.hypot(W / 2, H / 2);
        r = S / 2 + (R - S / 2) * easeInOutCubic(u);
        opacity = 1 - fade;
        scale = 1 + 0.35 * fade;
      }

      ball.style.transform = `translate3d(-50%, ${y}px, 0) scale(${scale})`;
      ball.style.opacity = String(opacity);
      reveal.style.clipPath = `circle(${r}px at ${W / 2}px ${H / 2}px)`;
    };

    const showNormal = () => {
      status = "normal";
      setPhase("normal");
      ball.style.opacity = "0";
      reveal.style.clipPath = "none";
      reveal.style.transform = "scale(1)";
      setNavbarHidden(false);
    };

    const showFinal = () => {
      cancelAnimationFrame(raf);
      ball.style.opacity = "0";
      reveal.style.clipPath = "none";
      play();
      if (direction < 0) {
        showNormal();
        return;
      }
      status = "expanded";
      setPhase("expanded");
      setNavbarHidden(true);
    };

    const tick = () => {
      const t = performance.now() - t0; // elapsed time, not scroll
      if (t >= T_TOTAL) {
        draw(T_TOTAL);
        showFinal();
        return;
      }
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      measure();
      if (reduce.matches) return showNormal();
      status = "running";
      setPhase("running");
      setNavbarHidden(true);
      t0 = performance.now();
      play();
      raf = requestAnimationFrame(tick);
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      status = "idle";
      setPhase("idle");
      measure();
      video.pause();
      video.currentTime = 0;
      ball.style.opacity = "1";
      ball.style.transform = `translate3d(-50%, ${-S * 1.5}px, 0) scale(1)`;
      reveal.style.clipPath = `circle(0px at ${W / 2}px ${H / 2}px)`;
      reveal.style.transform = "scale(1)";
      setNavbarHidden(false);
    };

    const check = () => {
      scrollRaf = 0;
      queued = false;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      sectionStart = rect.top + window.scrollY;
      sectionEnd = rect.bottom + window.scrollY;
      const currentY = window.scrollY;

      if (status === "idle" && enteredFromAbove) start();
      else if (status === "idle" && enteredFromBelow) showNormal();

      enteredFromAbove = false;
      enteredFromBelow = false;

      if (
        status === "expanded" &&
        direction < 0 &&
        currentY > sectionStart &&
        currentY < sectionEnd
      ) {
        showNormal();
      }

      if (status !== "running" && status !== "idle") {
        if (direction < 0 && currentY < sectionStart - vh * 0.7) reset();
        else if (direction > 0 && currentY > sectionEnd + vh * 0.25) reset();
      }

      if (status === "expanded") {
        const runway = Math.max(1, sectionEnd - sectionStart - vh);
        const shrinkStart = sectionStart + runway * 0.58;
        const shrinkRange = Math.max(1, runway * 0.42);
        const progress = Math.max(0, Math.min(1, (currentY - shrinkStart) / shrinkRange));
        reveal.style.transform = `scale(${1 - progress * 0.3})`;
        setNavbarHidden(progress < 0.04);
      }

      const out = rect.bottom <= 0 || rect.top >= vh;
      if (out && !video.paused) video.pause();
      else if (!out && video.paused && status !== "idle" && status !== "running") {
        play();
      }
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > previousY) {
        direction = 1;
        if (previousY < sectionStart && currentY >= sectionStart && currentY < sectionEnd) {
          enteredFromAbove = true;
        }
      } else if (currentY < previousY) {
        direction = -1;
        if (previousY > sectionEnd && currentY <= sectionEnd && currentY > sectionStart) {
          enteredFromBelow = true;
        }
      }
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

    measure();
    measureBounds();
    reset();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      setNavbarHidden(false);
    };
  }, [onFullscreenChange]);

  return (
    <section
      ref={sectionRef}
      aria-label="Showreel"
      className="relative bg-black"
      style={{ height: "125svh" }}
    >
      <div
        ref={stageRef}
        className={`${phase === "normal" ? "relative" : "sticky"} top-0 flex h-svh w-full items-center justify-center overflow-hidden bg-black md:block`}
      >
        {/* video, revealed by circular clip-path */}
        <div
          ref={revealRef}
          className={`relative aspect-video overflow-hidden md:mx-auto ${
            phase === "normal"
              ? "w-[92%] md:aspect-video md:w-[72vw] md:max-w-300"
              : "w-full md:absolute md:inset-0 md:h-full md:aspect-auto md:max-w-none"
          }`}
          style={{ clipPath: "circle(0px at 50% 50%)", willChange: "clip-path, transform" }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={videoSrc}
            poster={posterSrc}
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

        {/* red ball */}
        <div
          ref={ballRef}
          className="pointer-events-none absolute top-0 rounded-full"
          style={{
            left: "50%",
            width: "clamp(56px, 9vmin, 96px)",
            height: "clamp(56px, 9vmin, 96px)",
            background: "radial-gradient(circle at 32% 28%, #ff8a7a 0%, #e11d2e 38%, #7a0a14 100%)",
            boxShadow: "0 20px 60px rgba(225,29,46,0.35)",
            transform: "translate3d(-50%, -200px, 0)",
            willChange: "transform, opacity",
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
          className="absolute bottom-6 right-6 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>
    </section>
  );
}