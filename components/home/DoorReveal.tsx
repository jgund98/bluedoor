"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

/**
 * The brand's namesake moment, mid-page: towering navy doors carrying the
 * medallion part as the visitor scrolls, opening onto an oceanfront room.
 * The composed scene holds before the page moves on.
 */

function DoorPanel({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <>
      <div
        className={`absolute inset-y-[5%] border border-bone/12 ${
          left ? "left-[9%] right-[11%]" : "left-[11%] right-[9%]"
        }`}
      />
      <div
        className={`absolute inset-y-[13%] border border-bone/8 ${
          left ? "left-[17%] right-[19%]" : "left-[19%] right-[17%]"
        }`}
      />
      <div
        className={`absolute top-1/2 h-24 w-[3px] -translate-y-1/2 rounded-full bg-bone/25 ${
          left ? "right-[5.5%]" : "left-[5.5%]"
        }`}
      />
      <div
        className={`absolute inset-y-0 w-10 ${
          left
            ? "right-0 bg-gradient-to-l from-navy-deep/70 to-transparent"
            : "left-0 bg-gradient-to-r from-navy-deep/70 to-transparent"
        }`}
      />
    </>
  );
}

function Caption({ style }: { style?: Record<string, unknown> }) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-6 pb-[10vh] pt-32 text-center"
      style={style as never}
    >
      <div className="relative flex flex-col items-center">
        <div
          aria-hidden
          className="absolute -inset-x-40 -inset-y-14 bg-espresso/25 backdrop-blur-[7px]"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)",
            maskImage:
              "radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)",
          }}
        />
        <div className="relative flex flex-col items-center">
          <p className="label-wide on-photo mb-5 text-bone">Bluedoor Building</p>
          <p className="display on-photo balance text-[2rem] text-bone sm:text-4xl md:text-6xl">
            Every home begins at the blue&nbsp;door.
          </p>
          <Link
            href="/portfolio"
            className="on-photo mt-9 text-[11px] font-medium uppercase tracking-[0.34em] text-bone underline decoration-bone/40 underline-offset-8 transition-colors hover:decoration-bone"
          >
            Explore the Portfolio
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DoorReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // doors open through the first half; the composed scene then HOLDS
  const doorEase = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - 0.08) / 0.44));
    return 1 - Math.pow(1 - t, 3);
  };
  const leftX = useTransform(scrollYProgress, (v) => `${-102 * doorEase(v)}%`);
  const rightX = useTransform(scrollYProgress, (v) => `${102 * doorEase(v)}%`);
  const medallionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.05 ? 1 : v >= 0.16 ? 0 : 1 - (v - 0.05) / 0.11
  );
  const imageScale = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.08) / 0.5));
    return 1.14 - 0.14 * (1 - Math.pow(1 - t, 2));
  });
  const captionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.44 ? 0 : v >= 0.58 ? 1 : (v - 0.44) / 0.14
  );
  const captionY = useTransform(scrollYProgress, (v) =>
    v <= 0.44 ? 26 : v >= 0.58 ? 0 : 26 * (1 - (v - 0.44) / 0.14)
  );
  const captionVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.4 ? "visible" : "hidden"
  );

  /* ————— reduced motion: the open scene, no theatre ————— */
  if (reduce) {
    return (
      <section className="relative h-[80vh] overflow-hidden bg-espresso">
        <img
          src="/images/loggia-ocean.jpg"
          alt="An oceanfront living room opening onto the Atlantic"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <Caption />
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[300vh] bg-linen">
      <div className="sticky top-0 h-[100dvh] overflow-hidden md:h-screen">
        {/* the room beyond */}
        <motion.img
          src="/images/loggia-ocean.jpg"
          alt="An oceanfront living room opening onto the Atlantic"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ scale: imageScale }}
          loading="lazy"
        />

        <Caption
          style={{
            opacity: captionOpacity,
            y: captionY,
            visibility: captionVisibility,
          }}
        />

        {/* the doors */}
        <motion.div
          className="absolute inset-y-0 left-0 z-30 w-1/2 bg-navy will-change-transform"
          style={{ x: leftX }}
        >
          <DoorPanel side="left" />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 right-0 z-30 w-1/2 bg-navy will-change-transform"
          style={{ x: rightX }}
        >
          <DoorPanel side="right" />
        </motion.div>

        {/* the medallion on the seam */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: medallionOpacity }}
        >
          <img
            src="/images/logo.png"
            alt="Bluedoor Building"
            className="w-[min(220px,46vw)] rounded-full shadow-[0_0_0_1px_rgba(251,249,244,0.35),0_0_90px_rgba(0,0,0,0.45)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
