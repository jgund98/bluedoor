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
 * Headline whose words rise out of a per-line mask and settle upright —
 * type being set, one word after the next.
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
  let wordCount = 0;
  return (
    <MotionTag
      className={className}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          {line.split(" ").map((word, w) => {
            const order = wordCount++;
            return (
              <span key={w} className="inline-block whitespace-pre">
                <motion.span
                  className="inline-block origin-bottom-left will-change-transform"
                  variants={{
                    hidden: { y: "115%", rotate: 2.4 },
                    show: {
                      y: 0,
                      rotate: 0,
                      transition: {
                        duration: 0.95,
                        delay: delay + order * 0.05,
                        ease: EASE,
                      },
                    },
                  }}
                >
                  {word}
                  {w < line.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * A long serif statement that arrives out of soft focus — reserved for the
 * few full-sentence set pieces (commitment, pull quotes), never body copy.
 */
export function Statement({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className={className}
      initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      {children}
    </motion.p>
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
