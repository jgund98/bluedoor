"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * The signature moment: a pair of towering navy doors — the brand itself —
 * part as the visitor scrolls, opening onto a finished oceanfront room.
 */
export default function DoorReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // doors open in the first half of the runway; the composed scene then HOLDS
  // for the remaining ~40% so the line lands before the page moves on
  const left = useTransform(scrollYProgress, [0.1, 0.52], ["0%", "-101%"]);
  const right = useTransform(scrollYProgress, [0.1, 0.52], ["0%", "101%"]);
  const medallion = useTransform(scrollYProgress, (v) =>
    v <= 0.04 ? 1 : v >= 0.16 ? 0 : 1 - (v - 0.04) / 0.12
  );
  const imageScale = useTransform(scrollYProgress, [0.1, 0.58], [1.14, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.44, 0.58], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.44, 0.58], [26, 0]);

  if (reduce) {
    return (
      <section className="relative">
        <div className="relative h-[80vh] overflow-hidden">
          <img
            src="/images/loggia-ocean.jpg"
            alt="An oceanfront living room opening onto the Atlantic"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-center md:p-16">
            <p className="display text-3xl text-bone md:text-5xl">
              Every home begins at the blue&nbsp;door.
            </p>
            <Link
              href="/portfolio"
              className="label mt-8 inline-block border border-bone/70 px-8 py-4 text-bone"
            >
              Explore the Portfolio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the room beyond */}
        <motion.img
          src="/images/loggia-ocean.jpg"
          alt="An oceanfront living room opening onto the Atlantic"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ scale: imageScale }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-transparent to-espresso/10" />

        <motion.div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[12vh] text-center"
          style={{ opacity: captionOpacity, y: captionY }}
        >
          <p className="label-wide mb-5 text-bone/80">The Name Is the Promise</p>
          <p className="display balance text-4xl text-bone md:text-6xl">
            Every home begins at the blue&nbsp;door.
          </p>
          <Link
            href="/portfolio"
            className="label mt-9 border border-bone/70 bg-bone/5 px-9 py-4 text-bone backdrop-blur-sm transition-colors duration-500 hover:bg-bone hover:text-navy"
          >
            Explore the Portfolio
          </Link>
        </motion.div>

        {/* left door */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-navy will-change-transform"
          style={{ x: left }}
        >
          <div className="absolute inset-y-[6%] left-[10%] right-[12%] border border-bone/12" />
          <div className="absolute inset-y-[14%] left-[18%] right-[20%] border border-bone/8" />
          {/* door handle */}
          <div className="absolute right-[6%] top-1/2 h-24 w-[3px] -translate-y-1/2 rounded-full bg-bone/25" />
        </motion.div>

        {/* right door */}
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 bg-navy will-change-transform"
          style={{ x: right }}
        >
          <div className="absolute inset-y-[6%] left-[12%] right-[10%] border border-bone/12" />
          <div className="absolute inset-y-[14%] left-[20%] right-[18%] border border-bone/8" />
          <div className="absolute left-[6%] top-1/2 h-24 w-[3px] -translate-y-1/2 rounded-full bg-bone/25" />
        </motion.div>

        {/* the mark, resting on the closed doors */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: medallion }}
        >
          <img
            src="/images/logo.png"
            alt=""
            className="h-28 w-28 rounded-full shadow-[0_0_0_1px_rgba(247,243,235,0.35),0_0_60px_rgba(0,0,0,0.35)] md:h-36 md:w-36"
          />
        </motion.div>
      </div>
    </section>
  );
}
