"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { portals, written } from "@/lib/site";

type Portal = (typeof portals)[number];

const GROUND: Record<string, string> = {
  porcelain: "bg-porcelain",
  mist: "bg-mist",
};

export default function StackedPortals() {
  // The panels stack like pages settling on a desk — on every screen.
  // (The stage is svh-sized on phones so the URL bar collapsing can never
  // re-lay a pinned panel out mid-scroll.)
  const stack = true;

  return (
    <div className="relative">
      {portals.map((p, i) => (
        <Panel
          key={p.label}
          portal={p}
          i={i}
          last={i === portals.length - 1}
          stack={stack}
        />
      ))}
    </div>
  );
}

/** The medallion, set into the crown of the arch like a keystone. */
function Keystone({ ground, small }: { ground: string; small?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${
        small ? "-top-[26px]" : "-top-[34px]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.png"
        alt=""
        className={`rounded-full ${small ? "w-[52px] ring-[7px]" : "w-[68px] ring-[9px]"} ${
          ground === "mist" ? "ring-mist" : "ring-porcelain"
        }`}
      />
    </div>
  );
}

function Panel({
  portal,
  i,
  last,
  stack,
}: {
  portal: Portal;
  i: number;
  last: boolean;
  stack: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  // Rising: the panel lifts over the one before it with an arched leading edge.
  const { scrollYProgress: rise } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  // Resting: once pinned, it settles back as the next panel arrives.
  const { scrollYProgress: rest } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const radiusTop = useTransform(rise, (v) => (i === 0 || !stack ? 0 : (1 - v) * 16));
  const radiusV = useTransform(rise, (v) => (i === 0 || !stack ? 0 : (1 - v) * 7));
  const radius = useMotionTemplate`${radiusTop}% ${radiusV}%`;
  const contentScale = useTransform(rest, (v) => (last || !stack ? 1 : 1 - v * 0.05));
  const contentFade = useTransform(rest, (v) => (last || !stack ? 1 : 1 - v * 0.85));

  return (
    <motion.section
      ref={ref}
      className={`sticky top-0 h-[100svh] overflow-hidden grain lg:h-[100dvh] ${
        GROUND[portal.ground] ?? "bg-porcelain"
      }`}
      style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ scale: contentScale, opacity: contentFade }}
      >
        {/* ---------------- desktop ---------------- */}
        <div className="hidden h-full lg:block">
          {/* the standing numeral, in the void */}
          <span
            className="display pointer-events-none absolute bottom-[7svh] left-12 select-none text-[190px] leading-none text-navy/[0.09]"
            aria-hidden
          >
            {portal.index}
          </span>

          <div className="absolute left-12 top-[23svh] max-w-[430px] xl:left-16 xl:max-w-[470px]">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-navy/30" />
              <span className="label text-navy/75">{portal.label}</span>
            </div>

            <h2 className="mt-8">
              <span className="display block text-[clamp(34px,2.9vw,46px)] text-ink">
                {portal.line}
              </span>
              <span className="answer mt-1 block text-[clamp(36px,3.1vw,50px)] text-navy">
                {portal.answer}
              </span>
            </h2>

            <p className="prose-lux mt-7 max-w-[390px]">{portal.copy}</p>

            <Link href={portal.href} className="quiet-link mt-9 inline-block text-navy">
              See the work
            </Link>
          </div>

          {/* the opening, with the medallion set into its crown */}
          <div className="absolute bottom-0 right-12 h-[76svh] w-[38vw] max-w-[620px] xl:right-16">
            <div className="portal absolute inset-0 overflow-hidden plate ring-1 ring-navy/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portal.image}
                alt=""
                loading="lazy"
                style={{ objectPosition: portal.pos }}
              />
            </div>
            <Keystone ground={portal.ground} />
          </div>

          {/* the counter, quietly */}
          <div className="absolute bottom-[7svh] right-[calc(38vw+5rem)] flex items-center gap-3 xl:right-[calc(38vw+6.5rem)]">
            <span className="label text-ink/35">{written.portalsLabel}</span>
            <span className="h-px w-8 bg-navy/25" />
          </div>
        </div>

        {/* ---------------- mobile ---------------- */}
        <div className="flex h-full flex-col px-5 pb-0 pt-[104px] lg:hidden">
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-navy/30" />
            <span className="label text-navy/75">{portal.label}</span>
          </div>

          <h2 className="mt-5">
            <span className="display block text-[30px] text-ink">{portal.line}</span>
            <span className="answer mt-0.5 block text-[32px] text-navy">{portal.answer}</span>
          </h2>

          <p className="prose-lux mt-4 text-[15px] leading-[1.62]">{portal.copy}</p>

          <Link href={portal.href} className="quiet-link mt-6 inline-block self-start text-navy">
            See the work
          </Link>

          <div className="relative mt-9 min-h-0 flex-1">
            <div className="portal absolute inset-0 overflow-hidden plate ring-1 ring-navy/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portal.image} alt="" loading="lazy" style={{ objectPosition: portal.pos }} />
            </div>
            <Keystone ground={portal.ground} small />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
