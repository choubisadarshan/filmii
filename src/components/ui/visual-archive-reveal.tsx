"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
const VIDEO_SRC = "/showcase_video.mp4";
const POSTER_SRC = "/showcase_poster.jpg";

function interpolate(
  progress: number,
  stops: number[],
  values: number[],
  easing: "linear" | "smooth" | "bounce" = "linear",
) {
  for (let index = 1; index < stops.length; index += 1) {
    const start = stops[index - 1];
    const end = stops[index];
    const from = values[index - 1];
    const to = values[index];
    if (start === undefined || end === undefined || from === undefined || to === undefined) continue;
    if (progress <= end) {
      const amount = Math.max(0, Math.min(1, (progress - start) / (end - start)));
      const eased = easing === "bounce" && index <= 5
        ? index % 2 === 1
          ? amount * amount
          : 1 - (1 - amount) * (1 - amount)
        : easing === "smooth" || easing === "bounce"
          ? amount * amount * (3 - 2 * amount)
          : amount;
      return from + (to - from) * eased;
    }
  }
  return values[values.length - 1] ?? 0;
}

/**
 * Scroll-driven showreel reveal.
 *
 * Design rules that keep it smooth at any scroll speed:
 *  1. Every stage is a function of scroll progress (0..1), so fast scrolling
 *     always lands on the correct visual state.
 *  2. The page scroll is never hijacked: no wheel/touch preventDefault, no
 *     scrollTo/scrollBy correction, no scroll "hold" listener.
 *  3. The expanded video fills the pinned stage (a sticky block inside the
 *     page), not a `position: fixed` layer — so it never takes over a phone
 *     screen and the rest of the page stays reachable.
 *  4. One requestAnimationFrame loop updates the ball, video mask, and playback
 *     state without React renders during scrolling.
 */

const REVEAL_START = 0.42;
const REVEAL_END = 0.72;

export default function ShowreelReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageLayerRef = useRef<HTMLDivElement>(null);
  const videoFrameRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [nearViewport, setNearViewport] = useState(false);
  const [muted, setMuted] = useState(true);

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

  useEffect(() => {
    const wrapper = wrapRef.current;
    const stageLayer = stageLayerRef.current;
    const videoFrame = videoFrameRef.current;
    const ball = ballRef.current;
    const chrome = chromeRef.current;
    const hint = hintRef.current;
    if (!wrapper || !stageLayer || !videoFrame || !ball || !chrome || !hint) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const travel = Math.max(1, wrapper.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -wrapper.getBoundingClientRect().top / travel));
      const dropDistance = Math.min(280, window.innerHeight * 0.42);

      const ballY = interpolate(
        progress,
        [0, 0.12, 0.19, 0.26, 0.32, 0.38, 0.44],
        [-dropDistance, 0, -dropDistance * 0.5, 0, -dropDistance * 0.22, 0, 0],
        "bounce",
      );
      const ballScale = interpolate(
        progress,
        [0, 0.12, 0.19, 0.26, 0.32, 0.38, 0.44],
        [1, 1, 0.9, 1, 0.94, 1, 0],
        "smooth",
      );
      const ballOpacity = interpolate(progress, [0, 0.04, 0.4, 0.46], [0, 1, 1, 0], "smooth");
      const revealRadius = interpolate(progress, [0, REVEAL_START, REVEAL_END], [0, 0, 150], "smooth");
      const revealScale = interpolate(progress, [REVEAL_START, REVEAL_END], [0.94, 1], "smooth");
      const backgroundOpacity = interpolate(progress, [REVEAL_START - 0.02, REVEAL_START + 0.02], [0, 1]);
      const chromeOpacity = interpolate(progress, [0.64, 0.68], [0, 1]);
      const hintOpacity = interpolate(progress, [0, 0.04, REVEAL_START], [1, 1, 0]);

      if (reducedMotion.matches) {
        stageLayer.style.opacity = "1";
        videoFrame.style.clipPath = "circle(150% at 50% 50%)";
        videoFrame.style.transform = "scale(1)";
        ball.style.opacity = "0";
        chrome.style.opacity = `${progress > 0.68 ? 1 : 0}`;
      } else {
        stageLayer.style.opacity = `${backgroundOpacity}`;
        videoFrame.style.clipPath = `circle(${revealRadius}% at 50% 50%)`;
        videoFrame.style.transform = `scale(${revealScale})`;
        ball.style.transform = `translate3d(-50%, calc(-50% + ${ballY}px), 0) scale(${ballScale})`;
        ball.style.opacity = `${ballOpacity}`;
        chrome.style.opacity = `${chromeOpacity}`;
      }
      hint.style.opacity = `${hintOpacity}`;

      const video = videoRef.current;
      if (!video) return;
      const shouldPlay = progress > REVEAL_START - 0.04 && progress < 1;
      if (shouldPlay && video.paused) void video.play().catch(() => {});
      if (!shouldPlay && !video.paused) video.pause();
    };

    const scheduleUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [nearViewport]);

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
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <div ref={stageLayerRef} className="absolute inset-0 bg-black opacity-0">
          <div ref={videoFrameRef} className="absolute left-1/2 top-1/2 aspect-video w-full max-w-[177.78svh] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-black will-change-[clip-path,transform] xl:inset-0 xl:aspect-auto xl:max-w-none xl:translate-x-0 xl:translate-y-0">
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
          </div>

          <div
            ref={chromeRef}
            className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 opacity-0 md:p-10"
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
          </div>
        </div>

        <div
          ref={ballRef}
          className="absolute left-1/2 top-1/2 z-10 aspect-square w-[clamp(76px,11vw,160px)] rounded-full bg-[radial-gradient(circle_at_32%_24%,#ff766b_0%,#e50914_28%,#a90b12_58%,#3a0508_100%)] opacity-0 shadow-[inset_-18px_-25px_30px_rgba(10,0,0,0.48),20px_26px_35px_rgba(0,0,0,0.5)] will-change-transform"
        >
          <span className="absolute left-[24%] top-[17%] h-[11%] w-[20%] rotate-[-35deg] rounded-[50%] bg-[#ff9990] blur-sm" />
        </div>

        <span
          ref={hintRef}
          className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
        >
          Keep scrolling
        </span>
      </div>
    </div>
  );
}
