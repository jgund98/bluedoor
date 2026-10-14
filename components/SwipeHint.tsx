"use client";

import { useEffect, useRef } from "react";

/**
 * A quiet "there is more this way" under a sideways strip, phones only.
 * Place it directly after the scrolling element: it reads its previous
 * sibling, so the strip itself (often a server component) needs no ref.
 *
 * "Swipe" with a small arrow that nudges until the strip is first moved,
 * then fades; a hairline track shows where you are in the strip. Updated on
 * scroll through rAF with transforms only, so it costs nothing to scroll.
 */
export default function SwipeHint({ className = "" }: { className?: string }) {
  const self = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strip = self.current?.previousElementSibling as HTMLElement | null;
    if (!strip) return;
    let raf = 0;
    // where the strip comes to rest on load (snap alignment can move it a
    // few px before anyone touches it); "moved" is measured from there
    let rest: number | null = null;
    const settle = window.setTimeout(() => (rest = strip.scrollLeft), 900);
    const paint = () => {
      raf = 0;
      const max = strip.scrollWidth - strip.clientWidth;
      const hint = self.current;
      if (hint) hint.style.visibility = max > 4 ? "visible" : "hidden";
      if (max <= 4) return;
      const frac = strip.clientWidth / strip.scrollWidth;
      const p = strip.scrollLeft / max;
      if (thumb.current) {
        thumb.current.style.width = `${frac * 100}%`;
        thumb.current.style.transform = `translateX(${(p * (1 - frac) * 100) / frac}%)`;
      }
      if (word.current && rest !== null && Math.abs(strip.scrollLeft - rest) > 24) word.current.dataset.moved = "1";
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    strip.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.clearTimeout(settle);
      strip.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={self} aria-hidden className={`swipe-hint flex items-center gap-4 lg:hidden ${className}`}>
      <span ref={word} className="swipe-word label shrink-0 text-navy/55">
        Swipe <span className="swipe-arrow inline-block">&rarr;</span>
      </span>
      <span className="relative h-px flex-1 overflow-hidden bg-navy/12">
        <span ref={thumb} className="absolute inset-y-0 left-0 bg-navy/50 will-change-transform" />
      </span>
    </div>
  );
}
