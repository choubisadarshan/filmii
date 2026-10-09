"use client";

import { forwardRef, useCallback, useRef, type ComponentProps } from "react";
import { motion } from "framer-motion";

type RevealDivProps = ComponentProps<typeof motion.div>;

/**
 * motion.div for scroll-reveal animations.
 *
 * - Animates only transform + opacity (set via initial / whileInView).
 * - `will-change: transform, opacity` promotes the element to its own GPU
 *   layer WHILE it animates, then is released to "auto" when the animation
 *   finishes, so dozens of finished sections don't keep GPU layers alive.
 */
export const RevealDiv = forwardRef<HTMLDivElement, RevealDivProps>(function RevealDiv(
  { style, onAnimationComplete, ...rest },
  forwardedRef
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  return (
    <motion.div
      ref={setRefs}
      style={{ willChange: "transform, opacity", ...style }}
      onAnimationComplete={(def) => {
        if (innerRef.current) innerRef.current.style.willChange = "auto";
        onAnimationComplete?.(def);
      }}
      {...rest}
    />
  );
});