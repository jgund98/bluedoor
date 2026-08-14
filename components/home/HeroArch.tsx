"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { site } from "@/lib/site";
import { EASE } from "@/components/motion";

/**
 * The signature opening: an editorial plate on warm ivory — the headline
 * lockup composed tightly above a monumental arched portal into the stair
 * hall. Scroll makes the arch bloom outward, slowly and expensively, until
 * the photograph holds the whole frame and the site unfolds from inside it.
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

  // the arch at rest: bottom-anchored portal beneath the headline lockup
  const isMobile = vp.w < 768;
  const archW = isMobile ? vp.w * 0.86 : Math.min(vp.w * 0.56, 860);
  const sideRest = (vp.w - archW) / 2;
  const topRest = isMobile ? vp.h * 0.34 : vp.h * 0.365;

  const clipPath = useTransform(scrollYProgress, (v) => {
    const t = reduce ? 0 : Math.min(1, Math.max(0, (v - 0.05) / 0.55));
    const e = 1 - Math.pow(1 - t, 3);
    const side = sideRest * (1 - e);
    const top = topRest * (1 - e);
    // the crown stays a true semicircle while it can, then straightens away
    const straighten = t >= 0.86 ? (t - 0.86) / 0.14 : 0;
    const radius = ((vp.w - side * 2) / 2) * (1 - straighten);
    return `inset(${top}px ${side}px 0px ${side}px round ${radius}px ${radius}px 0 0)`;
  });
  const imageScale = useTransform(scrollYProgress, (v) => {
    const t = reduce ? 1 : Math.min(1, Math.max(0, (v - 0.05) / 0.6));
    return 1.16 - 0.16 * (1 - Math.pow(1 - t, 2));
  });
  // the lockup gives way as the photograph takes the frame
  const plateOpacity = useTransform(scrollYProgress, (v) =>
    reduce || v <= 0.06 ? 1 : v >= 0.34 ? 0 : 1 - (v - 0.06) / 0.28
  );
  const plateY = useTransform(scrollYProgress, (v) =>
    reduce || v <= 0.06 ? 0 : v >= 0.34 ? -44 : (-44 * (v - 0.06)) / 0.28
  );
  const plateScale = useTransform(scrollYProgress, (v) =>
    reduce || v <= 0.06 ? 1 : v >= 0.34 ? 0.94 : 1 - (0.06 * (v - 0.06)) / 0.28
  );
  const plateVisibility = useTransform(scrollYProgress, (v) =>
    !reduce && v > 0.36 ? "hidden" : "visible"
  );
  // at full bloom, the company they keep drifts in along the bottom edge
  const marqueeOpacity = useTransform(scrollYProgress, (v) =>
    reduce ? 1 : v <= 0.68 ? 0 : v >= 0.85 ? 1 : (v - 0.68) / 0.17
  );

  return (
    <section
      ref={ref}
      className={`relative bg-bone ${reduce ? "" : "h-[240vh] md:h-[260vh]"}`}
    >
      <div
        className={`${
          reduce ? "relative" : "sticky top-0"
        } h-[100dvh] overflow-hidden md:h-screen`}
      >
        {/* the photograph, held by the arch until scroll sets it free */}
        {reduce ? (
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(${topRest}px ${sideRest}px 0px ${sideRest}px round ${archW / 2}px ${archW / 2}px 0 0)`,
            }}
          >
            <img
              src="/images/hero-stairhall.jpg"
              alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
              className="h-full w-full object-cover object-[center_38%]"
              fetchPriority="high"
            />
          </div>
        ) : (
          <motion.div className="absolute inset-0" style={{ clipPath }}>
            <motion.img
              src="/images/hero-stairhall.jpg"
              alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
              className="h-full w-full object-cover object-[center_38%] will-change-transform"
              style={{ scale: imageScale }}
              fetchPriority="high"
            />
          </motion.div>
        )}

        {/* the lockup — composed tight against the crown of the arch */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[100px] text-center md:pt-[124px]"
          style={
            reduce
              ? undefined
              : {
                  opacity: plateOpacity,
                  y: plateY,
                  scale: plateScale,
                  visibility: plateVisibility,
                }
          }
        >
          <motion.p
            className="text-[10px] font-medium uppercase tracking-[0.5em] text-taupe"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            Palm Beach, Florida
          </motion.p>
          <motion.h1
            className="display balance mt-4 text-[2.6rem] leading-[1.04] text-umber sm:text-6xl md:text-[4.6rem]"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          >
            Homes of lasting
            <br />
            beauty and distinction.
          </motion.h1>
        </motion.div>

        {/* the company they keep, arriving with the full frame */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-bone/10 bg-espresso/25 py-3.5 backdrop-blur-sm md:py-4"
          style={reduce ? undefined : { opacity: marqueeOpacity }}
        >
          {MARQUEE}
        </motion.div>
      </div>
    </section>
  );
}
