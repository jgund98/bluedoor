"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { preload } from "react-dom";
import { site } from "@/lib/site";
import { EASE } from "@/components/motion";

/**
 * THE arrival: the site loads as the blue door itself — towering navy
 * double doors, the medallion resting on the seam. The first scroll cracks
 * them with a sliver of warm light, then sweeps them open onto the coquina
 * stair hall. Desktop is scroll-driven; touch gets a timed opening,
 * rebuilt for the phone rather than shrunk from the desktop.
 */

const MARQUEE = (
  <div className="marquee-track">
    {[0, 1].map((n) => (
      <div key={n} aria-hidden={n === 1} className="flex shrink-0 items-center">
        {[
          ...site.collaborators.architects,
          ...site.collaborators.interiors,
          ...site.collaborators.landscape,
        ].map((firm, i) => (
          <span key={i} className="flex items-center text-[10px] font-medium uppercase tracking-[0.32em] text-bone/55">
            <span className="whitespace-nowrap px-8">{firm.name}</span>
            <span aria-hidden className="text-bone/20">
              ·
            </span>
          </span>
        ))}
      </div>
    ))}
  </div>
);

function DoorPanel({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <>
      {/* stile-and-rail paneling, drawn in hairlines */}
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
      {/* the handle */}
      <div
        className={`absolute top-1/2 h-28 w-[3px] -translate-y-1/2 rounded-full bg-bone/25 ${
          left ? "right-[5.5%]" : "left-[5.5%]"
        }`}
      />
      {/* depth on the meeting edge */}
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

/**
 * The settled hero: the doors have parted, but their geometry remains —
 * a dedication plaque of the same stile-and-rail hairlines, hung on the
 * hall's exact axis. The words become part of the architecture.
 */
function Arrived({
  asMotion,
  style,
}: {
  asMotion?: boolean;
  style?: Record<string, unknown>;
}) {
  const Wrapper = asMotion ? motion.div : "div";
  return (
    <Wrapper
      className="absolute inset-0 z-20 flex flex-col"
      style={style as never}
    >
      <div className="flex flex-1 items-center justify-center px-5 pb-8 pt-20 md:items-end md:pb-24">
        <div className="relative w-full max-w-xl">
          {/* not a card — a veil in the air: the image softens behind the
              words and feathers back to full clarity at the edges */}
          <div
            aria-hidden
            className="absolute -inset-x-16 -inset-y-10 bg-espresso/20 backdrop-blur-[7px]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 92% 94% at center, black 50%, transparent 92%)",
              maskImage:
                "radial-gradient(ellipse 92% 94% at center, black 50%, transparent 92%)",
            }}
          />
          <div className="relative px-2 py-2 text-center">
            <p className="on-photo text-[9px] font-medium uppercase tracking-[0.55em] text-bone/80">
              Boutique Custom Home Builder
            </p>
            <h1 className="display on-photo balance mt-5 text-[2.1rem] leading-[1.08] text-bone sm:text-4xl md:text-5xl">
              Homes of lasting beauty and&nbsp;distinction.
            </h1>
            <p className="serif-body on-photo mt-3 text-base italic text-bone/85">
              Palm Beach, Florida
            </p>
            <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
              <Link
                href="/build-with-bluedoor"
                className="label whitespace-nowrap bg-bone px-8 py-4 text-navy transition-colors duration-500 hover:bg-navy hover:text-bone"
              >
                Build with Bluedoor
              </Link>
              <Link
                href="/portfolio"
                className="on-photo whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-bone/85 underline decoration-bone/40 underline-offset-8 transition-colors hover:text-bone hover:decoration-bone"
              >
                Explore the Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden border-t border-bone/10 bg-espresso/25 py-3.5 backdrop-blur-sm md:py-4">
        {MARQUEE}
      </div>
    </Wrapper>
  );
}

export default function HeroDoors() {
  // the hall must be standing before the doors ever crack
  preload("/images/hero-stairhall.jpg", { as: "image", fetchPriority: "high" });
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // door choreography — all function-form (framer v13 array-map flake)
  const doorEase = (v: number) => {
    // crack 0.06→0.14, sweep to 0.58
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.52));
    const cracked = Math.min(t, 0.155) * 0.08; // slow first inches
    const swept = t <= 0.155 ? 0 : (t - 0.155) / 0.845;
    return cracked + (1 - Math.pow(1 - swept, 3)) * 0.99;
  };
  const leftX = useTransform(scrollYProgress, (v) => `${-102 * doorEase(v)}%`);
  const rightX = useTransform(scrollYProgress, (v) => `${102 * doorEase(v)}%`);
  const medallionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.05 ? 1 : v >= 0.15 ? 0 : 1 - (v - 0.05) / 0.1
  );
  const medallionScale = useTransform(scrollYProgress, (v) =>
    v <= 0.05 ? 1 : v >= 0.15 ? 1.25 : 1 + ((v - 0.05) / 0.1) * 0.25
  );
  // the sliver of light where the doors first part
  const crackOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.055 || v >= 0.24) return 0;
    if (v < 0.11) return (v - 0.055) / 0.055;
    return 1 - (v - 0.11) / 0.13;
  });
  const whisperOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.02 ? 1 : v >= 0.08 ? 0 : 1 - (v - 0.02) / 0.06
  );
  const imageScale = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.6));
    return 1.15 - 0.15 * (1 - Math.pow(1 - t, 2));
  });
  const arrivedOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.5 ? 0 : v >= 0.64 ? 1 : (v - 0.5) / 0.14
  );
  const arrivedY = useTransform(scrollYProgress, (v) =>
    v <= 0.5 ? 30 : v >= 0.64 ? 0 : 30 * (1 - (v - 0.5) / 0.14)
  );
  const arrivedVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.45 ? "visible" : "hidden"
  );

  /* ————— reduced motion: the settled hero, no theatre ————— */
  if (reduce) {
    return (
      <section className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-bone">
        <img
          src="/images/hero-stairhall.jpg"
          alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <Arrived />
      </section>
    );
  }

  /* ————— the scroll opens the door — every device ————— */
  return (
    <section ref={ref} className="relative h-[220vh] bg-bone md:h-[300vh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden md:h-screen">
        {/* the hall beyond */}
        <motion.img
          src="/images/hero-stairhall.jpg"
          alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ scale: imageScale }}
          fetchPriority="high"
        />

        {/* arrived content */}
        <Arrived
          asMotion
          style={{
            opacity: arrivedOpacity,
            y: arrivedY,
            visibility: arrivedVisibility,
          }}
        />

        {/* light through the crack */}
        <motion.div
          className="absolute left-1/2 top-0 z-30 h-full w-24 -translate-x-1/2"
          style={{ opacity: crackOpacity }}
        >
          <div className="h-full w-full bg-[radial-gradient(ellipse_40%_60%_at_center,rgba(247,240,220,0.95),rgba(247,240,220,0.25)_55%,transparent_75%)] blur-[6px]" />
        </motion.div>

        {/* the doors */}
        <motion.div
          className="absolute inset-y-0 left-0 z-40 w-1/2 bg-navy will-change-transform"
          style={{ x: leftX }}
        >
          <DoorPanel side="left" />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 right-0 z-40 w-1/2 bg-navy will-change-transform"
          style={{ x: rightX }}
        >
          <DoorPanel side="right" />
        </motion.div>

        {/* the medallion on the seam */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: medallionOpacity, scale: medallionScale }}
        >
          <motion.img
            src="/images/logo.png"
            alt="Bluedoor Building"
            className="w-[min(420px,58vw)] rounded-full shadow-[0_0_0_1px_rgba(247,243,235,0.35),0_0_120px_rgba(0,0,0,0.5)] md:w-[min(420px,30vw)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
          />
        </motion.div>

        {/* the invitation */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-50 flex flex-col items-center pb-9"
          style={{ opacity: whisperOpacity }}
        >
          <motion.p
            className="serif-body mb-4 px-6 text-center text-lg italic text-bone/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9 }}
          >
            A boutique custom home builder — Palm Beach,&nbsp;Florida
          </motion.p>
          <motion.p
            className="label-wide text-bone/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
          >
            Scroll to enter
          </motion.p>
          <motion.span
            className="mt-4 block h-10 w-px bg-bone/40"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, delay: 1.4, ease: EASE }}
          />
        </motion.div>
      </div>
    </section>
  );
}
