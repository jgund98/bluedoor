"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { written } from "@/lib/site";

// Measure before the browser paints, so the stage never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ------------------------------------------------------------------ *
 * The plates of a monograph, full screen. One photograph at a time at
 * full strength; the page turns by a wash of paint — the next plate
 * develops inside a spreading bloom, because every home here is painted
 * before it is poured. A torn strip of the paper survives at the foot
 * of the page, carrying the plate's caption the way a monograph does.
 * ------------------------------------------------------------------ */

type Plate = {
  src: string;
  pos: string;
  posM: string;
  caption: string;
  /** desktop recompose for plates whose subject sits low in the frame */
  art?: string;
};

const PLATES: readonly Plate[] = [
  {
    src: "/images/estate-palms-hero.jpg",
    pos: "50% 50%",
    posM: "42% 62%",
    caption: "Mediterranean elevation, oceanfront",
  },
  {
    src: "/images/hero-stairhall.jpg",
    pos: "50% 52%",
    posM: "50% 52%",
    caption: "A double stair hall in cut travertine",
  },
  {
    src: "/images/kitchen-brass.jpg",
    pos: "50% 52%",
    posM: "46% 52%",
    caption: "Kitchen in blue and unlacquered brass",
  },
  {
    src: "/images/estate-colonial.jpg",
    pos: "50% 55%",
    posM: "46% 55%",
    caption: "Colonial elevation with louvered shutters",
  },
  {
    src: "/images/greatroom.jpg",
    pos: "50% 45%",
    posM: "50% 45%",
    caption: "Great room, framed to the Atlantic",
  },
];

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

/** Where each bloom starts on the sheet — varied, never random, so the
 *  server and the client always agree. */
const ORIGINS = ["62% 34%", "34% 46%", "68% 58%", "42% 28%", "56% 62%"] as const;

/** An irregular splat with a soft edge, for the paint to spread through. */
const BLOB_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><filter id='s' x='-40%' y='-40%' width='180%' height='180%'><feGaussianBlur stdDeviation='16'/></filter></defs><path filter='url(#s)' fill='black' d='M197 38 C 252 26 316 58 342 116 C 366 170 356 236 322 288 C 292 334 236 372 178 362 C 122 352 62 314 44 252 C 28 194 52 122 104 78 C 134 52 162 46 197 38 Z'/></svg>`;
const BLOB = `url("data:image/svg+xml,${encodeURIComponent(BLOB_SVG)}")`;

const HOLD_MS = 7000;
const BLOOM_S = 1.7;

export default function HeroProcession() {
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 1440, mobile: false, reduced: false, ready: false });

  useMeasure(() => {
    const el = stage.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (!w) return;
      // Width only. A phone's stage changes height as the URL bar collapses,
      // and reacting to that mid-scroll is what read as the hero animating.
      setBox((prev) =>
        Math.round(w) === Math.round(prev.w) && prev.ready
          ? prev
          : { w, mobile: w < 1024, reduced, ready: true },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const busy = useRef(false);

  // the paint spreading: 0 = a drop, 1 = the whole sheet
  const prog = useMotionValue(0);
  const size = useTransform(prog, [0, 1], [7, 360]);
  const maskSize = useMotionTemplate`${size}%`;
  const settle = useTransform(prog, [0, 1], [1.075, 1.03]);
  const fade = useTransform(prog, [0, 0.35, 1], [0, 1, 1]);

  const onStage = useRef(true);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (onStage.current = e.isIntersecting), {
      rootMargin: "10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const turnTo = useCallback(
    (idx: number) => {
      if (busy.current || idx === current) return;
      busy.current = true;
      setIncoming(idx);
      prog.set(0);
      animate(prog, 1, {
        duration: BLOOM_S,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          setCurrent(idx);
          setIncoming(null);
          busy.current = false;
        },
      });
    },
    [current, prog],
  );

  const turn = useCallback(() => turnTo((current + 1) % PLATES.length), [current, turnTo]);

  // the page turns itself, when nobody is turning it
  useEffect(() => {
    if (incoming !== null) return;
    const t = setTimeout(() => {
      if (onStage.current && !document.hidden) turn();
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [current, incoming, turn]);

  // the next plate is developed before it is needed
  useEffect(() => {
    const img = new Image();
    img.src = PLATES[(current + 1) % PLATES.length].src;
  }, [current]);

  // As the page begins to scroll, the photograph moves at half speed — the
  // page below is drawn up over the plate, the way a flyleaf is pulled
  // over a photograph in a portfolio case. Transform only.
  const { scrollY } = useScroll();
  const plateY = useTransform(scrollY, [0, 900], box.reduced ? [0, 0] : [0, 380], {
    clamp: true,
  });

  const plate = PLATES[current];
  const next = incoming !== null ? PLATES[incoming] : null;
  const shown = incoming ?? current;

  /* ---- the light meter ---- */
  const grade = useMotionValue(box.mobile ? 0.42 : 0.3);
  useEffect(() => {
    const el = stage.current;
    if (!box.ready || !el) return;
    const h = el.getBoundingClientRect().height;
    const p = PLATES[shown];
    const img = new window.Image();

    const meter = () => {
      // the patch the words actually sit on, in stage pixels
      const luma = readLuma(
        img,
        box.w,
        h,
        box.mobile ? p.posM : p.pos,
        box.mobile
          ? { x: 0, y: h - 290, w: box.w, h: 200 }
          : { x: 0, y: h - 340, w: box.w * 0.52, h: 250 },
        box.mobile ? 0.9 : 0.82,
      );
      if (luma === null) return;
      // hold back only what has to come down: a sunlit stucco wall reads
      // near 0.9, a shaded interior near 0.35
      const lo = box.mobile ? 0.3 : 0.16;
      const hi = box.mobile ? 0.82 : 0.56;
      const target = Math.min(hi, Math.max(lo, (luma - 0.3) * (box.mobile ? 1.15 : 0.8)));
      animate(grade, target, { duration: 0.9, ease: [0.4, 0, 0.2, 1] });
    };

    img.src = p.src;
    if (img.complete) meter();
    else img.addEventListener("load", meter, { once: true });
    return () => img.removeEventListener("load", meter);
  }, [shown, box.ready, box.w, box.mobile, grade]);
  // a phone gets a clean dissolve — a masked full-screen repaint per frame
  // is exactly the kind of work that made the old hero stutter
  const bloom = !box.mobile && !box.reduced;

  return (
    <section
      ref={stage}
      className="relative h-[100svh] w-full overflow-hidden bg-porcelain grain lg:h-screen"
    >
      {/* the plate, full bleed and full strength — click to turn the page */}
      <button
        type="button"
        onClick={turn}
        aria-label="Next photograph"
        className={`absolute inset-0 cursor-pointer overflow-hidden transition-opacity duration-700 focus:outline-none ${
          box.ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {box.ready && (
          <motion.div className="absolute inset-0" style={{ y: plateY }}>
            <div
              key={plate.src}
              className="absolute inset-0"
              style={{ transform: box.mobile ? undefined : plate.art }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plate.src}
                alt={plate.caption}
                className="breathe absolute inset-0 h-full w-full object-cover"
                fetchPriority="high"
                style={{
                  objectPosition: box.mobile ? plate.posM : plate.pos,
                  animationDuration: "26s",
                  filter: "contrast(1.04)",
                }}
              />
            </div>

            {next && (
              <motion.div
                className="absolute inset-0"
                style={
                  bloom
                    ? {
                        scale: settle,
                        WebkitMaskImage: BLOB,
                        maskImage: BLOB,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: ORIGINS[incoming! % ORIGINS.length],
                        maskPosition: ORIGINS[incoming! % ORIGINS.length],
                        WebkitMaskSize: maskSize,
                        maskSize: maskSize,
                      }
                    : { opacity: fade, scale: settle }
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div
                  className="absolute inset-0"
                  style={{ transform: box.mobile ? undefined : next.art }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={next.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: box.mobile ? next.posM : next.pos,
                      filter: "contrast(1.04)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* an even ink dim across the whole plate — the neutral-density
            grade that lets porcelain type sit on a white facade — with the
            punch restored by the contrast lift on the photograph */}
        <div className="pointer-events-none absolute inset-0 bg-black/[0.14]" />

        {/* The grade exposes for the picture. Every plate is measured where
            the words actually fall, and only the amount of light that has to
            come down comes down — a sunlit white wall gets held back hard, a
            dark interior is barely touched. A fixed scrim can only be wrong
            in one direction or the other. */}
        {/* A phone gets a band that hugs the words and feathers away above
            them, rather than a wash down the whole frame — the same reading
            for a third of the darkening, and the picture stays open. */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] lg:hidden"
          style={{
            opacity: grade,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.94) 18%, rgba(0,0,0,0.96) 44%, rgba(0,0,0,0.7) 64%, rgba(0,0,0,0.3) 82%, rgba(0,0,0,0) 100%)",
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[46%] lg:block"
          style={{
            opacity: grade,
            background:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 26%, rgba(0,0,0,0.44) 52%, rgba(0,0,0,0.16) 76%, rgba(0,0,0,0) 100%)",
          }}
        />
      </button>

      {/* the chrome rides on a thin sheet of trace, so the nav can be read */}
      <div className="vellum-strip pointer-events-none absolute inset-x-0 top-0 h-[148px] lg:h-[184px]" />

      {/* the words, on the photograph — the same setting as the portfolio
          masthead, which these plates have already proven they can carry */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[64px] px-5 pb-8 text-left lg:bottom-[76px] lg:px-12 lg:pb-12">
        <span className="label label-sheet hero-ink block text-porcelain">
          {written.heroEyebrow}
        </span>

        <h1 className="hero-ink mt-5 text-porcelain lg:mt-6">
          <span className="display block text-[clamp(30px,7.4vw,40px)] lg:text-[clamp(44px,3.8vw,64px)]">
            {written.heroLine}
          </span>
          <span className="answer mt-1 block text-[clamp(31px,7.7vw,42px)] text-porcelain/95 lg:mt-1.5 lg:text-[clamp(46px,4vw,68px)]">
            {written.heroAnswer}
          </span>
        </h1>

        {/* the way opens: two hairlines draw out from the words on hover */}
        <Link
          href="/build-with-bluedoor/"
          className="group pointer-events-auto mt-7 inline-flex items-center gap-4 lg:mt-8 lg:gap-5"
        >
          <span className="h-px w-9 bg-porcelain/50 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-porcelain/85 lg:w-12 lg:group-hover:w-20" />
          <span className="label label-sheet hero-ink whitespace-nowrap text-porcelain transition-opacity duration-700 group-hover:opacity-75">
            {written.inviteCta}
          </span>
          <span className="h-px w-9 bg-porcelain/50 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-porcelain/85 lg:w-12 lg:group-hover:w-20" />
        </Link>
      </div>

      {/* All that survives of the paper: a torn strip at the foot of the
          page, carrying the plate's caption the way a monograph does. */}
      <div className="absolute inset-x-0 bottom-0 h-[64px] bg-porcelain lg:h-[76px]">
        {box.ready && (
          <svg
            aria-hidden
            width={box.w}
            height={22}
            viewBox={`0 0 ${box.w} 22`}
            className="pointer-events-none absolute inset-x-0 -top-[21px] block"
            style={{ filter: "drop-shadow(0 -3px 7px rgba(20,41,74,0.18))" }}
          >
            <path d={deckle(box.w)} fill="#fdfcfa" />
          </svg>
        )}

        {/* a faint tide-line of pigment along the tear */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(42% 150% at 10% 0%, rgba(111,149,186,0.07) 0%, rgba(111,149,186,0) 70%), radial-gradient(38% 130% at 88% 0%, rgba(206,192,170,0.09) 0%, rgba(206,192,170,0) 70%)",
          }}
        />

        <div className="relative flex h-full items-center justify-between px-5 lg:px-12">
          <span className="relative overflow-visible text-left">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={shown}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                className="label label-sheet block whitespace-nowrap text-ink/50"
              >
                Plate {NUMERALS[shown]}
                <span className="hidden md:inline"> — {PLATES[shown].caption}</span>
              </motion.span>
            </AnimatePresence>
          </span>

          <span className="flex items-center gap-[9px]">
            {PLATES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => turnTo(i)}
                aria-label={`Plate ${NUMERALS[i]}`}
                className="group flex h-6 w-2 items-center justify-center"
              >
                <span
                  className={`w-px transition-all duration-500 ${
                    i === shown
                      ? "h-[15px] bg-navy"
                      : "h-[10px] bg-navy/25 group-hover:bg-navy/50"
                  }`}
                />
              </button>
            ))}
          </span>

          <span className="label label-sheet hidden whitespace-nowrap text-ink/40 lg:block">
            {written.heroFoot}
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Average luminance of the patch of a photograph that lands under a given
 * rect of the stage — the same cover maths the browser uses, run backwards
 * so we sample exactly what the reader will see behind the words.
 */
function readLuma(
  img: HTMLImageElement,
  boxW: number,
  boxH: number,
  objectPosition: string,
  rect: { x: number; y: number; w: number; h: number },
  pct: number,
): number | null {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih || !boxW || !boxH) return null;

  const scale = Math.max(boxW / iw, boxH / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;
  const [pxRaw, pyRaw] = objectPosition.split(/\s+/);
  const px = (parseFloat(pxRaw) || 50) / 100;
  const py = (parseFloat(pyRaw) || 50) / 100;
  const offX = (boxW - drawW) * px;
  const offY = (boxH - drawH) * py;

  const sx = Math.max(0, Math.min(iw - 1, (rect.x - offX) / scale));
  const sy = Math.max(0, Math.min(ih - 1, (rect.y - offY) / scale));
  const sw = Math.max(1, Math.min(iw - sx, rect.w / scale));
  const sh = Math.max(1, Math.min(ih - sy, rect.h / scale));

  const N = 16;
  const canvas = document.createElement("canvas");
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, N, N);
    const { data } = ctx.getImageData(0, 0, N, N);
    const lumas: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      lumas.push((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
    }
    // Not the average — white type fails against the brightest patch it
    // crosses, and a facade full of dark windows averages out to nothing
    // while the wall between them is still blinding. Meter for the highlights.
    lumas.sort((a, b) => a - b);
    return lumas[Math.min(lumas.length - 1, Math.floor(lumas.length * pct))];
  } catch {
    return null; // a tainted canvas is not worth a broken hero
  }
}

/**
 * The torn edge of a sheet of fine paper. Deterministic, so it never
 * shimmers between renders — four sine waves of different periods give
 * the irregular fibrous line a deckle has, without any of it repeating.
 */
function deckle(w: number, h = 22) {
  const base = h * 0.54;
  const n = Math.max(8, Math.round(w / 24));
  let d = `M0 ${h} L0 ${base.toFixed(2)}`;
  for (let i = 0; i <= n; i++) {
    const x = (w * i) / n;
    const t = i * 0.87;
    const y =
      base +
      Math.sin(t) * 1.9 +
      Math.sin(t * 2.3 + 1.3) * 1.1 +
      Math.sin(t * 5.1 + 0.5) * 0.5 +
      Math.sin(t * 9.7 + 2.1) * 0.25;
    d += ` L${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return `${d} L${w} ${h} Z`;
}
