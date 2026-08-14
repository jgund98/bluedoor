"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Link from "next/link";
import { written } from "@/lib/site";
import { Reveal } from "@/components/motion";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ------------------------------------------------------------------ *
 * An oceanfront estate, drawn the way it is drawn: the motor court and
 * the forecourt wall first, then the shell, the partitions, the rotunda,
 * the openings, the colonnade, the pool, and finally the surf. Every
 * line is a stroke being laid down, not a picture fading in.
 * ------------------------------------------------------------------ */

/** The approach: forecourt wall and the sweep of the motor court. */
const SITE = [
  "M420 150 H640",
  "M960 150 H1180",
  "M640 150 A264 264 0 0 1 960 150",
  "M632 142 h18 v18 h-18 z",
  "M950 142 h18 v18 h-18 z",
];

/** The shell of the house, and the loggia that steps off the back of it. */
const SHELL = [
  "M260 150 H1340",
  "M1340 150 V520",
  "M260 150 V520",
  "M260 520 H340",
  "M1260 520 H1340",
  "M340 520 V610",
  "M340 610 H1260",
  "M1260 610 V520",
];

/** Partitions. */
const PARTITIONS = [
  "M600 150 V520",
  "M940 150 V520",
  "M260 330 H600",
  "M940 330 H1340",
  "M460 150 V330",
  "M460 250 H600",
  "M1140 150 V330",
  "M720 150 V520",
  "M880 150 V520",
];

/** The rotunda on the centre line. */
const ROTUNDA = ["M722 300 A78 78 0 0 1 878 300", "M878 300 A78 78 0 0 1 722 300"];

/** Windows read as a break in the wall with a sill line through it. */
const WINDOWS = [
  "M300 148 h96 M300 152 h96",
  "M1000 148 h96 M1000 152 h96",
  "M1200 148 h84 M1200 152 h84",
  "M258 190 v70 M262 190 v70",
  "M258 380 v90 M262 380 v90",
  "M1338 190 v70 M1342 190 v70",
  "M1338 380 v90 M1342 380 v90",
];

/** Openings are a leaf and a swing. */
const SWINGS = [
  { pivot: "M760 150 v44", arc: "M760 194 A44 44 0 0 0 804 150" },
  { pivot: "M840 150 v44", arc: "M840 194 A44 44 0 0 1 796 150" },
  { pivot: "M720 400 v-48", arc: "M720 352 A48 48 0 0 1 768 400" },
  { pivot: "M880 400 v-48", arc: "M880 352 A48 48 0 0 0 832 400" },
  { pivot: "M460 300 h-46", arc: "M414 300 A46 46 0 0 0 460 254" },
  { pivot: "M940 400 h46", arc: "M986 400 A46 46 0 0 1 940 446" },
];

/** The stair hall, the colonnade, the pool. */
const DETAILS = [
  "M620 240 h96 v130 h-96 z",
  "M620 258 h96 M620 276 h96 M620 294 h96 M620 312 h96 M620 330 h96 M620 348 h96",
  "M668 240 v130",
  "M380 578 h20 v20 h-20 z",
  "M500 578 h20 v20 h-20 z",
  "M620 578 h20 v20 h-20 z",
  "M740 578 h20 v20 h-20 z",
  "M860 578 h20 v20 h-20 z",
  "M980 578 h20 v20 h-20 z",
  "M1100 578 h20 v20 h-20 z",
  "M1220 578 h20 v20 h-20 z",
  "M620 632 H980 V700 H620 Z",
  "M634 646 H966 V686 H634 Z",
  "M620 656 h-32 v22 h32",
  "M470 700 H1130",
];

/** The lot ends at the water. */
const SHORE = [
  "M430 748 C620 736 780 762 960 748 C1140 734 1360 760 1580 746",
  "M430 770 C650 758 830 784 1010 770 C1190 756 1380 780 1580 768",
  "M430 792 C680 780 900 804 1120 792 C1300 782 1440 798 1580 790",
];

/** Dimension string and the title block. */
const DIMENSIONS = [
  "M260 48 H1340",
  "M260 40 v16",
  "M800 40 v16",
  "M1340 40 v16",
  "M30 700 H410 V800 H30 Z",
  "M30 732 H410",
];

const TREES: [number, number, number][] = [
  [148, 232, 17],
  [116, 316, 14],
  [176, 396, 16],
  [1452, 232, 17],
  [1484, 316, 14],
  [1424, 396, 16],
];

export default function Drawing() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // A phone gets the centre of the plan — the axis from the front door
  // through the rotunda to the water. The dimension string and the title
  // block would be four pixels tall out there.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const draw = useTransform(scrollYProgress, (v) => seg(v, 0.06, 0.56));

  const site = useTransform(draw, (v) => seg(v, 0, 0.16));
  const shell = useTransform(draw, (v) => seg(v, 0.12, 0.34));
  const partitions = useTransform(draw, (v) => seg(v, 0.28, 0.48));
  const rotunda = useTransform(draw, (v) => seg(v, 0.42, 0.58));
  const windows = useTransform(draw, (v) => seg(v, 0.5, 0.64));
  const swings = useTransform(draw, (v) => seg(v, 0.56, 0.72));
  const details = useTransform(draw, (v) => seg(v, 0.64, 0.82));
  const shore = useTransform(draw, (v) => seg(v, 0.74, 0.9));
  const dims = useTransform(draw, (v) => seg(v, 0.82, 0.96));
  const labels = useTransform(draw, (v) => seg(v, 0.86, 1));

  // the camera settles as the sheet fills in
  const cameraScale = useTransform(draw, (v) => 1.07 - easeOut(clamp01(v)) * 0.07);
  const cameraY = useTransform(draw, (v) => (1 - easeOut(clamp01(v))) * 22);

  // the parallel rule travelling down the sheet
  const ruleY = useTransform(draw, (v) => 40 + v * 780);
  const ruleFade = useTransform(draw, (v) => (v < 0.02 ? 0 : 1 - seg(v, 0.88, 1)));

  // and a wash of colour once the lines are down
  const wash = useTransform(draw, (v) => seg(v, 0.84, 1));

  return (
    <section ref={ref} className="relative overflow-hidden bg-porcelain py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal className="max-w-[560px]">
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
          </Reveal>

          <Reveal delay={0.1} className="max-w-[420px]">
            <p className="prose-lux">{written.drawingCopy}</p>
            <Link href="/process/" className="quiet-link mt-7 inline-block text-navy">
              How a house is made
            </Link>
          </Reveal>
        </div>
      </div>

      {/* the sheet */}
      <div className="mx-auto mt-12 max-w-[1560px] px-5 lg:mt-16 lg:px-12">
        <div className="relative overflow-hidden rounded-[2px] bg-[#fbfaf6] shadow-[0_44px_90px_-56px_rgba(20,41,74,0.6)] ring-1 ring-navy/12">
          {/* the wash, once the lines are down */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: wash,
              background:
                "radial-gradient(46% 52% at 50% 76%, rgba(111,149,186,0.34) 0%, rgba(111,149,186,0.08) 52%, rgba(111,149,186,0) 78%), radial-gradient(38% 42% at 16% 34%, rgba(206,192,170,0.30) 0%, rgba(206,192,170,0) 74%), radial-gradient(38% 42% at 86% 34%, rgba(206,192,170,0.26) 0%, rgba(206,192,170,0) 74%)",
            }}
          />
          {/* the corners of the sheet fall away */}
          <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_6px_rgba(251,250,246,0.75)]" />

          <motion.div style={{ scale: cameraScale, y: cameraY }} className="origin-center">
            <svg
              viewBox={narrow ? "556 118 488 606" : "0 0 1600 830"}
              className="relative block w-full"
              fill="none"
              aria-label="The ground floor plan of an oceanfront estate, drawn line by line"
              role="img"
            >
              <g
                stroke="#224b82"
                strokeLinecap="square"
                strokeLinejoin="miter"
                vectorEffect="non-scaling-stroke"
              >
                <Lines d={SITE} progress={site} width={1} opacity={0.5} />
                <Lines d={SHELL} progress={shell} width={2} opacity={0.9} />
                <Lines d={PARTITIONS} progress={partitions} width={1.4} opacity={0.76} />
                <Lines d={ROTUNDA} progress={rotunda} width={1.4} opacity={0.76} />
                <Lines d={WINDOWS} progress={windows} width={1.1} opacity={0.68} />

                {SWINGS.map((s, i) => (
                  <g key={i}>
                    <Line d={s.pivot} progress={swings} width={1.2} opacity={0.72} />
                    <Line d={s.arc} progress={swings} width={0.9} opacity={0.4} />
                  </g>
                ))}

                <Lines d={DETAILS} progress={details} width={1.1} opacity={0.6} />

                {!narrow && (
                  <>
                    <Lines d={SHORE} progress={shore} width={1.1} opacity={0.44} />
                    {TREES.map(([cx, cy, r], i) => (
                      <g key={i}>
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          style={{ pathLength: details }}
                        />
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={2.5}
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          style={{ pathLength: details }}
                        />
                      </g>
                    ))}
                    <Lines d={DIMENSIONS} progress={dims} width={0.9} opacity={0.44} />
                  </>
                )}
              </g>

              {/* the north point */}
              {!narrow && (
                <motion.g style={{ opacity: labels }}>
                  <circle cx="1500" cy="92" r="30" stroke="#224b82" strokeWidth="0.9" opacity="0.4" />
                  <path d="M1500 68 l8 24 -8 -7 -8 7 z" fill="#224b82" opacity="0.5" />
                  <text
                    x="1500"
                    y="122"
                    textAnchor="middle"
                    fill="#224b82"
                    fillOpacity="0.5"
                    fontSize="15"
                    letterSpacing="2"
                    fontFamily="var(--font-figtree)"
                  >
                    N
                  </text>
                </motion.g>
              )}

              {/* the hand that wrote it */}
              <motion.g
                style={{ opacity: labels }}
                fill="#224b82"
                fillOpacity="0.5"
                fontSize={narrow ? 21 : 15}
                letterSpacing={narrow ? 3.4 : 3.2}
                fontFamily="var(--font-figtree)"
              >
                <text x="800" y="136" textAnchor="middle">
                  MOTOR COURT
                </text>
                {!narrow && (
                  <>
                  <text x="292" y="250">
                    KITCHEN
                  </text>
                  <text x="486" y="204">
                    SCULLERY
                  </text>
                  <text x="486" y="302">
                    STUDY
                  </text>
                  <text x="292" y="440">
                    FAMILY
                  </text>
                  </>
                )}
                <text x="800" y="306" textAnchor="middle">
                  ROTUNDA
                </text>
                <text x="800" y="470" textAnchor="middle">
                  GALLERY
                </text>
                {!narrow && (
                  <>
                  <text x="966" y="250">
                    DINING
                  </text>
                  <text x="1166" y="250">
                    SALON
                  </text>
                  <text x="966" y="440">
                    PRIMARY
                  </text>
                  </>
                )}
                <text x="800" y="572" textAnchor="middle">
                  LOGGIA
                </text>
                <text x="800" y="672" textAnchor="middle">
                  POOL
                </text>
                {!narrow && (
                  <>
                    <text x="1580" y="812" textAnchor="end" fontSize="14" fillOpacity="0.42">
                      THE ATLANTIC
                    </text>
                    <text x="52" y="722" fontSize="15" letterSpacing="2.6" fillOpacity="0.5">
                      BLUEDOOR BUILDING
                    </text>
                    <text x="52" y="758" fontSize="13" letterSpacing="2.2" fillOpacity="0.36">
                      GROUND FLOOR PLAN
                    </text>
                    <text x="52" y="780" fontSize="13" letterSpacing="2.2" fillOpacity="0.36">
                      SCALE — AS NOTED
                    </text>
                  </>
                )}
              </motion.g>

              {/* the parallel rule, travelling down the sheet */}
              <motion.line
                x1="0"
                x2="1600"
                stroke="#6f95ba"
                strokeWidth="1.2"
                style={{ y: ruleY, opacity: ruleFade }}
              />
            </svg>
          </motion.div>
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
    <motion.path d={d} strokeWidth={width} strokeOpacity={opacity} style={{ pathLength: progress }} />
  );
}
