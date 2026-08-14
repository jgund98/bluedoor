"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Link from "next/link";
import { written } from "@/lib/site";
import { Reveal } from "@/components/motion";

// Measure before the browser paints, so a stage never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

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

/**
 * The shell, drawn as a wall and not a line: an outer face and an inner
 * face. The rear wall is broken where the rooms open onto the loggia.
 */
const SHELL = [
  "M260 150 H1340",
  "M1340 150 V520",
  "M260 150 V520",
  // rear wall, opened to the loggia at the great room, the gallery and the primary
  "M260 520 H420",
  "M520 520 H740",
  "M860 520 H1140",
  "M1240 520 H1340",
  // the loggia
  "M340 520 V610",
  "M340 610 H1260",
  "M1260 610 V520",
  // the inner face of the wall
  "M272 162 H1328",
  "M1328 162 V508",
  "M272 162 V508",
  "M272 508 H420",
  "M520 508 H740",
  "M860 508 H1140",
  "M1240 508 H1328",
];

/**
 * Partitions. A house of this kind is not a grid of sealed rooms: the
 * kitchen stands open to the family room, and the public rooms are joined
 * by cased openings rather than doors. Gaps in these runs are openings.
 */
const PARTITIONS = [
  // west spine — great room to service, with a wide cased opening at the middle
  "M600 162 V182",
  "M600 228 V330",
  "M600 420 V508",
  // centre axis, opened either side of the rotunda
  "M720 162 V240",
  "M720 350 V508",
  "M880 162 V240",
  "M880 350 V508",
  // vestibule, opened on axis
  "M720 222 H768",
  "M832 222 H880",
  "M720 378 H768",
  "M832 378 H880",
  // service spine
  "M600 262 H720",
  "M600 400 H630",
  "M670 400 H720",
  "M600 460 H720",
  // east: dining over sitting, and the primary wing
  "M1080 162 V508",
  "M880 330 H1080",
  "M1080 330 H1110",
  "M1150 330 H1250",
  "M1290 330 H1328",
  "M1210 162 V330",
];

/** Jambs, so an opening reads as an opening and not a missing wall. */
const JAMBS = [
  "M594 330 h12 M594 420 h12",
  "M714 240 h12 M714 350 h12",
  "M874 240 h12 M874 350 h12",
  "M414 514 v12 M514 514 v12",
  "M734 514 v12 M854 514 v12",
  "M1134 514 v12 M1234 514 v12",
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

/** Doors, and only where a door belongs: the front, and the private rooms. */
const SWINGS = [
  { pivot: "M760 150 v44", arc: "M760 194 A44 44 0 0 0 804 150" },
  { pivot: "M840 150 v44", arc: "M840 194 A44 44 0 0 1 796 150" },
  { pivot: "M600 182 h46", arc: "M646 182 A46 46 0 0 1 600 228" },
  { pivot: "M630 400 v40", arc: "M630 440 A40 40 0 0 0 670 400" },
  { pivot: "M1110 330 v-40", arc: "M1110 290 A40 40 0 0 0 1150 330" },
  { pivot: "M1290 330 v-40", arc: "M1290 290 A40 40 0 0 1 1250 330" },
];

/** What is fixed in a house: counters, a stair, a hearth, a tub, a pool. */
const DETAILS = [
  // kitchen — a run along the wall and an island standing off it
  "M274 186 H310 V300 H274 Z",
  "M280 210 H304 V244 H280 Z",
  "M340 296 H540 V346 H340 Z",
  "M348 304 H532 V338 H348 Z",
  // the family hearth
  "M272 402 H304 V458 H272 Z",
  // scullery counter
  "M606 168 H714 V186 H606 Z",
  // the stair
  "M604 268 H716 V396 H604 Z",
  "M604 284 H716 M604 300 H716 M604 316 H716 M604 332 H716 M604 348 H716 M604 364 H716 M604 380 H716",
  "M660 268 V396",
  // powder
  "M606 406 H636 V424 H606 Z",
  "M690 428 H712 V456 H690 Z",
  // the lift
  "M606 466 H714 V502 H606 Z",
  "M606 466 L714 502",
  // primary bath
  "M1094 176 H1196 V244 H1094 Z",
  "M1102 184 H1188 V236 H1102 Z",
  "M1094 252 H1196 V276 H1094 Z",
  "M1112 258 H1132 V270 H1112 Z",
  "M1158 258 H1178 V270 H1158 Z",
  "M1160 288 H1188 V312 H1160 Z",
  // dressing room
  "M1220 178 H1330 M1220 202 H1330 M1220 252 H1330 M1220 276 H1330",
  "M1246 288 H1304 V312 H1246 Z",
  // the sitting-room hearth
  "M1326 402 H1294 V458 H1326 Z",
  // the colonnade
  "M380 578 h20 v20 h-20 z",
  "M500 578 h20 v20 h-20 z",
  "M620 578 h20 v20 h-20 z",
  "M740 578 h20 v20 h-20 z",
  "M860 578 h20 v20 h-20 z",
  "M980 578 h20 v20 h-20 z",
  "M1100 578 h20 v20 h-20 z",
  "M1220 578 h20 v20 h-20 z",
  // the pool and the terrace
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

/** A palm in plan: a trunk, and fronds thrown out around it. */
function palm(cx: number, cy: number, r: number, seed: number): string[] {
  const out: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed;
    const bend = 0.36 * (i % 2 === 0 ? 1 : -1);
    const x1 = cx + Math.cos(a) * 5;
    const y1 = cy + Math.sin(a) * 5;
    const x2 = cx + Math.cos(a) * r;
    const y2 = cy + Math.sin(a) * r;
    const mx = cx + Math.cos(a + bend) * r * 0.64;
    const my = cy + Math.sin(a + bend) * r * 0.64;
    out.push(
      "M" +
        x1.toFixed(1) +
        " " +
        y1.toFixed(1) +
        " Q" +
        mx.toFixed(1) +
        " " +
        my.toFixed(1) +
        " " +
        x2.toFixed(1) +
        " " +
        y2.toFixed(1),
    );
  }
  return out;
}

const PALMS: [number, number, number, number][] = [
  [140, 248, 32, 0.2],
  [110, 348, 26, 0.9],
  [180, 442, 29, 1.6],
  [1462, 248, 32, 0.5],
  [1492, 348, 26, 1.2],
  [1420, 442, 29, 0.1],
  [506, 664, 27, 0.7],
  [1096, 664, 27, 1.4],
  [430, 590, 21, 0.3],
  [1172, 590, 21, 1.1],
];

export default function Drawing() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // A phone gets the centre of the plan — the axis from the front door
  // through the rotunda to the water. The dimension string and the title
  // block would be four pixels tall out there.
  const [narrow, setNarrow] = useState(false);
  useMeasure(() => {
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
        <div className="relative overflow-hidden rounded-[2px] bg-[#fcfaf4] shadow-[0_44px_90px_-56px_rgba(20,41,74,0.6)] ring-1 ring-navy/12">
          {/* the tooth of the paper */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.5] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23p)' opacity='0.09'/%3E%3C/svg%3E\")",
            }}
          />
          {/* the corners of the sheet fall away */}
          <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_6px_rgba(252,250,244,0.7)]" />

          <motion.div style={{ scale: cameraScale, y: cameraY }} className="origin-center">
            <svg
              viewBox={narrow ? "556 118 488 606" : "0 0 1600 830"}
              className="relative block w-full"
              fill="none"
              aria-label="The ground floor plan of an oceanfront estate, drawn line by line"
              role="img"
            >
              <defs>
                {/* the wobble of a hand holding a pen */}
                <filter id="bd-hand" x="-4%" y="-4%" width="108%" height="108%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.019" numOctaves={1} seed={7} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.8" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                {/* colour laid on wet paper */}
                <filter id="bd-wash" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
                <filter id="bd-wash-soft" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="18" />
                </filter>
                <filter id="bd-wash-tight" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>

              {/* the colour goes down first and runs a little past the lines,
                  the way it does on wet paper */}
              <motion.g style={{ opacity: wash }} className="mix-blend-multiply">
                <g filter="url(#bd-wash)">
                  {/* the gravel of the motor court */}
                  <ellipse cx="800" cy="120" rx="162" ry="32" fill="#d8c49c" opacity="0.52" />
                  {/* the house holds a cool grey */}
                  <rect x="266" y="154" width="1068" height="362" fill="#ccd4dc" opacity="0.34" />
                  {/* terrace and loggia paving */}
                  <rect x="346" y="524" width="908" height="180" fill="#d2d9de" opacity="0.4" />
                  {/* the Atlantic */}
                  <ellipse cx="920" cy="792" rx="500" ry="40" fill="#8fb9d2" opacity="0.58" />
                </g>
                <g filter="url(#bd-wash-soft)">
                  <ellipse cx="150" cy="342" rx="100" ry="200" fill="#93a870" opacity="0.42" />
                  <ellipse cx="1450" cy="342" rx="100" ry="200" fill="#93a870" opacity="0.4" />
                </g>
                <g filter="url(#bd-wash-tight)">
                  <rect x="628" y="640" width="344" height="52" fill="#5fa3c6" opacity="0.62" />
                  <rect x="748" y="152" width="104" height="44" fill="#d8c49c" opacity="0.44" />
                </g>
              </motion.g>

              <g
                stroke="#2b3d55"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                filter={narrow ? undefined : "url(#bd-hand)"}
              >
                <Lines d={SITE} progress={site} width={1} opacity={0.5} />
                <Lines d={SHELL} progress={shell} width={2} opacity={0.9} />
                <Lines d={PARTITIONS} progress={partitions} width={1.4} opacity={0.76} />
                <Lines d={JAMBS} progress={partitions} width={1.4} opacity={0.62} />
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
                    {PALMS.map(([cx, cy, r, seed], i) => (
                      <g key={i}>
                        <Lines d={palm(cx, cy, r, seed)} progress={details} width={0.9} opacity={0.5} />
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          strokeWidth={1}
                          strokeOpacity={0.55}
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
                  <circle cx="1500" cy="92" r="30" stroke="#2b3d55" strokeWidth="0.9" opacity="0.45" />
                  <path d="M1500 68 l8 24 -8 -7 -8 7 z" fill="#2b3d55" opacity="0.55" />
                  <text
                    x="1500"
                    y="122"
                    textAnchor="middle"
                    fill="#2b3d55"
                    fillOpacity="0.6"
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
                fill="#2b3d55"
                fillOpacity="0.62"
                fontSize={narrow ? 21 : 15}
                letterSpacing={narrow ? 3.4 : 3.2}
                fontFamily="var(--font-figtree)"
              >
                <text x="800" y="136" textAnchor="middle">
                  MOTOR COURT
                </text>
                <text x="606" y="242">
                  SCULLERY
                </text>
                {!narrow && (
                  <>
                    <text x="342" y="232">
                      KITCHEN
                    </text>
                    <text x="292" y="482">
                      FAMILY ROOM
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
                    <text x="900" y="250">
                      DINING
                    </text>
                    <text x="900" y="440">
                      SITTING
                    </text>
                    <text x="1100" y="470">
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
