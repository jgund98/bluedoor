"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { site, written } from "@/lib/site";
import { Reveal } from "@/components/motion";

/** Laid out on a table, slightly askew, the way magazines actually sit. */
const SET = [
  { tilt: -1.4, lift: 0, float: 26 },
  { tilt: 1.1, lift: 22, float: -14 },
  { tilt: -0.7, lift: 6, float: 30 },
  { tilt: 1.6, lift: 30, float: -8 },
];

export default function Press() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative overflow-hidden bg-mist pb-20 pt-20 grain lg:pb-28 lg:pt-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-navy/30" />
              <span className="label text-navy/75">{written.pressLabel}</span>
            </div>
            <h2 className="mt-6">
              <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                {written.pressLine}
              </span>
              <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                {written.pressAnswer}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Link href="/media/" className="quiet-link inline-block text-navy">
              All features
            </Link>
          </Reveal>
        </div>

        {/* the tearsheets, at the size they were printed */}
        <div className="mt-14 flex snap-x snap-mandatory items-end gap-7 overflow-x-auto pb-6 lg:mt-20 lg:gap-12 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {site.publications.map((pub, i) => (
            <Sheet
              key={pub.title}
              pub={pub}
              set={SET[i % SET.length]}
              i={i}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Sheet({
  pub,
  set,
  i,
  progress,
}: {
  pub: (typeof site.publications)[number];
  set: (typeof SET)[number];
  i: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(progress, (v) => (v - 0.5) * set.float);

  return (
    <motion.div
      className="group shrink-0 snap-center"
      style={{ y }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.05, ease: [0.19, 1, 0.22, 1], delay: i * 0.08 }}
    >
      <a href={pub.url} target="_blank" rel="noreferrer" className="block">
        <div style={{ paddingBottom: set.lift }}>
          <div
            className="w-fit bg-porcelain p-[7px] shadow-[0_22px_48px_-34px_rgba(20,41,74,0.6)] ring-1 ring-navy/12 transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-0 group-hover:shadow-[0_40px_66px_-34px_rgba(20,41,74,0.62)] group-hover:ring-navy/25"
            style={{ rotate: `${set.tilt}deg` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pub.image}
              alt={pub.title}
              loading="lazy"
              className="h-[clamp(190px,15.5vw,290px)] w-auto"
            />
          </div>

          <div className="mt-5 max-w-[230px]">
            <span className="label text-navy/70">{pub.name}</span>
            <p className="answer mt-2 text-[15px] leading-[1.4] text-ink/70 transition-colors duration-500 group-hover:text-ink">
              {pub.title}
            </p>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
