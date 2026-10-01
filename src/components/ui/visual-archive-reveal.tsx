"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
} from "@/components/ui/skiper67";

const VIDEO_SRC = "/showcase_video.mp4";
const POSTER_SRC = "/showcase_poster.jpg";

// FAST TIMELINE (ms). Total ~1.8s
const DROP_MS = 400;
const FLIP_MS = 550;
const CHARGE_MS = 120;
const EXPAND_S = 0.75;
const FLIP_DEG = 540;

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);

type Stage = "idle" | "drop" | "flip" | "charge" | "full";

const inOverlay = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("[data-archive-overlay]");

export default function VisualArchiveReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);
  const autoOpened = useRef(false);
  const lastTop = useRef<number | null>(null);
  const reduce = useReducedMotion();

  const [stage, setStage] = useState<Stage>("idle");
  const [introDone, setIntroDone] = useState(false);
  const [controlsOn, setControlsOn] = useState(false);
  const fullReadyRef = useRef(false);
  // clip-path values must be px only (mixing % and px makes the expand snap)
  const [clipFrom, setClipFrom] = useState("inset(300px 300px 300px 300px round 0px)");
  const [clipMid, setClipMid] = useState("inset(160px 240px 160px 240px round 18px)");

  const locked = stage === "drop" || stage === "charge" || (stage === "flip" && !introDone);

  // 0) TRIGGER (enter zone OR fast-scroll overshoot) + RESET (replays every pass)
  useEffect(() => {
    const check = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      const pinRange = Math.max(el.offsetHeight - h, 0); // how long the stage stays pinned
      const prevTop = lastTop.current;
      lastTop.current = r.top;

      if (triggered.current) {
        // visitor left the section far enough -> arm it to replay next time
        if (r.top > h * 0.85 || r.bottom < h * 0.15) {
          triggered.current = false;
          autoOpened.current = false;
          setIntroDone(false);
          setControlsOn(false);
          setStage("idle");
        }
        return;
      }

      const inZone = r.top < h * 0.3 && r.bottom > h * 0.5; // section has entered the screen
      const flungPast = prevTop !== null && prevTop > 0 && r.bottom <= h * 0.5; // overshot downwards

      if (inZone || flungPast) {
        triggered.current = true;
        autoOpened.current = false;

        // instantly snap so the stage is pinned (centered) before the animation starts
        const delta = r.top > 0 ? r.top : r.top < -pinRange ? r.top + pinRange : 0;
        if (delta) window.scrollBy({ top: delta, behavior: "instant" });

        setIntroDone(false);
        setControlsOn(false);
        setStage(reduce ? "flip" : "drop");
      }
    };

    const raf = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [reduce]);

  // 1) SCROLL LOCK without overflow:hidden (keeps position:sticky working)
  useEffect(() => {
    if (!locked) return;
    const y = window.scrollY;

    const onWheel = (e: WheelEvent) => e.preventDefault();
    const onTouch = (e: TouchEvent) => {
      if (!inOverlay(e.target)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key)) return;
      if (e.key === " " && inOverlay(e.target)) return; // keep play/pause key working
      e.preventDefault();
    };
    const hold = () => {
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: "instant" });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hold); // scrollbar drag / anything else
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hold);
    };
  }, [locked]);

  useEffect(() => {
    if (stage !== "full") return;

    fullReadyRef.current = false;
    const armClose = window.setTimeout(() => {
      fullReadyRef.current = true;
    }, 350);

    const onScroll = () => {
      if (fullReadyRef.current && window.scrollY !== 0) setStage("flip");
    };

    const onWheel = (e: WheelEvent) => {
      if (fullReadyRef.current && (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0)) {
        setStage("flip");
      }
    };

    const onTouch = () => {
      if (fullReadyRef.current) setStage("flip");
    };
    const onKey = (e: KeyboardEvent) => {
      if (fullReadyRef.current && SCROLL_KEYS.has(e.key) && !inOverlay(e.target)) setStage("flip");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(armClose);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage]);

  const openFull = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = boxRef.current?.getBoundingClientRect();
    if (r) {
      setClipFrom(`inset(${r.top}px ${w - r.right}px ${h - r.bottom}px ${r.left}px round 0px)`);
    }
    setClipMid(`inset(${h * 0.2}px ${w * 0.2}px ${h * 0.2}px ${w * 0.2}px round 18px)`);
    setControlsOn(false);
    setIntroDone(true);
    setStage("full");
  }, []);

  // 2) FIXED TIMELINE: drop -> flip -> charge -> expand
  useEffect(() => {
    if (stage !== "drop") return;
    const t = setTimeout(() => setStage("flip"), DROP_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "flip" || autoOpened.current) return;
    autoOpened.current = true;
    const t = setTimeout(() => setStage("charge"), reduce ? 0 : FLIP_MS);
    return () => clearTimeout(t);
  }, [stage, reduce]);

  useEffect(() => {
    if (stage !== "charge") return;
    const t = setTimeout(openFull, reduce ? 0 : CHARGE_MS);
    return () => clearTimeout(t);
  }, [stage, openFull, reduce]);

  // 3) controls fade in as the expand finishes
  useEffect(() => {
    if (stage !== "full") return;
    const t = setTimeout(() => setControlsOn(true), reduce ? 0 : EXPAND_S * 1000 - 100);
    return () => clearTimeout(t);
  }, [stage, reduce]);

  // 4) hide navbar while fullscreen
  useEffect(() => {
    if (stage !== "full") return;
    const html = document.documentElement;
    html.dataset.videoOpen = "true";
    return () => {
      delete html.dataset.videoOpen;
    };
  }, [stage]);

  // 5) Escape closes
  useEffect(() => {
    if (stage !== "full") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStage("flip");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  const flipped = stage !== "idle" && stage !== "drop";
  const charging = stage === "charge";
  const hidden = stage === "idle";

  return (
    // TALL WRAPPER = buffer zone. NO overflow-hidden on this element or any ancestor (breaks sticky).
    <div ref={wrapRef} className="relative h-[170dvh] w-full bg-[#050505]">
      {/* PINNED STAGE: box is perfectly centered; label is absolute so it can't push the box */}
      <div
        className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden"
        style={{ perspective: 1400 }}
      >
        <span className="absolute bottom-[12dvh] left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-neutral-500">
          Showreel
        </span>

        {/* DROP + CHARGE */}
        <motion.div
          ref={boxRef}
          initial={{ y: reduce ? 0 : -900, opacity: 0, scale: 1 }}
          animate={{
            y: hidden ? (reduce ? 0 : -900) : 0,
            opacity: hidden ? 0 : stage === "full" ? 0 : 1,
            scale: charging ? 1.12 : 1,
            boxShadow: charging
              ? "0 0 90px 12px rgba(229,9,20,0.5)"
              : "0 20px 60px -20px rgba(0,0,0,0.6)",
          }}
          transition={{
            y: hidden ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 24, mass: 0.8 },
            opacity: { duration: stage === "full" ? 0.1 : hidden ? 0 : 0.15 },
            scale: { duration: 0.12, ease: "easeOut" },
            boxShadow: { duration: 0.12 },
          }}
          onClick={() => stage === "flip" && introDone && openFull()}
          className="h-44 w-44 cursor-pointer md:h-56 md:w-56"
        >
          {/* FAST FLIP */}
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{
              rotateY: flipped ? FLIP_DEG : 0,
              rotateX: flipped ? [0, 22, -10, 0] : 0,
              scale: flipped ? [1, 1.25, 0.96, 1] : 1,
            }}
            transition={{
              rotateY: { duration: reduce || !flipped ? 0 : FLIP_MS / 1000, ease: [0.34, 1.25, 0.64, 1] },
              rotateX: { duration: reduce || !flipped ? 0 : FLIP_MS / 1000, ease: "easeInOut" },
              scale: { duration: reduce || !flipped ? 0 : FLIP_MS / 1000, ease: "easeInOut" },
            }}
          >
            <div
              className="absolute inset-0 grid place-items-center bg-neutral-900 text-xs uppercase tracking-[0.3em] text-white"
              style={{ backfaceVisibility: "hidden" }}
            >
              Archive
            </div>
            <div
              className="absolute inset-0 overflow-hidden bg-black"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <video
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                preload="metadata"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest text-white mix-blend-difference">
                Play
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* FAST SMOOTH EXPAND (box -> mid frame -> fullscreen) */}
      <AnimatePresence>
        {stage === "full" && (
          <motion.div
            key="overlay"
            data-archive-overlay
            className="fixed left-0 top-0 z-[200] h-[100dvh] w-screen bg-black"
            initial={{ clipPath: clipFrom }}
            animate={{ clipPath: [clipFrom, clipMid, "inset(0px 0px 0px 0px round 0px)"] }}
            exit={{
              clipPath: clipFrom,
              transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
            }}
            transition={{
              duration: reduce ? 0.2 : EXPAND_S,
              times: [0, 0.45, 1],
              ease: [
                [0.5, 0, 0.2, 1],
                [0.16, 1, 0.3, 1],
              ],
            }}
          >
            <motion.div
              className="h-full w-full"
              initial={{ scale: reduce ? 1 : 1.35, filter: "brightness(0.4)" }}
              animate={{ scale: 1, filter: "brightness(1)" }}
              transition={{ duration: reduce ? 0.2 : EXPAND_S, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoPlayer style={{ width: "100%", height: "100%" }}>
                <VideoPlayerContent
                  src={VIDEO_SRC}
                  poster={POSTER_SRC}
                  autoPlay
                  slot="media"
                  className="h-full w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
                <button
                  aria-label="Close video"
                  onClick={() => setStage("flip")}
                  className={`absolute right-4 top-4 z-10 rounded-full p-2 text-white mix-blend-exclusion transition-opacity duration-500 ${
                    controlsOn ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <Plus className="size-6 rotate-45" />
                </button>
                <VideoPlayerControlBar
                  className={`absolute bottom-0 left-0 flex w-full items-center px-5 mix-blend-exclusion transition-opacity duration-500 md:px-10 md:py-5 ${
                    controlsOn ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <VideoPlayerPlayButton className="h-4 bg-transparent" />
                  <VideoPlayerTimeRange className="bg-transparent" />
                  <VideoPlayerMuteButton className="size-4 bg-transparent" />
                </VideoPlayerControlBar>
              </VideoPlayer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
