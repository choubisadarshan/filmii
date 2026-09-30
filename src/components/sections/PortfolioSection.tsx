"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useReducedMotion, motion, useInView } from "framer-motion";
import { Play, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import type { CSSProperties } from "react";

const BALL_SIZE = "clamp(90px, 16vmin, 170px)";
const BOUNCE_HEIGHTS = [0.45, 0.20] as const; 
const BOUNCE_DURATIONS = [600, 500, 400] as const;
const EXPAND_MS = 950;
const TRIGGER_THRESHOLD = 0.4;
const VIDEO_SRC = "/showcase_video.mp4";
const POSTER_SRC = "/showcase_poster.jpg";
const MAX_SCROLL_LOCK_MS = 4000;
const EXIT_MS = 600;

type IntroPhase = "idle" | "bouncing" | "revealing" | "playing" | "closing";

interface PortfolioSectionProps {
  onIntroActiveChange: (active: boolean) => void;
}

const ballRadiusForViewport = () =>
  Math.min(85, Math.max(45, Math.min(window.innerWidth, window.innerHeight) * 0.08));

export default function PortfolioSection({ onIntroActiveChange }: PortfolioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [phase, setPhase] = useState<IntroPhase>("idle");
  const [posterRequested, setPosterRequested] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFallback, setPosterFallback] = useState(true);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [fullRadius, setFullRadius] = useState(0);
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isIntroActive = phase !== "idle";

  const openIntro = useCallback((withBall: boolean) => {
    if (phase !== "idle") return;
    hasTriggeredRef.current = true;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setPosterRequested(true);
    setVideoReady(false);
    setVideoFailed(false);
    setPosterFallback(true);
    setPlaybackBlocked(reducedMotionRef.current);
    setIsMuted(true);
    setPhase(prefersReducedMotion ? "playing" : withBall ? "bouncing" : "revealing");
  }, [phase, prefersReducedMotion]);

  const closeIntro = useCallback(() => {
    if (phase === "idle" || phase === "closing") return;
    const video = videoRef.current;
    video?.pause();
    video?.removeAttribute("src");
    video?.load();
    setPosterFallback(true);
    setPhase("closing");
  }, [phase]);

  const skipIntro = () => {
    if (phase === "idle" || phase === "closing") return;
    setFullRadius(Math.hypot(window.innerWidth / 2, window.innerHeight / 2));
    setPosterFallback(!videoReady || videoFailed || prefersReducedMotion);
    setPhase("playing");
  };

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasTriggeredRef.current || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.intersectionRatio >= TRIGGER_THRESHOLD && !hasTriggeredRef.current) {
          observer.disconnect();
          openIntro(true);
        }
      },
      { threshold: TRIGGER_THRESHOLD },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [openIntro]);

  useEffect(() => {
    onIntroActiveChange(isIntroActive);
    return () => onIntroActiveChange(false);
  }, [isIntroActive, onIntroActiveChange]);

  useEffect(() => {
    if (!isIntroActive) {
      previousFocusRef.current?.focus({ preventScroll: true });
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const originalRootOverflow = root.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const computedPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    let restored = false;

    const restoreScroll = () => {
      if (restored) return;
      restored = true;
      root.style.overflow = originalRootOverflow;
      body.style.overflow = originalBodyOverflow;
      body.style.paddingRight = originalBodyPadding;
    };

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
    const unlockTimer = window.setTimeout(restoreScroll, MAX_SCROLL_LOCK_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeIntro();
      }
    };
    
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(unlockTimer);
      restoreScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeIntro, isIntroActive]);

  useEffect(() => {
    if (!isIntroActive) return;
    dialogRef.current?.focus({ preventScroll: true });
  }, [isIntroActive]);

  useEffect(() => {
    if (phase === "playing") closeButtonRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (!isIntroActive) return;
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    const animation = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: "ease-out",
      fill: "forwards",
    });
    return () => animation.cancel();
  }, [isIntroActive]);

  useEffect(() => {
    if (phase !== "bouncing") return;
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!ball || !shadow) return;

    const downEase = "cubic-bezier(0.6, 0, 1, 0.6)";
    const upEase = "cubic-bezier(0, 0.4, 0.4, 1)";
    
    const totalDuration = BOUNCE_DURATIONS[0] + BOUNCE_DURATIONS[1] + BOUNCE_DURATIONS[2] + 200;
    const ballFrames: Keyframe[] = [];
    const shadowFrames: Keyframe[] = [];

    let currentElapsed = 0;

    // --- Drop 1 ---
    ballFrames.push({
      offset: 0,
      transform: "translate(-50%, calc(-50% - 60svh)) scaleX(0.85) scaleY(1.15)",
      easing: downEase,
    });
    shadowFrames.push({ offset: 0, opacity: 0.05, transform: "scaleX(0.2)" });

    currentElapsed += BOUNCE_DURATIONS[0];
    let normalizedTime = currentElapsed / totalDuration;
    
    // Impact 1
    ballFrames.push({
      offset: normalizedTime,
      transform: "translate(-50%, -50%) scaleX(1.3) scaleY(0.7)",
      easing: upEase,
    });
    shadowFrames.push({ offset: normalizedTime, opacity: 0.6, transform: "scaleX(1.1)" });

    // --- Bounce 1 & Drop 2 ---
    currentElapsed += BOUNCE_DURATIONS[1] / 2;
    normalizedTime = currentElapsed / totalDuration;
    
    // Peak 1
    ballFrames.push({
      offset: normalizedTime,
      transform: `translate(-50%, calc(-50% - ${BOUNCE_HEIGHTS[0] * 100}svh)) scaleX(0.95) scaleY(1.05)`,
      easing: downEase,
    });
    shadowFrames.push({ offset: normalizedTime, opacity: 0.15, transform: "scaleX(0.4)" });

    currentElapsed += BOUNCE_DURATIONS[1] / 2;
    normalizedTime = currentElapsed / totalDuration;

    // Impact 2
    ballFrames.push({
      offset: normalizedTime,
      transform: "translate(-50%, -50%) scaleX(1.25) scaleY(0.75)",
      easing: upEase,
    });
    shadowFrames.push({ offset: normalizedTime, opacity: 0.6, transform: "scaleX(1.05)" });

    // --- Bounce 2 & Drop 3 ---
    currentElapsed += BOUNCE_DURATIONS[2] / 2;
    normalizedTime = currentElapsed / totalDuration;

    // Peak 2
    ballFrames.push({
      offset: normalizedTime,
      transform: `translate(-50%, calc(-50% - ${BOUNCE_HEIGHTS[1] * 100}svh)) scaleX(0.97) scaleY(1.03)`,
      easing: downEase,
    });
    shadowFrames.push({ offset: normalizedTime, opacity: 0.25, transform: "scaleX(0.55)" });

    currentElapsed += BOUNCE_DURATIONS[2] / 2;
    normalizedTime = currentElapsed / totalDuration;

    // Impact 3 (Final Impact Transition point)
    ballFrames.push({
      offset: normalizedTime,
      transform: "translate(-50%, -50%) scaleX(1.2) scaleY(0.8)",
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    });
    shadowFrames.push({ offset: normalizedTime, opacity: 0.6, transform: "scaleX(1.0)" });

    ballFrames.push({
      offset: 1,
      transform: "translate(-50%, -50%) scaleX(1) scaleY(1)",
    });
    shadowFrames.push({
      offset: 1,
      opacity: 0.5,
      transform: "scaleX(0.9)",
    });

    ball.style.willChange = "transform";
    const ballAnimation = ball.animate(ballFrames, { duration: totalDuration, fill: "forwards" });
    const shadowAnimation = shadow.animate(shadowFrames, { duration: totalDuration, fill: "forwards" });

    Promise.all([ballAnimation.finished, shadowAnimation.finished]).then(() => {
      ball.style.transform = "translate(-50%, -50%) scaleX(1) scaleY(1)";
      ball.style.willChange = "";
      shadow.style.transform = "scaleX(0.9)";
      shadow.style.opacity = "0.5";
      setPhase("revealing");
    }).catch(() => {});

    return () => {
      ballAnimation.cancel();
      shadowAnimation.cancel();
      ball.style.willChange = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;
    const layer = videoLayerRef.current;
