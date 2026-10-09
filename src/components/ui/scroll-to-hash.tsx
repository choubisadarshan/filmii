"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Puts the home page at the right scroll position when you come back to it,
 * BEFORE the browser paints, so there is no visible scrolling at all.
 *
 *  - "/#work-categories" ("Back to work" link): jump to that section.
 *  - Browser Back from a /work/<category> page: jump to the saved position.
 *
 * The sections above the target are bundled with the page, so its height is
 * already final on the first render and the jump lands in the right place.
 */
const NAV_OFFSET = 120; // px kept free at the top for the fixed navbar
const SAVED_KEY = "onset_home_scroll";

// true once the user used the browser's back/forward buttons
let poppedBack = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    poppedBack = true;
  });
}

// Instant jump (globals.css has scroll-behavior: smooth, so override it for this call)
function jumpTo(y: number) {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, y);
  html.style.scrollBehavior = prev;
}

function targetTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return null;
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET));
}

export default function ScrollToHash() {
  // Runs before paint: no frame is ever drawn at the wrong position
  useLayoutEffect(() => {
    const id = window.location.hash.slice(1);

    if (id) {
      const top = targetTop(id);
      if (top !== null) jumpTo(top);
      return;
    }

    if (poppedBack) {
      poppedBack = false;
      try {
        const saved = sessionStorage.getItem(SAVED_KEY);
        if (saved !== null) {
          sessionStorage.removeItem(SAVED_KEY);
          jumpTo(Number(saved) || 0);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Safety net: if something below changes the page height right after load,
  // quietly re-align (only while the user has not started scrolling themselves).
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    let cancelled = false;
    let stableTicks = 0;
    let elapsed = 0;

    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    window.addEventListener("keydown", cancel, { once: true });

    const timer = setInterval(() => {
      elapsed += 100;
      if (cancelled || elapsed > 3000) {
        clearInterval(timer);
        return;
      }
      const top = targetTop(id);
      if (top === null) return;

      if (Math.abs(window.scrollY - top) > 2) {
        stableTicks = 0;
        jumpTo(top);
      } else {
        stableTicks += 1;
      }

      if (stableTicks >= 5) {
        clearInterval(timer);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }, 100);

    return () => {
      clearInterval(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, []);

  return null;
}