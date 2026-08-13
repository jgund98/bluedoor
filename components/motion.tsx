"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades + rises content into view once, on scroll. */
export function FadeUp({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline whose lines rise out of a mask, one after another.
 * IMPORTANT: the viewport observer lives on the (never-clipped) heading —
 * a fully-masked child can never intersect, so it must not observe itself.
 */
export function Lines({
  lines,
  className,
  as: Tag = "h2",
  delay = 0,
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block will-change-transform"
            variants={{
              hidden: { y: "110%" },
              show: {
                y: 0,
                transition: { duration: 1.0, delay: delay + i * 0.12, ease: EASE },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * Image that unveils from the bottom with a settling scale.
 * Same rule: the observer sits on the unclipped frame, variants do the work.
 */
export function ImageReveal({
  src,
  alt,
  className,
  imgClassName,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`img-frame ${className ?? ""}`}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="h-full w-full"
        variants={{
          hidden: { clipPath: "inset(100% 0 0 0)" },
          show: {
            clipPath: "inset(0% 0 0 0)",
            transition: { duration: 1.1, delay, ease: EASE },
          },
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover will-change-transform ${imgClassName ?? ""}`}
          variants={{
            hidden: { scale: 1.12 },
            show: { scale: 1, transition: { duration: 1.4, delay, ease: EASE } },
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/** Gentle vertical parallax for a child inside an overflow-hidden frame. */
export function Parallax({
  children,
  amount = 40,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

export { EASE };
