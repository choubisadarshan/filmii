import { useCallback, useEffect, useRef } from "react";

/** Run `fn` at most once every `ms` milliseconds (leading + trailing call). */
export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;

  const throttled = (...args: A) => {
    const now = performance.now();
    const remaining = ms - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      if (timer) clearTimeout(timer);
      timer = undefined;
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = performance.now();
        timer = undefined;
        if (lastArgs) fn(...lastArgs);
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return throttled;
}

/** Run `fn` only after `ms` milliseconds without a new call. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

/**
 * React hook: returns a stable function that calls the latest `fn`
 * at most once every `ms` milliseconds (leading edge only).
 */
export function useThrottledCallback<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const fnRef = useRef(fn);
  const lastRef = useRef(0);

  useEffect(() => {
    fnRef.current = fn;
  });

  return useCallback(
    (...args: A) => {
      const now = performance.now();
      if (now - lastRef.current < ms) return;
      lastRef.current = now;
      fnRef.current(...args);
    },
    [ms]
  );
}