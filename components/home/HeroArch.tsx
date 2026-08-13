"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Lines, EASE } from "@/components/motion";

/**
 * The hero as a gallery plate: the stair hall hangs inside a monumental
 * coquina arch on bone, beneath the headline. Scrolling makes the arch
 * BLOOM to full bleed — the same aperture language as the entrance, the
 * colonnade, and the door itself. No scrims washing out the stone.
 */
const MARQUEE = (
  <div className="marquee-track">
    {[0, 1].map((n) => (
      <div key={n} aria-hidden={n === 1} className="flex shrink-0 items-center">
        {[
          ...site.collaborators.architects,
          ...site.collaborators.interiors,
          ...site.collaborators.landscape,
        ].map((name, i) => (
          <span key={i} className="label flex items-center text-bone/80">
            <span className="whitespace-nowrap px-7">{name}</span>
            <span aria-hidden className="text-bone/40">
              ·
            </span>
          </span>
        ))}
      </div>
    ))}
  </div>
);

function CTAs({ tone }: { tone: "light" | "dark" }) {
  const light = tone === "light";
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      <Link
        href="/build-with-bluedoor"
        className={`label px-8 py-4 transition-colors duration-500 ${
          light
            ? "bg-bone text-navy hover:bg-navy hover:text-bone"
            : "bg-navy text-bone hover:bg-navy-deep"
        }`}
      >
        Build with Bluedoor
      </Link>
      <Link
        href="/portfolio"
        className={`label border-b pb-1.5 transition-colors ${
          light
            ? "border-bone/50 text-bone hover:border-bone"
            : "border-navy/40 text-navy hover:border-navy"
        }`}
      >
        Explore the Portfolio
      </Link>
    </div>
  );
}

export default function HeroArch() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // the arch frame at rest, in px
  const sideRest = Math.max(vp.w * 0.16, (vp.w - 860) / 2);
  const topRest = vp.h * 0.36;
  const bottomRest = vp.h * 0.06;

  const clipPath = useTransform(scrollYProgress, (v) => {
    const t = reduce ? 1 : Math.min(1, Math.max(0, (v - 0.06) / 0.56));
    const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const side = sideRest * (1 - e);
    const top = topRest * (1 - e);
    const bottom = bottomRest * (1 - e);
    // the arch curve rides the frame out, then straightens in the last breath
    const straighten = t >= 0.88 ? (t - 0.88) / 0.12 : 0;
    const radius = ((vp.w - side * 2) / 2) * (1 - straighten);
    return `inset(${top}px ${side}px ${bottom}px ${side}px round ${radius}px ${radius}px 0 0)`;
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.66], [1.07, 1]);
  // NOTE: framer-motion v13 flakes on opacity bound from two-point array maps
  // in nested motion trees — function-form maps are the reliable path here
  // (same fix as the DoorReveal medallion)
  const plateOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.04 ? 1 : v >= 0.26 ? 0 : 1 - (v - 0.04) / 0.22
  );
  const plateY = useTransform(scrollYProgress, [0.04, 0.26], [0, -46]);
  const overlayOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.56 ? 0 : v >= 0.7 ? 1 : (v - 0.56) / 0.14
  );
  const overlayY = useTransform(scrollYProgress, [0.56, 0.7], [28, 0]);
  const overlayVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.5 ? "visible" : "hidden"
  );

  // touch, small screens, and reduced motion: a still gallery plate,
  // photo-first, no scroll choreography
  if (!isDesktop || reduce) {
    return (
      <section className="grain relative flex min-h-[100svh] flex-col bg-bone pt-24">
        <div className="px-5 text-center">
          <motion.p
            className="label-wide mb-4 text-taupe"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            Palm Beach, Florida
          </motion.p>
          <Lines
            as="h1"
            className="display balance text-[2.55rem] leading-[1.05] text-umber"
            lines={["Homes of lasting", "beauty and distinction."]}
            delay={0.15}
          />
        </div>
        <motion.div
          className="img-frame mx-auto mt-7 w-[86vw] max-w-[420px] rounded-t-full md:max-w-[520px]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: EASE }}
        >
          <img
            src="/images/hero-stairhall.jpg"
            alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
            className="aspect-[9/11] w-full object-cover"
            fetchPriority="high"
          />
        </motion.div>
        <motion.div
          className="mt-8 px-5"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
        >
          <CTAs tone="dark" />
        </motion.div>
        <div className="mt-auto pt-8">
          <div className="overflow-hidden border-t border-umber/15 bg-espresso py-3.5">
            {MARQUEE}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[250vh] bg-bone">
      <div className="grain sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* the plate: eyebrow + headline on bone */}
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-[1520px] flex-col items-center px-10 pt-28 text-center"
          style={{ opacity: plateOpacity, y: plateY }}
        >
          <motion.p
            className="label-wide mb-5 text-taupe"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            Palm Beach, Florida
          </motion.p>
          <Lines
            as="h1"
            className="display balance max-w-5xl text-6xl leading-[1.03] text-umber xl:text-[5rem]"
            lines={["Homes of lasting", "beauty and distinction."]}
            delay={0.2}
          />
          <motion.p
            className="serif-body mt-6 text-lg italic text-taupe"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            Scroll — the door is&nbsp;open.
          </motion.p>
        </motion.div>

        {/* the photograph, framed by the arch — blooming to full bleed */}
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <motion.img
            src="/images/hero-stairhall.jpg"
            alt="A coquina stone stair hall in a Bluedoor oceanfront estate"
            className="h-full w-full object-cover"
            style={{ scale: imageScale }}
            fetchPriority="high"
          />
        </motion.div>

        {/* the arrived state: CTAs + the company they keep — a sibling of the
            clip layer, never nested in it */}
        <motion.div
          className="absolute inset-0 z-20 flex flex-col justify-end"
          style={{ opacity: overlayOpacity, y: overlayY, visibility: overlayVisibility }}
        >
          <div className="bg-gradient-to-t from-espresso/65 to-transparent pb-10 pt-28">
            <p className="label-wide mb-6 text-center text-bone/85">
              Palm Beach, Florida
            </p>
            <CTAs tone="light" />
          </div>
          <div className="overflow-hidden border-t border-bone/20 bg-espresso/30 py-4 backdrop-blur-sm">
            {MARQUEE}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
