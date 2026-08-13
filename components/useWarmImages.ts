"use client";

import { useEffect } from "react";

/**
 * Quietly pull a page's photography into the browser cache just after mount,
 * at low priority — so no reveal, however fast the visitor scrolls, ever
 * starts before its photograph is ready.
 */
export function useWarmImages(srcs: readonly string[], delay = 600) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      for (const src of srcs) {
        const img = new Image();
        img.fetchPriority = "low";
        img.decoding = "async";
        img.src = src;
      }
    }, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
