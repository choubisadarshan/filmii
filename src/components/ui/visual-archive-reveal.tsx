"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
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

const VIDEO_SRC = "https://skiper-ui.com/showreel/skiper-ui-showreel.mp4"; // 👉 your video
const FLIP_DEG = 540; // 540 = crazy spin & lands on back. Use 180 for a single calm flip.
const FLIP_DUR = 1.5; // seconds
const CHARGE_MS = 700; // anticipation beat before expanding
const EXPAND_DUR = 2; // seconds, the smooth transition

type Stage = "idle" | "drop" | "flip" | "charge" | "full";

export default function VisualArchiveReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const autoOpened = useRef(false);
  const inView = useInView(wrapRef, { amount: 0.5, once: true });
  const reduce = useReducedMotion();

  const [armed, setArmed] = useState(false); // user must scroll first
  const [stage, setStage] = useState<Stage>("idle");
  const [clipFrom, setClipFrom] = useState("inset(40% 40% 40% 40% round 0px)");
  const [controlsOn, setControlsOn] = useState(false);

  // only arm after the visitor really scrolls (site always starts at Home)
  useEffect(() => {
    const onScroll = () => window.scrollY > 80 && setArmed(true);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openFull = useCallback(() => {
    const r = boxRef.current?.getBoundingClientRect();
    if (r) {
      setClipFrom(
        `inset(${r.top}px ${window.innerWidth - r.right}px ${
          window.innerHeight - r.bottom
        }px ${r.left}px round 0px)`
      );
    }
    setControlsOn(false);
    setStage("full");
  }, []);

  // 1) trigger drop
  useEffect(() => {
    if (inView && armed && stage === "idle") {
      const t = setTimeout(() => setStage(reduce ? "flip" : "drop"), 0);
      return () => clearTimeout(t);
    }
  }, [inView, armed, stage, reduce]);

  // 2) after flip -> charge -> expand (first time only)
  useEffect(() => {
    if (stage !== "flip" || autoOpened.current) return;
    autoOpened.current = true;
    const t1 = setTimeout(() => setStage("charge"), reduce ? 0 : FLIP_DUR * 1000 + 150);
    return () => clearTimeout(t1);
  }, [stage, reduce]);

  useEffect(() => {
    if (stage !== "charge") return;
    const t = setTimeout(openFull, reduce ? 0 : CHARGE_MS);
    return () => clearTimeout(t);
  }, [stage, openFull, reduce]);

  // 3) controls fade in only after the expand finishes
  useEffect(() => {
    if (stage !== "full") return;
    const t = setTimeout(() => setControlsOn(true), reduce ? 0 : EXPAND_DUR * 1000 - 200);
    return () => clearTimeout(t);
  }, [stage, reduce]);

  // 4) hide navbar + lock scroll
  useEffect(() => {
    if (stage !== "full") return;
    const html = document.documentElement;
    const prev = document.body.style.overflow;
    html.dataset.videoOpen = "true";
    document.body.style.overflow = "hidden";
    return () => {
      delete html.dataset.videoOpen;
      document.body.style.overflow = prev;
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
    <div
      ref={wrapRef}
      className="relative flex min-h-[70vh] w-full items-start justify-center overflow-hidden"
      style={{ perspective: 1400 }}
    >
      {/* DROP + CHARGE */}
      <motion.div
        ref={boxRef}
        initial={{ y: reduce ? 0 : -700, opacity: 0, scale: 1 }}
        animate={{
          y: hidden ? (reduce ? 0 : -700) : 0,
          opacity: hidden ? 0 : stage === "full" ? 0 : 1,
          scale: charging ? 1.14 : 1,
          boxShadow: charging
            ? "0 0 90px 12px rgba(255,255,255,0.35)"
            : "0 20px 60px -20px rgba(0,0,0,0.5)",
        }}
        transition={{
          y: { type: "spring", stiffness: 130, damping: 9, mass: 1.2 },
          opacity: { duration: stage === "full" ? 0.1 : 0.25 },
          scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          boxShadow: { duration: 0.6 },
        }}
        onAnimationComplete={() => stage === "drop" && setStage("flip")}
        onClick={() => stage === "flip" && openFull()}
        className="mt-24 h-44 w-44 cursor-pointer md:h-56 md:w-56"
      >
        {/* CRAZY FLIP */}
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateY: flipped ? FLIP_DEG : 0,
            rotateX: flipped ? [0, 28, -14, 6, 0] : 0,
            scale: flipped ? [1, 1.3, 0.94, 1.04, 1] : 1,
          }}
          transition={{
            rotateY: { duration: reduce ? 0 : FLIP_DUR, ease: [0.34, 1.4, 0.64, 1] },
            rotateX: { duration: reduce ? 0 : FLIP_DUR, ease: "easeInOut" },
            scale: { duration: reduce ? 0 : FLIP_DUR, ease: "easeInOut" },
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
            <video src={VIDEO_SRC} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest text-white mix-blend-difference">
              Play
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* SMOOTH TWO-STAGE EXPAND */}
      <AnimatePresence>
        {stage === "full" && (
          <motion.div
            key="overlay"
            className="fixed left-0 top-0 z-[200] h-[100dvh] w-screen bg-black"
            initial={{ clipPath: clipFrom }}
            animate={{
              clipPath: [
                clipFrom,
                "inset(22% 22% 22% 22% round 18px)", // mid-size frame
                "inset(0px 0px 0px 0px round 0px)", // full screen
              ],
            }}
            exit={{
              clipPath: clipFrom,
              transition: { duration: 1.1, ease: [0.65, 0, 0.35, 1] },
            }}
            transition={{
              duration: reduce ? 0.3 : EXPAND_DUR,
              times: [0, 0.4, 1],
              ease: [
                [0.6, 0, 0.2, 1],
                [0.16, 1, 0.3, 1],
              ],
            }}
          >
            <motion.div
              className="h-full w-full"
              initial={{ scale: reduce ? 1 : 1.5, filter: "brightness(0.35)" }}
              animate={{ scale: 1, filter: "brightness(1)" }}
              transition={{ duration: reduce ? 0.3 : EXPAND_DUR, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoPlayer style={{ width: "100%", height: "100%" }}>
                <VideoPlayerContent
                  src={VIDEO_SRC}
                  autoPlay
                  slot="media"
                  className="h-full w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
                <button
                  aria-label="Close video"
                  onClick={() => setStage("flip")}
                  className={`absolute right-4 top-4 z-10 rounded-full p-2 text-white mix-blend-exclusion transition-opacity duration-700 ${
                    controlsOn ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <Plus className="size-6 rotate-45" />
                </button>
                <VideoPlayerControlBar
                  className={`absolute bottom-0 left-0 flex w-full items-center px-5 mix-blend-exclusion transition-opacity duration-700 md:px-10 md:py-5 ${
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