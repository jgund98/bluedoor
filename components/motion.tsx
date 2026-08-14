"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Her name, written rather than displayed. A soft-edged mask travels left
 * to right at the pace of a hand, so the letters arrive in the order they
 * would be drawn instead of fading in all at once.
 */
export function Signature({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });
  const pen = useMotionValue(-12);
  const ink = useMotionTemplate`linear-gradient(90deg, #000 ${pen}%, rgba(0,0,0,0) calc(${pen}% + 9%))`;

  useEffect(() => {
    if (!seen) return;
    const run = animate(pen, 112, { duration: 2.1, ease: [0.32, 0.72, 0.36, 1], delay });
    return () => run.stop();
  }, [seen, pen, delay]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{
        maskImage: ink,
        WebkitMaskImage: ink,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      {children}
    </motion.span>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 1.05, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A photograph that settles into its frame rather than appearing. */
export function RevealPlate({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
