"use client";

import { useLayoutEffect } from "react";

export default function ResetScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    // globals.css has scroll-behavior: smooth, so force an instant jump
    const jump = () => {
      const el = document.documentElement;
      const prev = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      el.style.scrollBehavior = prev;
    };
    jump();
    const t = setTimeout(jump, 300); // lazy sections shift layout after first paint
    window.addEventListener("load", jump);
    window.addEventListener("pagehide", jump);
    window.addEventListener("beforeunload", jump);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", jump);
      window.removeEventListener("pagehide", jump);
      window.removeEventListener("beforeunload", jump);
    };
  }, []);
  return null;
}