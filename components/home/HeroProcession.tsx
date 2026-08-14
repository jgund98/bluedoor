"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { heroRail, site, written } from "@/lib/site";
import { DoorLeaf } from "@/components/Door";

const ARRIVAL = "/images/hero-stairhall.jpg";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function HeroProcession() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [vp, setVp] = useState({ w: 1440, h: 900, mobile: false });

  useEffect(() => {
    const measure = () =>
      setVp({
        w: window.innerWidth,
        h: window.visualViewport?.height ?? window.innerHeight,
        mobile: window.innerWidth < 1024,
      });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const plateW = vp.mobile ? Math.round(vp.w * 0.78) : Math.round(vp.w * 0.4);
  const gap = 0;
  const railW = heroRail.length * (plateW + gap);

  const apertureW0 = vp.mobile ? Math.round(vp.w * 0.74) : Math.min(Math.round(vp.w * 0.3), 440);
  const apertureH0 = Math.round(vp.h * (vp.mobile ? 0.56 : 0.6));

  /* ---- the procession: moves on its own, and comes to rest as you scroll ---- */
  const x = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (delta > 200) return;
    const rest = 1 - easeInOut(seg(p.get(), 0, 0.4));
    const speed = (vp.mobile ? 26 : 34) * rest;
    if (speed <= 0.01) return;
    let next = x.get() - (speed * delta) / 1000;
    if (next <= -railW) next += railW;
    x.set(next);
  });

  /* ---- the aperture blooms open ---- */
  const bloom = useTransform(p, (v) => easeInOut(seg(v, 0.04, 0.56)));
  const apW = useTransform(bloom, (b) => lerp(apertureW0, vp.w, b));
  const apH = useTransform(bloom, (b) => lerp(apertureH0, vp.h, b));
  const rTop = useTransform(bloom, (b) => lerp(50, 0, b));
  const rV = useTransform(bloom, (b) => lerp(30, 0, b));
  const radius = useMotionTemplate`${rTop}% ${rTop}% 3px 3px / ${rV}% ${rV}% 0 0`;
  const frameOpacity = useTransform(bloom, (b) => 1 - clamp01(b * 1.7));
  const washFade = useTransform(bloom, (b) => 1 - clamp01(b * 1.3));

  /* ---- the procession settles, then hands over to the arrival ---- */
  const railFade = useTransform(p, (v) => 1 - seg(v, 0.34, 0.46));
  const arrivalFade = useTransform(p, (v) => seg(v, 0.44, 0.56));
  const arrivalScale = useTransform(p, (v) => lerp(1.12, 1, seg(v, 0.44, 1)));

  /* ---- type ---- */
  const openingOpacity = useTransform(p, (v) => 1 - seg(v, 0.02, 0.2));
  const openingLift = useTransform(p, (v) => -seg(v, 0.02, 0.34) * 40);
  const statementOpacity = useTransform(p, (v) => seg(v, 0.66, 0.86));

  return (
    <section ref={ref} className="relative h-[240svh] lg:h-[300vh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-porcelain grain">
        {/* the world outside the arch — the same procession, lightly veiled */}
        <div className="absolute inset-0">
          <Rail x={x} plateW={plateW} gap={gap} railW={railW} />
        </div>
        <motion.div className="absolute inset-0" style={{ opacity: washFade }}>
          <div className="absolute inset-0 bg-porcelain/74 backdrop-blur-[1.5px]" />
          <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-porcelain via-porcelain/72 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-porcelain/92 to-transparent" />
        </motion.div>

        {/* the arch */}
        <motion.div
          className="absolute bottom-0 left-1/2 overflow-hidden"
          style={{ width: apW, height: apH, borderRadius: radius, x: "-50%" }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: vp.w, height: vp.h }}
          >
            <motion.div className="absolute inset-0" style={{ opacity: railFade }}>
              <Rail x={x} plateW={plateW} gap={gap} railW={railW} />
            </motion.div>

            <motion.div className="plate absolute inset-0" style={{ opacity: arrivalFade }}>
              <motion.img
                src={ARRIVAL}
                alt="A double stair hall in cut travertine"
                className="h-full w-full object-cover"
                style={{ scale: arrivalScale, objectPosition: "50% 46%" }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* the arch's own hairline and the shadow it casts on the paper */}
        <motion.div
          className="pointer-events-none absolute bottom-0 left-1/2"
          style={{
            width: apW,
            height: apH,
            borderRadius: radius,
            x: "-50%",
            opacity: frameOpacity,
            perspective: 2600,
            boxShadow:
              "0 0 0 1px rgba(34,75,130,0.4), 0 0 0 9px rgba(253,252,250,0.9), 0 0 0 10px rgba(34,75,130,0.14), 0 46px 90px -44px rgba(20,41,74,0.6)",
          }}
        >
          {/* the leaves, standing just open against the jambs */}
          <div className="absolute right-full top-0 h-full w-[44%]">
            <DoorLeaf side="left" hinge="right" turn={74} width="100%" />
          </div>
          <div className="absolute left-full top-0 h-full w-[44%]">
            <DoorLeaf side="right" hinge="left" turn={-74} width="100%" />
          </div>
        </motion.div>

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

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center lg:hidden"
          style={{ opacity: openingOpacity }}
        >
          <span className="label text-ink/50">{written.scrollCue}</span>
        </motion.div>

        {/* what she calls herself, once you are through */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-end"
          style={{ opacity: statementOpacity }}
        >
          <div className="veil-bl absolute inset-x-0 bottom-0 h-[58%]" />
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

function Rail({
  x,
  plateW,
  gap,
  railW,
}: {
  x: MotionValue<number>;
  plateW: number;
  gap: number;
  railW: number;
}) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 flex items-stretch"
      style={{ x, width: railW * 2, gap }}
    >
      {[...heroRail, ...heroRail].map((img, i) => (
        <div key={i} className="plate h-full shrink-0" style={{ width: plateW }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt=""
            loading={i < 3 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </div>
      ))}
    </motion.div>
  );
}
