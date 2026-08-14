"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { heroRail, heroRailMobile, site, written } from "@/lib/site";
import { DoorLeaf } from "@/components/Door";

const ARRIVAL = "/images/hero-stairhall.jpg";

// Measure before the browser paints, so a stage never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The arch never changes size — a full-screen layer is clipped to it, so
 * opening the doorway costs a repaint instead of a re-layout of sixteen
 * photographs. That is what keeps it smooth on a phone.
 */
export default function HeroProcession() {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Measure the sticky stage itself. innerHeight and 100svh disagree on a
  // phone the moment the URL bar moves, and that mismatch is what made the
  // reveal land wrong.
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
  const plateW = box.mobile ? Math.round(box.w * 0.6) : Math.round(box.w * 0.4);
  const railW = rail.length * plateW;

  const apW0 = box.mobile ? Math.round(box.w * 0.7) : Math.min(Math.round(box.w * 0.3), 440);
  const apH0 = Math.round(box.h * (box.mobile ? 0.62 : 0.6));

  /* ---- the procession: moves on its own, and comes to rest as you scroll ---- */
  const x = useMotionValue(0);
  const onStage = useRef(true);
  useEffect(() => {
    const el = ref.current;
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
    const rest = 1 - easeInOut(seg(p.get(), 0, 0.4));
    const speed = (box.mobile ? 20 : 34) * rest;
    if (speed <= 0.01) return;
    let next = x.get() - (speed * d) / 1000;
    if (next <= -railW) next += railW;
    x.set(next);
  });

  /* ---- the doorway opens: only the clip changes ---- */
  const bloom = useTransform(p, (v) => easeInOut(seg(v, 0.04, 0.56)));
  const insetX = useTransform(bloom, (b) => (box.w - lerp(apW0, box.w, b)) / 2);
  const insetTop = useTransform(bloom, (b) => box.h - lerp(apH0, box.h, b));
  const rx = useTransform(bloom, (b) => lerp(apW0 / 2, 0, b));
  const ry = useTransform(bloom, (b) => lerp(apH0 * 0.3, 0, b));
  const clip = useMotionTemplate`inset(${insetTop}px ${insetX}px 0px ${insetX}px round ${rx}px ${rx}px 3px 3px / ${ry}px ${ry}px 0px 0px)`;

  // the same shape, grown by the width of the casing
  const caseTop = useTransform(insetTop, (v) => v - 10);
  const caseX = useTransform(insetX, (v) => v - 10);
  const caseRx = useTransform(rx, (v) => v + 10);
  const caseRy = useTransform(ry, (v) => v + 10);
  const clipCase = useMotionTemplate`inset(${caseTop}px ${caseX}px -10px ${caseX}px round ${caseRx}px ${caseRx}px 3px 3px / ${caseRy}px ${caseRy}px 0px 0px)`;

  // You are looking through a doorway, not down at the floor: the picture
  // rides down so the opening frames its middle, and settles as it grows.
  const lookY = useTransform(bloom, (b) => (box.h - lerp(apH0, box.h, b)) / 2);

  const frameOpacity = useTransform(bloom, (b) => 1 - clamp01(b * 1.7));
  const washFade = useTransform(bloom, (b) => 1 - clamp01(b * 1.3));

  /* ---- the procession settles, then hands over to the arrival ---- */
  const railFade = useTransform(p, (v) => 1 - seg(v, 0.28, 0.44));
  const arrivalScale = useTransform(p, (v) => lerp(1.12, 1, seg(v, 0.34, 1)));

  /* ---- type ---- */
  const openingOpacity = useTransform(p, (v) => 1 - seg(v, 0.02, 0.2));
  const openingLift = useTransform(p, (v) => -seg(v, 0.02, 0.34) * 40);
  const statementOpacity = useTransform(p, (v) => seg(v, 0.66, 0.86));

  return (
    <section ref={ref} className="relative h-[240svh] lg:h-[300vh]">
      <div
        ref={stage}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-porcelain grain"
      >
        {/* the world outside the doorway — the same procession, carrying on
            past the jambs, veiled back to near-paper. Phones get it too. */}
        <motion.div className="absolute inset-0" style={{ opacity: washFade }}>
          {box.ready && <Rail rail={rail} x={x} plateW={plateW} railW={railW} />}
          <div className="absolute inset-0 bg-porcelain/74" />
          <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-porcelain via-porcelain/72 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-porcelain/92 to-transparent" />
        </motion.div>

        {/* Everything below is sized from the measured stage, so it stays
            hidden until that measurement exists. Otherwise the markup paints
            once at the server's guess before the browser has run a line of
            our code — which is the flicker. */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            box.ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* the casing, clipped to the same arch grown by its own width */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-porcelain"
            style={{
              clipPath: clipCase,
              WebkitClipPath: clipCase,
              opacity: frameOpacity,
              filter: box.mobile ? undefined : "drop-shadow(0 34px 54px rgba(20,41,74,0.34))",
            }}
          />

        {/* what you can see through it */}
        <motion.div
          className="absolute inset-0 bg-linen"
          style={{ clipPath: clip, WebkitClipPath: clip }}
        >
          <motion.div className="absolute inset-0" style={{ y: lookY }}>
            {/* the arrival waits underneath at full strength — the procession
                dissolves off it, so nothing ever crossfades through a gap */}
            <div className="plate absolute inset-0">
              <motion.img
                src={ARRIVAL}
                alt="A double stair hall in cut travertine"
                className="h-full w-full object-cover"
                style={{ scale: arrivalScale, objectPosition: "50% 46%" }}
              />
            </div>

            <motion.div className="absolute inset-0" style={{ opacity: railFade }}>
              {box.ready && <Rail rail={rail} x={x} plateW={plateW} railW={railW} />}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* the hairline that reads the arch */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: clip,
            WebkitClipPath: clip,
            opacity: frameOpacity,
            boxShadow: "inset 0 0 0 1px rgba(34,75,130,0.45)",
          }}
        />

          {/* the leaves, standing just open against the jambs */}
          {box.ready && (
            <Leaves bloom={bloom} box={box} apW0={apW0} apH0={apH0} opacity={frameOpacity} />
          )}
        </div>

        {/* the opening lockup */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[112px] text-center lg:pt-[142px]"
          style={{ opacity: openingOpacity, y: openingLift }}
        >
          <span className="label text-navy/75">{written.heroEyebrow}</span>
          <h1 className="mt-6 text-ink lg:mt-8">
            <span className="display block text-[clamp(30px,7.4vw,40px)] lg:text-[clamp(44px,3.9vw,62px)]">
              {written.heroLine}
            </span>
            <span className="answer mt-1 block text-[clamp(31px,7.7vw,42px)] text-navy lg:mt-2 lg:text-[clamp(46px,4.1vw,66px)]">
              {written.heroAnswer}
            </span>
          </h1>
        </motion.div>

        {/* on a phone the cue belongs on the threshold of the door itself */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center lg:hidden"
          style={{ opacity: openingOpacity }}
        >
          <span className="label on-photo text-porcelain/85">{written.scrollCue}</span>
        </motion.div>

        {/* the flanking margins — used, not empty */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-12 pb-11 lg:flex"
          style={{ opacity: openingOpacity }}
        >
          <div className="flex items-center gap-4">
            <span className="h-14 w-px bg-navy/30" />
            <span className="label text-ink/55">{written.scrollCue}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="label text-ink/55">{written.heroFoot}</span>
            <span className="h-14 w-px bg-navy/30" />
          </div>
        </motion.div>


        {/* what she calls herself, once you are through */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-end"
          style={{ opacity: statementOpacity }}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink/72 via-ink/34 to-transparent" />
          <p className="on-photo relative max-w-[540px] px-6 pb-12 text-porcelain lg:max-w-[640px] lg:px-12 lg:pb-14">
            <span className="label block text-ceramic">{site.name}</span>
            <span className="answer mt-4 block text-[19px] leading-[1.5] lg:text-[26px] lg:leading-[1.44]">
              {site.bio}
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Leaves({
  bloom,
  box,
  apW0,
  apH0,
  opacity,
}: {
  bloom: MotionValue<number>;
  box: { w: number; h: number; mobile: boolean };
  apW0: number;
  apH0: number;
  opacity: MotionValue<number>;
}) {
  const width = useTransform(bloom, (b) => lerp(apW0, box.w, b) * 0.44);
  const height = useTransform(bloom, (b) => lerp(apH0, box.h, b));
  const leftPos = useTransform(bloom, (b) => {
    const w = lerp(apW0, box.w, b);
    return (box.w - w) / 2 - w * 0.44 - 10;
  });
  const rightPos = leftPos;

  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ opacity }}>
      <motion.div
        className="absolute bottom-0"
        style={{ left: leftPos, width, height, perspective: 2600 }}
      >
        <DoorLeaf side="left" hinge="right" turn={74} width="100%" />
      </motion.div>
      <motion.div
        className="absolute bottom-0"
        style={{ right: rightPos, width, height, perspective: 2600 }}
      >
        <DoorLeaf side="right" hinge="left" turn={-74} width="100%" />
      </motion.div>
    </motion.div>
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
