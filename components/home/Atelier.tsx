"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { written } from "@/lib/site";
import { Reveal } from "@/components/motion";

/** Her own watercolors, hung from a picture rail. */
const HANGS = [
  { src: "/images/watercolor-3.jpg", w: "18.5%", drop: 26, float: 22 },
  { src: "/images/watercolor-1.jpg", w: "23%", drop: 62, float: -16 },
  { src: "/images/watercolor-5.jpg", w: "20%", drop: 34, float: 30 },
  { src: "/images/watercolor-2.jpg", w: "16%", drop: 76, float: -10 },
  { src: "/images/watercolor-4.jpg", w: "19%", drop: 44, float: 24 },
];

export default function Atelier() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-porcelain pb-14 pt-16 grain lg:pb-28 lg:pt-24"
    >
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal className="max-w-[560px]">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-navy/30" />
              <span className="label text-navy/75">{written.atelierLabel}</span>
            </div>
            <h2 className="mt-6">
              <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                {written.atelierLine}
              </span>
              <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                {written.atelierAnswer}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="max-w-[420px]">
            <p className="prose-lux">{written.atelierCopy}</p>
          </Reveal>
        </div>
      </div>

      {/* the picture rail */}
      <div className="relative mt-16 lg:mt-24">
        <div className="hair absolute inset-x-0 top-0 h-px" />

        {/* desktop: a salon hang, each painting drifting on its own wire */}
        <div className="mx-auto hidden max-w-[1560px] items-start justify-between gap-6 px-12 lg:flex">
          {HANGS.map((h, i) => (
            <Hang key={h.src} hang={h} i={i} progress={scrollYProgress} />
          ))}
        </div>

        {/* mobile: a swipeable hang */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 pt-8 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {HANGS.map((h) => (
            <div key={h.src} className="w-[74vw] shrink-0 snap-center">
              <div className="bg-porcelain p-2 shadow-[0_18px_40px_-30px_rgba(20,41,74,0.55)] ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.src} alt="Watercolor study of a Bluedoor home" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hang({
  hang,
  i,
  progress,
}: {
  hang: (typeof HANGS)[number];
  i: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(progress, (v) => (v - 0.5) * hang.float);

  return (
    <motion.div
      className="group relative shrink-0"
      style={{ width: hang.w, y }}
      initial={{ opacity: 0, y: -14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: i * 0.09 }}
    >
      {/* the wire it hangs by */}
      <div
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-navy/25"
        style={{ height: hang.drop }}
      />
      <div className="absolute left-1/2 top-0 h-[5px] w-[5px] -translate-x-1/2 -translate-y-[2px] rounded-full bg-navy/45" />

      <div style={{ paddingTop: hang.drop }}>
        <div className="bg-porcelain p-[10px] shadow-[0_18px_40px_-30px_rgba(20,41,74,0.55)] ring-1 ring-navy/12 transition-all duration-700 ease-out group-hover:-translate-y-[6px] group-hover:shadow-[0_34px_60px_-32px_rgba(20,41,74,0.62)] group-hover:ring-navy/25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hang.src} alt="Watercolor study of a Bluedoor home" loading="lazy" />
        </div>
      </div>
    </motion.div>
  );
}
