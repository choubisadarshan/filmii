"use client";

import { useEffect } from "react";

/**
 * When the home page opens with a hash (e.g. "/#work-categories" from the
 * "Back to work" link), scroll to that element.
 *
 * The sections above it are lazy-loaded and change height after first paint,
 * so we keep re-aligning for a moment until the position stops moving.
 */
const NAV_OFFSET = 120; // px kept free at the top for the fixed navbar

export default function ScrollToHash() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const html = document.documentElement;
    let cancelled = false;
    let stableTicks = 0;
    let elapsed = 0;

    // if the user starts scrolling themselves, stop fighting them
    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    window.addEventListener("keydown", cancel, { once: true });

    const timer = setInterval(() => {
      elapsed += 100;
      const el = document.getElementById(id);

      if (cancelled || elapsed > 4000) {
        clearInterval(timer);
        return;
      }
      if (!el) return;

      const target = Math.max(
        0,
        Math.round(el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET)
      );

      if (Math.abs(window.scrollY - target) > 2) {
        stableTicks = 0;
        // globals.css has scroll-behavior: smooth, so force an instant jump
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, target);
        html.style.scrollBehavior = prev;
      } else {
        stableTicks += 1;
      }

      // position held still for ~0.6s -> layout has settled, we're done
      if (stableTicks >= 6) {
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