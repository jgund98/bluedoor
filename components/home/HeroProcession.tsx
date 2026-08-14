"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { heroRail, heroRailMobile, written } from "@/lib/site";
import { DoorLeaf } from "@/components/Door";

// Measure before the browser paints, so the stage never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * One screen. Her houses glide past behind an arched opening, the door
 * standing open at the jambs, and nothing moves but the procession. The
 * blue door has its moment at the foot of the page; up here the site
 * simply holds still and lets the work go by.
 */
export default function HeroProcession() {
  const stage = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState({ w: 1440, h: 900, mobile: false, ready: false });
  useMeasure(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        setBox({ w: r.width, h: r.height, mobile: r.width < 1024, ready: true });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rail = box.mobile ? heroRailMobile : heroRail;
  // Each plate has to be wider than the opening, or a seam parks in the
  // middle of the arch and reads as a mistake.
  const plateW = box.mobile ? Math.round(box.w * 0.84) : Math.round(box.w * 0.46);
  const railW = rail.length * plateW;

  const apW = box.mobile ? Math.round(box.w * 0.7) : Math.min(Math.round(box.w * 0.3), 440);
  const apH = Math.round(box.h * (box.mobile ? 0.62 : 0.6));
  const insetX = (box.w - apW) / 2;
  const insetTop = box.h - apH;

  const arch = `inset(${insetTop}px ${insetX}px 0px ${insetX}px round ${apW / 2}px ${apW / 2}px 3px 3px / ${apH * 0.3}px ${apH * 0.3}px 0px 0px)`;
  const archCase = `inset(${insetTop - 10}px ${insetX - 10}px -10px ${insetX - 10}px round ${
    apW / 2 + 10
  }px ${apW / 2 + 10}px 3px 3px / ${apH * 0.3 + 10}px ${apH * 0.3 + 10}px 0px 0px)`;

  // the picture sits in the opening at its middle, not at its floor
  const lookY = (box.h - apH) / 2;

  /* ---- the only thing that moves ---- */
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

  // A house rests centred in the opening, then the procession glides on to
  // the next one. Not a conveyor — a considered turn of the page.
  const HOLD = 4200;
  const GLIDE = 1600;
  const at = (i: number) => box.w / 2 - plateW / 2 - (i + 1) * plateW;
  const index = useRef(0);
  const moving = useRef(false);
  const mark = useRef(0);

  useAnimationFrame((t) => {
    if (!onStage.current || !railW) return;
    if (!mark.current) {
      mark.current = t;
      x.set(at(0));
      return;
    }
    const elapsed = t - mark.current;

    if (!moving.current) {
      if (elapsed >= HOLD) {
        moving.current = true;
        mark.current = t;
      }
      return;
    }

    const k = elapsed / GLIDE;
    if (k >= 1) {
      index.current = (index.current + 1) % rail.length;
      x.set(at(index.current));
      moving.current = false;
      mark.current = t;
      return;
    }
    const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const from = at(index.current);
    x.set(from + (at(index.current + 1) - from) * eased);
  });

  return (
    <section
      ref={stage}
      className="relative h-[100dvh] w-full overflow-hidden bg-porcelain grain"
    >
      {/* the world outside the doorway — the same procession, veiled back
          to near-paper */}
      <div className="absolute inset-0">
        {box.ready && <Rail rail={rail} x={x} plateW={plateW} railW={railW} />}
        <div className="absolute inset-0 bg-porcelain/74" />
        <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-porcelain via-porcelain/72 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-porcelain/92 to-transparent" />
      </div>

      {/* Everything below is sized from the measured stage, so it stays
          hidden until that measurement exists. */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          box.ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* the casing */}
        <div
          className="pointer-events-none absolute inset-0 bg-porcelain"
          style={{
            clipPath: archCase,
            WebkitClipPath: archCase,
            filter: box.mobile ? undefined : "drop-shadow(0 34px 54px rgba(20,41,74,0.34))",
          }}
        />

        {/* what you can see through it */}
        <div
          className="absolute inset-0 bg-linen"
          style={{ clipPath: arch, WebkitClipPath: arch }}
        >
          <div className="absolute inset-0" style={{ transform: `translateY(${lookY}px)` }}>
            {box.ready && <Rail rail={rail} x={x} plateW={plateW} railW={railW} />}
          </div>
        </div>

        {/* the hairline that reads the arch */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: arch,
            WebkitClipPath: arch,
            boxShadow: "inset 0 0 0 1px rgba(34,75,130,0.45)",
          }}
        />

        {/* the leaves, standing just open against the jambs */}
        {box.ready && (
          <div className="pointer-events-none absolute inset-0" style={{ perspective: 2600 }}>
            <div
              className="absolute bottom-0"
              style={{ left: insetX - apW * 0.44 - 10, width: apW * 0.44, height: apH }}
            >
              <DoorLeaf side="left" hinge="right" turn={74} width="100%" />
            </div>
            <div
              className="absolute bottom-0"
              style={{ right: insetX - apW * 0.44 - 10, width: apW * 0.44, height: apH }}
            >
              <DoorLeaf side="right" hinge="left" turn={-74} width="100%" />
            </div>
          </div>
        )}
      </div>

      {/* the lockup */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[112px] text-center lg:pt-[142px]">
        <span className="label text-navy/75">{written.heroEyebrow}</span>
        <h1 className="mt-6 text-ink lg:mt-8">
          <span className="display block text-[clamp(30px,7.4vw,40px)] lg:text-[clamp(44px,3.9vw,62px)]">
            {written.heroLine}
          </span>
          <span className="answer mt-1 block text-[clamp(31px,7.7vw,42px)] text-navy lg:mt-2 lg:text-[clamp(46px,4.1vw,66px)]">
            {written.heroAnswer}
          </span>
        </h1>
      </div>

      {/* the margins, used */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-12 pb-11 lg:flex">
        <div className="flex items-center gap-4">
          <span className="h-14 w-px bg-navy/30" />
          <span className="label text-ink/55">{written.scrollCue}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="label text-ink/55">{written.heroFoot}</span>
          <span className="h-14 w-px bg-navy/30" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center lg:hidden">
        <span className="label on-photo text-porcelain/85">{written.scrollCue}</span>
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
            loading={i < 3 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </div>
      ))}
    </motion.div>
  );
}
