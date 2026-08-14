"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { site, written } from "@/lib/site";
import { DoorCase, DoorLeaf } from "@/components/Door";

const BEYOND = "/images/loggia-stone.jpg";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The finale: the blue door itself. It stands closed on a quiet field,
 * swings open onto the colonnade, and walks you in. Like the hero, the
 * opening is a clip on a fixed layer — nothing is ever resized.
 */
export default function Threshold() {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [box, setBox] = useState({ w: 1440, h: 900, mobile: false, ready: false });
  useEffect(() => {
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

  const doorW = box.mobile ? Math.min(box.w * 0.66, 340) : Math.min(box.w * 0.27, 386);
  const doorH = Math.round(box.h * (box.mobile ? 0.5 : 0.56));
  const sill = Math.round(box.h * (box.mobile ? 0.1 : 0.09));

  /* the leaves swing */
  const swing = useTransform(p, (v) => easeInOut(seg(v, 0.06, 0.44)));
  const leftTurn = useTransform(swing, (s) => -86 * s);
  const rightTurn = useTransform(swing, (s) => 86 * s);
  const leafFade = useTransform(p, (v) => 1 - seg(v, 0.4, 0.54));

  /* the doorway opens onto the whole screen */
  const bloom = useTransform(p, (v) => easeOut(seg(v, 0.34, 0.72)));
  const insetX = useTransform(bloom, (b) => (box.w - lerp(doorW, box.w, b)) / 2);
  const insetTop = useTransform(bloom, (b) => box.h - lerp(doorH, box.h, b) - lerp(sill, 0, b));
  const insetBottom = useTransform(bloom, (b) => lerp(sill, 0, b));
  const rx = useTransform(bloom, (b) => lerp(doorW / 2, 0, b));
  const ry = useTransform(bloom, (b) => lerp(doorH * 0.3, 0, b));
  const clip = useMotionTemplate`inset(${insetTop}px ${insetX}px ${insetBottom}px ${insetX}px round ${rx}px ${rx}px 2px 2px / ${ry}px ${ry}px 0px 0px)`;

  /* The doorway should look level into the room, not down at the floor —
     the picture rides down so the opening frames its middle, and settles
     as the opening grows to fill the screen. */
  const lookY = useTransform(bloom, (b) => (box.h - lerp(doorH, box.h, b)) / 2 - lerp(sill, 0, b) / 2);

  const frameFade = useTransform(p, (v) => 1 - seg(v, 0.36, 0.52));
  const groundFade = useTransform(p, (v) => 1 - seg(v, 0.4, 0.66));

  /* and then you walk in */
  const walkIn = useTransform(p, (v) => lerp(1.04, 1.3, easeOut(seg(v, 0.4, 1))));

  const openingFade = useTransform(p, (v) => 1 - seg(v, 0.04, 0.2));
  const inviteFade = useTransform(p, (v) => seg(v, 0.72, 0.9));

  return (
    <section ref={ref} className="relative h-[250svh] lg:h-[300vh]">
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-chalk">
        {/* the quiet field the door stands on */}
        <motion.div className="absolute inset-0 grain" style={{ opacity: groundFade }}>
          <div className="absolute inset-0 bg-[radial-gradient(72%_58%_at_50%_62%,#ffffff_0%,#f3f1ec_46%,#e6e2da_100%)]" />
        </motion.div>

        {/* what lies beyond */}
        <motion.div
          className="absolute inset-0 bg-linen"
          style={{ clipPath: clip, WebkitClipPath: clip }}
        >
          <motion.div className="absolute inset-0" style={{ y: lookY }}>
            <motion.img
              src={BEYOND}
              alt="A stone colonnade, under construction"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              style={{ scale: walkIn, objectPosition: "50% 46%" }}
            />
          </motion.div>
        </motion.div>

        {/* the door */}
        {box.ready && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ width: doorW, height: doorH, bottom: sill, opacity: frameFade }}
          >
            <div className="absolute -bottom-5 left-1/2 h-8 w-[118%] -translate-x-1/2 rounded-[50%] bg-umber/25 blur-xl" />

            <DoorCase medallion={box.mobile ? 40 : 48} />

            <motion.div
              className="absolute inset-0"
              style={{ perspective: 1900, opacity: leafFade }}
            >
              <DoorLeaf side="left" turn={leftTurn} />
              <DoorLeaf side="right" turn={rightTurn} />
            </motion.div>
          </motion.div>
        )}

        {/* before */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[15svh] text-center"
          style={{ opacity: openingFade }}
        >
          <span className="label text-navy/70">{written.inviteLabel}</span>
          <h2 className="mt-6 text-ink">
            <span className="display block text-[clamp(28px,7vw,36px)] lg:text-[clamp(38px,3.2vw,54px)]">
              Every home begins
            </span>
            <span className="answer mt-0.5 block text-[clamp(30px,7.4vw,38px)] text-navy lg:mt-1 lg:text-[clamp(40px,3.4vw,58px)]">
              with a door.
            </span>
          </h2>
        </motion.div>

        {/* after */}
        <motion.div className="absolute inset-0 flex items-end" style={{ opacity: inviteFade }}>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[82%] bg-gradient-to-t from-ink/80 via-ink/42 to-transparent" />
          <div className="relative w-full px-5 pb-11 lg:px-12 lg:pb-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="max-w-[560px]">
                <h3 className="on-photo text-porcelain">
                  <span className="display block text-[clamp(28px,7vw,34px)] lg:text-[clamp(36px,3vw,50px)]">
                    {written.closerLine}
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(30px,7.4vw,36px)] text-ceramic lg:mt-1 lg:text-[clamp(38px,3.2vw,54px)]">
                    {written.closerAnswer}
                  </span>
                </h3>
                <p className="on-photo answer mt-6 max-w-[470px] text-[16px] leading-[1.6] text-porcelain/85 lg:text-[17px]">
                  {written.closerCopy}
                </p>
                <Link
                  href="/build-with-bluedoor/"
                  className="quiet-link mt-8 inline-block text-porcelain"
                >
                  {written.closerCta}
                </Link>
              </div>

              <div className="shrink-0">
                <span className="hair-light block h-px w-full" />
                <span className="script on-photo mt-2 block whitespace-nowrap text-[clamp(52px,12vw,68px)] text-ceramic lg:text-[84px]">
                  Siobhan Zerilla
                </span>
                <span className="label on-photo mt-1 block text-porcelain/60">
                  {site.principal.title}, {site.name}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
