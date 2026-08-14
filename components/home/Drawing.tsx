"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Link from "next/link";
import { written } from "@/lib/site";
import { Reveal } from "@/components/motion";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/* ------------------------------------------------------------------ *
 * A plan, drawn the way it is drawn: shell first, then the partitions,
 * then the doors swing, then it is dimensioned. Every line is a real
 * stroke being laid down, not a picture fading in.
 * ------------------------------------------------------------------ */

/** Outer shell — the footprint and the loggia that steps off it. */
const SHELL = [
  "M80 120 H880",
  "M880 120 V560",
  "M80 120 V560",
  "M80 560 H200",
  "M760 560 H880",
  "M200 560 V650",
  "M200 650 H760",
  "M760 650 V560",
];

/** Partitions. */
const PARTITIONS = ["M340 120 V560", "M640 120 V560", "M80 330 H340", "M640 300 H880"];

/** Openings are gaps with a leaf and a swing. */
const SWINGS = [
  // between the gallery and the kitchen
  { pivot: "M340 290 v-52", arc: "M340 238 A52 52 0 0 1 392 290" },
  // between the gallery and the study
  { pivot: "M640 430 v-52", arc: "M640 378 A52 52 0 0 0 588 430" },
  // into the primary
  { pivot: "M150 330 h48", arc: "M198 330 A48 48 0 0 1 150 378" },
  // the front door, a pair
  { pivot: "M460 120 v46", arc: "M460 166 A46 46 0 0 0 506 120" },
  { pivot: "M540 120 v46", arc: "M540 166 A46 46 0 0 1 494 120" },
];

/** Windows read as a break in the wall with a sill line through it. */
const WINDOWS = [
  "M120 118 h84 M120 122 h84",
  "M236 118 h64 M236 122 h64",
  "M700 118 h84 M700 122 h84",
  "M878 180 v76 M882 180 v76",
  "M878 380 v76 M882 380 v76",
  "M78 180 v76 M82 180 v76",
  "M78 420 v76 M82 420 v76",
];

/** Stair run and a chimney breast, so it reads as a house and not a box. */
const FIXTURES = [
  "M368 150 h92 v168 h-92 z",
  "M368 171 h92 M368 192 h92 M368 213 h92 M368 234 h92 M368 255 h92 M368 276 h92 M368 297 h92",
  "M414 150 v168",
  "M660 120 h72 v34 h-72 z",
];

/** Dimension string along the bottom. */
const DIMENSIONS = [
  "M80 694 H880",
  "M80 686 v16",
  "M480 686 v16",
  "M880 686 v16",
  "M80 100 v-30 M340 100 v-30",
  "M80 84 H340",
  "M600 726 H940 V800 H600 Z",
  "M600 754 H940",
];

export default function Drawing() {
  const ref = useRef<HTMLElement>(null);

  // a phone gets the plan itself, cropped in close — the dimension string and
  // the title block would be six pixels tall out here
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // the drawing is finished by the time the section sits square in the view
  const draw = useTransform(scrollYProgress, (v) => seg(v, 0.1, 0.52));

  const shell = useTransform(draw, (v) => seg(v, 0, 0.3));
  const partitions = useTransform(draw, (v) => seg(v, 0.24, 0.5));
  const windows = useTransform(draw, (v) => seg(v, 0.42, 0.62));
  const swings = useTransform(draw, (v) => seg(v, 0.5, 0.72));
  const fixtures = useTransform(draw, (v) => seg(v, 0.6, 0.82));
  const dims = useTransform(draw, (v) => seg(v, 0.74, 0.94));
  const labels = useTransform(draw, (v) => seg(v, 0.82, 1));

  // the drafting rule that travels down the sheet while the lines are laid
  const ruleY = useTransform(draw, (v) => 60 + v * 700);
  const ruleFade = useTransform(draw, (v) => (v < 0.02 ? 0 : 1 - seg(v, 0.9, 1)));

  // and a wash of colour once it is drawn — the way her studies are finished
  const wash = useTransform(draw, (v) => seg(v, 0.86, 1) * 0.5);

  return (
    <section ref={ref} className="relative overflow-hidden bg-porcelain py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-navy/30" />
                <span className="label text-navy/75">{written.drawingLabel}</span>
              </div>
              <h2 className="mt-6">
                <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                  {written.drawingLine}
                </span>
                <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                  {written.drawingAnswer}
                </span>
              </h2>
              <p className="prose-lux mt-7 max-w-[400px]">{written.drawingCopy}</p>

              <div className="mt-9 flex items-center gap-6">
                <Link href="/process/" className="quiet-link shrink-0 text-navy">
                  How a house is made
                </Link>
                <span className="hair hidden h-px flex-1 lg:block" />
              </div>
            </Reveal>
          </div>

          {/* the sheet */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative overflow-hidden rounded-[2px] bg-[#fbfaf6] px-5 py-7 shadow-[0_30px_70px_-46px_rgba(20,41,74,0.5)] ring-1 ring-navy/12 lg:px-10 lg:py-11">
              {/* the wash, once the lines are down */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: wash,
                  background:
                    "radial-gradient(58% 46% at 38% 42%, rgba(111,149,186,0.30) 0%, rgba(111,149,186,0.10) 46%, rgba(111,149,186,0) 74%), radial-gradient(44% 40% at 74% 68%, rgba(206,192,170,0.34) 0%, rgba(206,192,170,0) 72%)",
                }}
              />

              <svg
                viewBox={narrow ? "52 92 856 606" : "0 0 960 820"}
                className="relative block w-full"
                fill="none"
                aria-label="A floor plan being drawn"
                role="img"
              >
                <g
                  stroke="#224b82"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                >
                  <Lines d={SHELL} progress={shell} width={1.7} opacity={0.88} />
                  <Lines d={PARTITIONS} progress={partitions} width={1.3} opacity={0.74} />
                  <Lines d={WINDOWS} progress={windows} width={1} opacity={0.66} />

                  {SWINGS.map((s, i) => (
                    <g key={i}>
                      <Line d={s.pivot} progress={swings} width={1.2} opacity={0.7} />
                      <Line d={s.arc} progress={swings} width={0.8} opacity={0.38} />
                    </g>
                  ))}

                  <Lines d={FIXTURES} progress={fixtures} width={0.95} opacity={0.56} />
                  {!narrow && <Lines d={DIMENSIONS} progress={dims} width={0.8} opacity={0.46} />}
                </g>

                {/* the north point */}
                <motion.g style={{ opacity: labels }} className={narrow ? "hidden" : undefined}>
                  <circle cx="898" cy="58" r="26" stroke="#224b82" strokeWidth="0.8" opacity="0.42" />
                  <path d="M898 38 l7 20 -7 -6 -7 6 z" fill="#224b82" opacity="0.5" />
                  <text
                    x="898"
                    y="84"
                    textAnchor="middle"
                    fill="#224b82"
                    fillOpacity="0.5"
                    fontSize="13"
                    letterSpacing="2"
                    fontFamily="var(--font-figtree)"
                  >
                    N
                  </text>
                </motion.g>

                {/* the hand that wrote it */}
                <motion.g
                  style={{ opacity: labels }}
                  fill="#224b82"
                  fillOpacity="0.5"
                  fontSize={narrow ? 26 : 15}
                  letterSpacing={narrow ? 5 : 3.4}
                  fontFamily="var(--font-figtree)"
                >
                  <text x="130" y="240">KITCHEN</text>
                  <text x="130" y="450">PRIMARY</text>
                  <text x="482" y="404" textAnchor="middle">GALLERY</text>
                  <text x="690" y="216">DINING</text>
                  <text x="690" y="436">STUDY</text>
                  <text x="480" y="614" textAnchor="middle">LOGGIA</text>
                  {!narrow && (
                    <>
                      <text x="618" y="746" fontSize="13" letterSpacing="2.6" fillOpacity="0.5">
                        BLUEDOOR BUILDING
                      </text>
                      <text x="618" y="774" fontSize="12" letterSpacing="2.2" fillOpacity="0.36">
                        GROUND FLOOR PLAN
                      </text>
                      <text x="618" y="792" fontSize="12" letterSpacing="2.2" fillOpacity="0.36">
                        SCALE — AS NOTED
                      </text>
                    </>
                  )}
                </motion.g>

                {/* the parallel rule, travelling down the sheet */}
                <motion.line
                  x1="24"
                  x2="936"
                  stroke="#6f95ba"
                  strokeWidth="1"
                  style={{ y: ruleY, opacity: ruleFade }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Lines({
  d,
  progress,
  width,
  opacity,
}: {
  d: readonly string[];
  progress: MotionValue<number>;
  width: number;
  opacity: number;
}) {
  return (
    <>
      {d.map((path, i) => (
        <Line key={i} d={path} progress={progress} width={width} opacity={opacity} />
      ))}
    </>
  );
}

function Line({
  d,
  progress,
  width,
  opacity,
}: {
  d: string;
  progress: MotionValue<number>;
  width: number;
  opacity: number;
}) {
  return (
    <motion.path
      d={d}
      strokeWidth={width}
      strokeOpacity={opacity}
      style={{ pathLength: progress }}
    />
  );
}
