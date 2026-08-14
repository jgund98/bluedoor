"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MotionValue } from "framer-motion";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { heroRail, heroRailMobile, written } from "@/lib/site";

// Measure before the browser paints, so the rail never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * One screen, no frame. Her houses drift across the top of the page and
 * dissolve into paper, and the words come up out of the white below them.
 * Nothing is outlined, nothing opens — the only movement is the work
 * going by.
 */
export default function HeroProcession() {
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 1440, mobile: false, ready: false });

  useMeasure(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (!w) return;
      // Width only. A phone's stage changes height as the URL bar collapses,
      // and reacting to that mid-scroll is what read as the hero animating.
      setBox((prev) =>
        Math.round(w) === Math.round(prev.w) && prev.ready
          ? prev
          : { w, mobile: w < 1024, ready: true },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rail = box.mobile ? heroRailMobile : heroRail;
  const plateW = box.mobile ? Math.round(box.w * 0.6) : Math.round(box.w * 0.34);
  const railW = rail.length * plateW;

  const x = useMotionValue(0);
  const onStage = useRef(true);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (onStage.current = e.isIntersecting), {
      rootMargin: "10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!onStage.current || !railW) return;
    const d = delta > 64 ? 64 : delta; // a dropped frame must not jump the rail
    let next = x.get() - ((box.mobile ? 20 : 30) * d) / 1000;
    if (next <= -railW) next += railW;
    x.set(next);
  });

  return (
    <section
      ref={stage}
      className="relative h-[100dvh] w-full overflow-hidden bg-porcelain grain"
    >
      {/* the work, going by */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          box.ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {box.ready && <Rail rail={rail} x={x} plateW={plateW} railW={railW} />}
      </div>

      {/* and the paper it dissolves into */}
      <div className="pointer-events-none absolute inset-0 bg-porcelain/55" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26%] bg-gradient-to-b from-porcelain via-porcelain/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-porcelain via-porcelain/94 to-transparent" />

      {/* the words, low on the page */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[16svh] text-center lg:pb-[15svh]">
        <span className="label text-navy/70">{written.heroEyebrow}</span>
        <h1 className="mt-6 text-ink lg:mt-7">
          <span className="display block text-[clamp(30px,7.4vw,40px)] lg:text-[clamp(44px,3.9vw,62px)]">
            {written.heroLine}
          </span>
          <span className="answer mt-1 block text-[clamp(31px,7.7vw,42px)] text-navy lg:mt-2 lg:text-[clamp(46px,4.1vw,66px)]">
            {written.heroAnswer}
          </span>
        </h1>

        {/* The way opens: two hairlines draw out from the words on hover,
            the same broken rule the header uses. */}
        <Link
          href="/build-with-bluedoor/"
          className="group mt-9 inline-flex items-center gap-5 lg:mt-11 lg:gap-6"
        >
          <span className="h-px w-10 bg-navy/30 transition-all duration-700 ease-out group-hover:w-20 group-hover:bg-navy/55 lg:w-14" />
          <span className="label whitespace-nowrap text-navy transition-opacity duration-700 group-hover:opacity-70">
            {written.inviteCta}
          </span>
          <span className="h-px w-10 bg-navy/30 transition-all duration-700 ease-out group-hover:w-20 group-hover:bg-navy/55 lg:w-14" />
        </Link>
      </div>

      {/* the margins, used */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-12 pb-11 lg:flex">
        <div className="flex items-center gap-4">
          <span className="h-14 w-px bg-navy/25" />
          <span className="label text-ink/45">{written.scrollCue}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="label text-ink/45">{written.heroFoot}</span>
          <span className="h-14 w-px bg-navy/25" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center lg:hidden">
        <span className="label text-ink/40">{written.heroFoot}</span>
      </div>
    </section>
  );
}

function Rail({
  rail,
  x,
  plateW,
  railW,
}: {
  rail: readonly { src: string; pos: string }[];
  x: MotionValue<number>;
  plateW: number;
  railW: number;
}) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 flex items-stretch"
      style={{ x, width: railW * 2, willChange: "transform" }}
    >
      {[...rail, ...rail].map((img, i) => (
        <div key={i} className="plate h-full shrink-0" style={{ width: plateW }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt=""
            loading={i < 4 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </div>
      ))}
    </motion.div>
  );
}
