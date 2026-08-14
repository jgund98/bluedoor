"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { site } from "@/lib/site";
import { EASE, Lines } from "@/components/motion";

/**
 * THE signature, in three beats.
 * 1 — The site loads as the blue door: navy panels, the medallion on the seam.
 * 2 — Scroll parts the doors onto the ivory monograph page: serif lockup
 *     over an arched portal into the stair hall. Not a photograph with
 *     text on it — a composed editorial plate.
 * 3 — Scroll again and the arch blooms outward until the photograph holds
 *     the whole frame, and the site unfolds from inside it.
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
          <span
            key={i}
            className="flex items-center text-[10px] font-medium uppercase tracking-[0.32em] text-bone/55"
          >
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

const easeOut3 = (x: number) => 1 - Math.pow(1 - x, 3);

export default function HeroArch() {
  preload("/images/hero-stairhall.jpg", { as: "image", fetchPriority: "high" });
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [vp, setVp] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const measure = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // a whisper of pointer parallax inside the portal
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parX = useSpring(rawX, { stiffness: 38, damping: 18 });
  const parY = useSpring(rawY, { stiffness: 38, damping: 18 });

  // the arch at rest on the monograph page
  const isMobile = vp.w < 768;
  const archW = isMobile ? vp.w * 0.86 : Math.min(vp.w * 0.56, 860);
  const topRest = isMobile ? vp.h * 0.34 : vp.h * 0.365;

  /* the single act: the doors part, unhurried (0.06 → 0.7) */
  const doorEase = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.64));
    // easeInOut — a door opened by hand, not thrown
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  // the paintings and the page materialize with the same single motion
  const pageArrival = useTransform(scrollYProgress, (v) => doorEase(v));
  const leftX = useTransform(scrollYProgress, (v) => `${-102 * doorEase(v)}%`);
  const rightX = useTransform(scrollYProgress, (v) => `${102 * doorEase(v)}%`);
  const doorsVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.76 ? "hidden" : "visible"
  );
  const medallionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.05 ? 1 : v >= 0.2 ? 0 : 1 - (v - 0.05) / 0.15
  );
  const whisperOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.02 ? 1 : v >= 0.08 ? 0 : 1 - (v - 0.02) / 0.06
  );
  // the page behind the doors: a still monograph plate. The photograph
  // settles by a breath as the doors open — one motion, one act.
  const clipPath = `inset(${topRest}px ${(vp.w - archW) / 2}px 0px ${(vp.w - archW) / 2}px round ${archW / 2}px ${archW / 2}px 0 0)`;
  const imageScale = useTransform(scrollYProgress, (v) => 1.2 - 0.04 * doorEase(v));

  /* ————— reduced motion: the monograph page, no theatre ————— */
  if (reduce) {
    return (
      <section className="relative h-[100dvh] min-h-[620px] overflow-hidden bg-bone md:h-screen">
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(${topRest}px ${(vp.w - archW) / 2}px 0px ${(vp.w - archW) / 2}px round ${archW / 2}px ${archW / 2}px 0 0)`,
          }}
        >
          <img
            src="/images/hero-stairhall.jpg"
            alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
            className="h-full w-full object-cover object-[center_38%]"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-x-0 top-0 flex flex-col items-center px-5 pt-[100px] text-center md:pt-[124px]">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-taupe">
            Palm Beach, Florida
          </p>
          <h1 className="display balance mt-4 text-[2.6rem] leading-[1.04] text-umber sm:text-6xl md:text-[4.6rem]">
            Homes of lasting
            <br />
            beauty and distinction.
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[175vh] bg-bone md:h-[190vh]">
      <div
        className="sticky top-0 h-[100dvh] overflow-hidden md:h-screen"
        onMouseMove={(e) => {
          rawX.set((e.clientX / vp.w - 0.5) * 14);
          rawY.set((e.clientY / vp.h - 0.5) * 9);
        }}
        onMouseLeave={() => {
          rawX.set(0);
          rawY.set(0);
        }}
      >
        {/* the monograph page: the photograph held by the arch */}
        <div className="absolute inset-0" style={{ clipPath }}>
          <motion.img
            src="/images/hero-stairhall.jpg"
            alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
            className="h-full w-full object-cover object-[center_38%] will-change-transform"
            style={{ scale: imageScale, x: parX, y: parY }}
            fetchPriority="high"
          />
        </div>

        {/* the lockup — composed tight against the crown of the arch */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[100px] text-center md:pt-[124px]">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-taupe">
            Palm Beach, Florida
          </p>
          <Lines
            as="h1"
            className="display balance mt-4 text-[2.6rem] leading-[1.04] text-umber sm:text-6xl md:text-[4.6rem]"
            lines={["Homes of lasting", "beauty and distinction."]}
            delay={0.2}
          />
        </div>

        {/* her paintings, hung large in the page's flanking voids */}
        <motion.div
          className="pointer-events-none absolute bottom-[14%] left-[4.5%] z-10 hidden w-[min(300px,19vw)] -rotate-[2.5deg] lg:block"
          style={{ opacity: pageArrival }}
        >
          <div className="border border-umber/10 bg-white p-2.5 shadow-[0_30px_70px_-30px_rgba(53,48,42,0.45)]">
            <img src="/images/watercolor-4.jpg" alt="" loading="lazy" className="h-auto w-full" />
          </div>
          <p className="serif-body mt-4 text-center text-[14px] italic text-taupe">
            Every home, painted before it is&nbsp;poured.
          </p>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute right-[4%] top-[42%] z-10 hidden w-[min(330px,21vw)] rotate-[2deg] lg:block"
          style={{ opacity: pageArrival }}
        >
          <div className="border border-umber/10 bg-white p-2.5 shadow-[0_30px_70px_-30px_rgba(53,48,42,0.45)]">
            <img src="/images/watercolor-5.jpg" alt="" loading="lazy" className="h-auto w-full" />
          </div>
        </motion.div>

        {/* beat 1: the doors */}
        <motion.div
          className="absolute inset-y-0 left-0 z-40 w-1/2 bg-navy will-change-transform"
          style={{ x: leftX, visibility: doorsVisibility }}
        >
          <DoorPanel side="left" />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 right-0 z-40 w-1/2 bg-navy will-change-transform"
          style={{ x: rightX, visibility: doorsVisibility }}
        >
          <DoorPanel side="right" />
        </motion.div>

        {/* the medallion on the seam */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: medallionOpacity, visibility: doorsVisibility }}
        >
          <motion.img
            src="/images/logo.png"
            alt="Bluedoor Building"
            className="w-[min(420px,58vw)] rounded-full shadow-[0_0_0_1px_rgba(251,249,244,0.35),0_0_120px_rgba(0,0,0,0.5)] md:w-[min(420px,30vw)]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
          />
        </motion.div>

        {/* the invitation */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-50 flex flex-col items-center pb-9"
          style={{ opacity: whisperOpacity, visibility: doorsVisibility }}
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
            className="text-[10px] font-medium uppercase tracking-[0.42em] text-bone/75"
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

        {/* the company they keep — waiting quietly beneath the doors */}
        <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-bone/10 bg-espresso/25 py-3.5 backdrop-blur-sm md:py-4">
          {MARQUEE}
        </div>
      </div>
    </section>
  );
}
