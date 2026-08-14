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

/** One painting on the studio wall — it hangs, then takes its leave. */
function OverturePainting({
  piece,
  index,
  progress,
  flyT,
}: {
  piece: { src: string; cls: string; rot: number; fx: number; fy: number; fr: number };
  index: number;
  progress: import("framer-motion").MotionValue<number>;
  flyT: (v: number) => number;
}) {
  const stagger = index * 0.035;
  const x = useTransform(progress, (v) => {
    const t = easeOut3(Math.min(1, Math.max(0, flyT(v) - stagger) / (1 - stagger)));
    return `${piece.fx * t}vw`;
  });
  const y = useTransform(progress, (v) => {
    const t = easeOut3(Math.min(1, Math.max(0, flyT(v) - stagger) / (1 - stagger)));
    return `${piece.fy * t}vh`;
  });
  const rotate = useTransform(progress, (v) => {
    const t = easeOut3(Math.min(1, Math.max(0, flyT(v) - stagger) / (1 - stagger)));
    return piece.rot + piece.fr * t;
  });
  return (
    <motion.div
      className={`absolute ${piece.cls}`}
      style={{ x, y, rotate }}
    >
      <div className="border border-umber/10 bg-white p-2 shadow-[0_24px_55px_-28px_rgba(53,48,42,0.45)]">
        <img src={piece.src} alt="" loading="lazy" className="h-auto w-full" />
      </div>
    </motion.div>
  );
}

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

  /* act one: the doors part, unhurried (0.04 → 0.26) */
  const doorEase = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - 0.04) / 0.22));
    // easeInOut — a door opened by hand, not thrown
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  /* act two: the studio wall — paintings hang, then take their leave */
  const flyT = (v: number) => Math.min(1, Math.max(0, (v - 0.4) / 0.24));
  const overtureBackdrop = useTransform(scrollYProgress, (v) =>
    v <= 0.46 ? 1 : v >= 0.62 ? 0 : 1 - (v - 0.46) / 0.16
  );
  const overtureVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.66 ? "hidden" : "visible"
  );
  const overtureLogoOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.4) return 1;
    if (v >= 0.56) return 0;
    return 1 - (v - 0.4) / 0.16;
  });
  const leftX = useTransform(scrollYProgress, (v) => `${-102 * doorEase(v)}%`);
  const rightX = useTransform(scrollYProgress, (v) => `${102 * doorEase(v)}%`);
  const doorsVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.3 ? "hidden" : "visible"
  );
  const medallionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.03 ? 1 : v >= 0.12 ? 0 : 1 - (v - 0.03) / 0.09
  );
  const whisperOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.02 ? 1 : v >= 0.08 ? 0 : 1 - (v - 0.02) / 0.06
  );
  // the page behind the doors: a still monograph plate. The photograph
  // settles by a breath as the doors open — one motion, one act.
  const clipPath = `inset(${topRest}px ${(vp.w - archW) / 2}px 0px ${(vp.w - archW) / 2}px round ${archW / 2}px ${archW / 2}px 0 0)`;
  const imageScale = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.45) / 0.3));
    return 1.2 - 0.04 * (1 - Math.pow(1 - t, 2));
  });

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
    <section ref={ref} className="relative h-[260vh] bg-bone md:h-[280vh]">
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

        {/* act two: the studio wall — her paintings, hung around the mark */}
        <motion.div
          className="absolute inset-0 z-30"
          style={{ visibility: overtureVisibility }}
        >
          {/* its own ivory wall, dissolving as the paintings leave */}
          <motion.div
            className="absolute inset-0 bg-bone"
            style={{ opacity: overtureBackdrop }}
          />
          {(
            [
              { src: "/images/watercolor-1.jpg", cls: "left-[8%] top-[16%] w-[190px] md:left-[13%] md:w-[240px]", rot: -4, fx: -60, fy: -12, fr: -14 },
              { src: "/images/watercolor-3.jpg", cls: "right-[8%] top-[13%] w-[170px] md:right-[14%] md:w-[215px]", rot: 3, fx: 62, fy: -16, fr: 12, hideMobile: false },
              { src: "/images/watercolor-4.jpg", cls: "hidden md:block md:left-[21%] md:bottom-[10%] md:w-[200px]", rot: 2.2, fx: -55, fy: 20, fr: -10, hideMobile: true },
              { src: "/images/watercolor-5.jpg", cls: "bottom-[12%] right-[10%] w-[200px] md:bottom-[14%] md:right-[19%] md:w-[250px]", rot: -2.6, fx: 58, fy: 18, fr: 12 },
              { src: "/images/watercolor-2.jpg", cls: "bottom-[14%] left-[10%] w-[160px] md:left-auto md:bottom-auto md:left-1/2 md:top-[7%] md:w-[185px] md:-translate-x-1/2", rot: 1.6, fx: 0, fy: -70, fr: 6 },
            ] as const
          ).map((p, i) => (
            <OverturePainting key={p.src} piece={p} index={i} progress={scrollYProgress} flyT={flyT} />
          ))}
          {/* the mark at the centre of the wall */}
          <motion.div
            className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ opacity: overtureLogoOpacity }}
          >
            <img
              src="/images/logo.png"
              alt=""
              className="mx-auto w-[110px] rounded-full shadow-[0_0_0_1px_rgba(53,48,42,0.12),0_24px_60px_-24px_rgba(53,48,42,0.4)] md:w-[130px]"
            />
            <p className="serif-body mt-5 text-[15px] italic text-taupe">
              Every home, painted before it is&nbsp;poured.
            </p>
          </motion.div>
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
