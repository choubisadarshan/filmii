"use client";

import { useLayoutEffect } from "react";

export default function ResetScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    const toTop = () => window.scrollTo(0, 0);
    window.addEventListener("pagehide", toTop);
    window.addEventListener("beforeunload", toTop);
    return () => {
      window.removeEventListener("pagehide", toTop);
      window.removeEventListener("beforeunload", toTop);
    };
  }, []);

  return null;
}