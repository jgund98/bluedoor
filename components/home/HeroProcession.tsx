"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { site, written } from "@/lib/site";

// Measure before the browser paints, so the stage never shows one frame at
// the wrong size. Falls back to useEffect where there is no DOM.
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ------------------------------------------------------------------ *
 * The plates of a monograph, full screen. One photograph at a time at
 * full strength; the page turns by one plate dissolving into the next,
 * the way a careful person turns a page — not performed. A torn strip of
 * the paper survives at the foot, carrying the plate's caption the way a
 * monograph does, and the marks beside it keep the clock.
 * ------------------------------------------------------------------ */

type Plate = {
  src: string;
  pos: string;
  posM: string;
  caption: string;
  /** desktop recompose for plates whose subject sits low in the frame */
  art?: string;
};

/**
 * A phone is a portrait window onto a landscape photograph — every plate is
 * cropped to a slice about a third of its own width, so posM is not a nudge
 * of the desktop framing but a second composition. Each is centred on the
 * thing the picture is actually about: the stair, the pendants, the ocean
 * window, the arched entry. Full height is always shown, so posM's vertical
 * figure does no work and is left at centre.
 */
const PLATES: readonly Plate[] = [
  {
    src: "/images/estate-palms-hero.jpg",
    pos: "50% 50%",
    posM: "50% 50%",
    caption: "Mediterranean elevation, oceanfront",
  },
  {
    src: "/images/hero-stairhall.jpg",
    pos: "50% 52%",
    // the stair is dead centre and the hall is symmetric about it
    posM: "50% 50%",
    caption: "A double stair hall in cut travertine",
  },
  {
    src: "/images/kitchen-brass.jpg",
    pos: "50% 52%",
    // the two blue-dipped pendants sit either side of the middle; centred
    // here they hang level, evenly inset from both edges
    posM: "50% 50%",
    caption: "Kitchen in blue and unlacquered brass",
  },
  {
    src: "/images/estate-colonial.jpg",
    pos: "50% 55%",
    // on the arched entry and the curved stair sweeping up to it
    posM: "49% 50%",
    caption: "Colonial elevation with louvered shutters",
  },
  {
    src: "/images/greatroom.jpg",
    pos: "50% 45%",
    // on the window and the water beyond it
    posM: "49% 50%",
    caption: "Great room, framed to the Atlantic",
  },
];

const ALL = [0, 1, 2, 3, 4] as const;

/**
 * The phone runs its own edit. It opens on the stair hall — symmetric, and
 * the only plate whose composition is already vertical — and the wide
 * oceanfront elevation is held back for the desk, where it can be seen.
 * Cropped to a phone it would show a quarter of its width, and at 1600px
 * wide that slice is 386 native pixels doing the work of 780: the one plate
 * in the set that cannot be sharp on a phone.
 */
const MOBILE = [1, 2, 4, 3] as const;

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

/**
 * One plate dissolves into the next and nothing else happens. The paint
 * bloom that used to spread across the sheet was a lovely thing to watch —
 * which is the objection to it. A portfolio shown to someone commissioning
 * a house should change the way a page is turned by a careful person, not
 * perform. No wipe, no slide, no zoom on the turn.
 */
const FADE_S = 1.05;
const HOLD_DESK = 6000;
const HOLD_PHONE = 7200;

/** A long decelerating settle — everything arrives quickly and stops slowly. */
const RISE = [0.16, 1, 0.3, 1] as const;

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

  // which plates this screen shows, and in what order
  const seq = useMemo<readonly number[]>(() => (box.mobile ? MOBILE : ALL), [box.mobile]);

  // a rotated phone inherits an index the desk's longer edit had reached
  useEffect(() => {
    setCurrent((c) => (c < seq.length ? c : 0));
    setIncoming((n) => (n === null || n < seq.length ? n : null));
  }, [seq]);

  // the dissolve: 0 = the plate on the page, 1 = the next one in its place
  const prog = useMotionValue(0);

  // how far through its hold the plate is, for the marks at the foot
  const held = useMotionValue(0);
  const hold = box.mobile ? HOLD_PHONE : HOLD_DESK;

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
        duration: FADE_S,
        // symmetric and gentle at both ends: the plate underneath is never
        // caught half-lit, which is what makes a crossfade look like one
        ease: [0.37, 0, 0.63, 1],
        onComplete: () => {
          setCurrent(idx);
          setIncoming(null);
          busy.current = false;
        },
      });
    },
    [current, prog],
  );

  const turn = useCallback(() => turnTo((current + 1) % seq.length), [current, seq, turnTo]);

  // the page turns itself, when nobody is turning it — and the marks at the
  // foot run the same clock, so the one that is lit reads how long is left
  useEffect(() => {
    if (incoming !== null) return;
    held.set(0);
    const run = animate(held, 1, { duration: hold / 1000, ease: "linear" });
    const t = setTimeout(() => {
      if (onStage.current && !document.hidden) turn();
    }, hold);
    return () => {
      run.stop();
      clearTimeout(t);
    };
  }, [current, incoming, turn, hold, held]);

  // the next plate is developed before it is needed
  useEffect(() => {
    const img = new Image();
    img.src = PLATES[seq[(current + 1) % seq.length]].src;
  }, [current, seq]);

  // As the page begins to scroll, the photograph moves at half speed — the
  // page below is drawn up over the plate, the way a flyleaf is pulled
  // over a photograph in a portfolio case. Transform only.
  const { scrollY } = useScroll();
  const plateY = useTransform(scrollY, [0, 900], box.reduced ? [0, 0] : [0, 380], {
    clamp: true,
  });

  const plate = PLATES[seq[current]];
  const next = incoming !== null ? PLATES[seq[incoming]] : null;
  const shown = incoming ?? current;

  /* ---- the light meter ---- */
  const grade = useMotionValue(box.mobile ? 0.42 : 0.3);
  useEffect(() => {
    const el = stage.current;
    if (!box.ready || !el) return;
    const h = el.getBoundingClientRect().height;
    const p = PLATES[seq[shown]];
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
      const lo = box.mobile ? 0.28 : 0.17;
      const hi = box.mobile ? 0.74 : 0.58;
      const target = Math.min(hi, Math.max(lo, (luma - 0.3) * (box.mobile ? 1.15 : 0.8)));
      animate(grade, target, { duration: 0.9, ease: [0.4, 0, 0.2, 1] });
    };

    img.src = p.src;
    if (img.complete) meter();
    else img.addEventListener("load", meter, { once: true });
    return () => img.removeEventListener("load", meter);
  }, [shown, seq, box.ready, box.w, box.mobile, grade]);

  /* ---- the curtain ---- *
   * Nothing moves until the first photograph is actually here. A hero that
   * choreographs itself over an empty frame and then drops the picture in
   * is worse than no choreography at all. */
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (lit || !box.ready) return;
    const img = new window.Image();
    const raise = () => setLit(true);
    img.addEventListener("load", raise, { once: true });
    // a picture that will not load must not hold the page shut
    img.addEventListener("error", raise, { once: true });
    img.src = PLATES[seq[0]].src;
    if (img.complete) raise();
    const bell = setTimeout(raise, 2600);
    return () => {
      clearTimeout(bell);
      img.removeEventListener("load", raise);
      img.removeEventListener("error", raise);
    };
  }, [lit, box.ready, seq]);

  /** One line of the setting, rising into place. */
  const setting = (i: number) => ({
    initial: "held" as const,
    animate: (lit ? "set" : "held") as "set" | "held",
    variants: {
      held: box.reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
      set: {
        opacity: 1,
        y: 0,
        transition: box.reduced
          ? { duration: 0.3 }
          : { duration: 1.15, delay: 0.34 + i * 0.13, ease: RISE },
      },
    },
  });

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
        className={`absolute inset-0 cursor-pointer overflow-hidden transition-opacity duration-[1400ms] ease-out focus:outline-none ${
          lit ? "opacity-100" : "opacity-0"
        }`}
      >
        {box.ready && (
          <motion.div className="absolute inset-0" style={{ y: plateY }}>
            {/* The picture comes to rest rather than arriving at rest — it
                settles out of a slight over-scale, the way a print eases into
                focus. It lands at 1, and the breathe drift begins from 1.03,
                so the two never fight over the same frame. */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: box.reduced ? 1 : 1.055 }}
              animate={{ scale: 1 }}
              transition={{ duration: box.reduced ? 0 : 2.6, ease: RISE }}
            >
              {/* The drift lives here, on a wrapper that never unmounts, so
                  both plates are always at the same scale. Put it on the
                  images and each new one restarts its own clock — the
                  dissolve then happens between two pictures at different
                  magnifications, which is exactly the seam you can see. */}
              <div
                className="breathe absolute inset-0"
                style={{ animationDuration: "58s" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ transform: box.mobile ? undefined : plate.art }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plate.src}
                    alt={plate.caption}
                    className="absolute inset-0 h-full w-full object-cover"
                    fetchPriority="high"
                    style={{
                      objectPosition: box.mobile ? plate.posM : plate.pos,
                      filter: "contrast(1.04)",
                    }}
                  />
                </div>

                {next && (
                  <motion.div className="absolute inset-0" style={{ opacity: prog }}>
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
              </div>
            </motion.div>
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] lg:hidden"
          style={{
            opacity: grade,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.9) 42%, rgba(0,0,0,0.66) 60%, rgba(0,0,0,0.36) 76%, rgba(0,0,0,0.14) 88%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* Taller than it was, and no denser: the credit line above the
            headline sat above the old band's reach and had nothing under it.
            Reach, not weight — the top three fifths are almost nothing, so
            there is no edge anywhere to read as an overlay. */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[58%] lg:block"
          style={{
            opacity: grade,
            background:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.84) 16%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.4) 44%, rgba(0,0,0,0.25) 58%, rgba(0,0,0,0.14) 72%, rgba(0,0,0,0.06) 86%, rgba(0,0,0,0) 100%)",
          }}
        />
      </button>

      {/* the chrome rides on a thin sheet of trace, so the nav can be read */}
      <motion.div
        className="vellum-strip pointer-events-none absolute inset-x-0 top-0 h-[148px] lg:h-[184px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: box.reduced ? 0.3 : 1.2, delay: box.reduced ? 0 : 0.2 }}
      />

      {/* The words are set on the page one line at a time, the way a
          compositor sets them — eyebrow, the roman line, its italic answer,
          then the way in. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[64px] px-5 pb-8 text-left lg:bottom-[76px] lg:px-12 lg:pb-12">
        {/* The trade and the place, set as a masthead credit: what she does
            and where she does it, before the claim she makes about it. On a
            desk they sit on one line with a rule between them. A phone has
            no room for that, so they become two credit lines and the rule
            goes — left to wrap, it strands itself at the end of the first
            line and reads as a stray dash. */}
        <motion.span
          {...setting(0)}
          className="hero-ink flex flex-col items-start gap-y-[6px] text-porcelain lg:flex-row lg:items-center lg:gap-x-4 lg:gap-y-0"
        >
          {/* Tracked caps at 10px over a sunlit facade are the weakest thing
              on the screen. The answer is weight on the letter, not more
              shadow under it and not a darker picture. */}
          <span className="label label-sheet font-semibold">{written.heroEyebrow}</span>
          <span className="hidden h-px w-8 shrink-0 bg-porcelain/55 lg:block" />
          <span className="label label-sheet font-semibold">{written.heroPlace}</span>
        </motion.span>

        <h1 className="hero-ink mt-6 text-porcelain lg:mt-7">
          <motion.span
            {...setting(1)}
            className="display block text-[clamp(24px,7.8vw,44px)] tracking-[-0.018em] lg:text-[clamp(50px,4.3vw,74px)]"
          >
            {written.heroLine}
          </motion.span>
          <motion.span
            {...setting(2)}
            className="answer mt-[3px] block text-[clamp(25px,8.1vw,46px)] text-porcelain/92 lg:mt-1 lg:text-[clamp(52px,4.5vw,78px)]"
          >
            {written.heroAnswer}
          </motion.span>
        </h1>

        {/* The way in. A rule either side read as ornament and pointed
            nowhere; one rule, running out to the right from under the words,
            reads as a direction. On hover the words step forward and the
            rule runs on ahead of them. Never a pill, never a fill. */}
        <motion.div {...setting(3)}>
          <Link
            href="/build-with-bluedoor/"
            className="group pointer-events-auto mt-8 inline-flex items-center lg:mt-10"
          >
            <span className="label label-sheet hero-ink whitespace-nowrap font-semibold text-porcelain transition-transform duration-[900ms] ease-out group-hover:translate-x-[3px]">
              {written.inviteCta}
            </span>
            <span className="relative ml-5 block h-px w-14 overflow-hidden lg:ml-7 lg:w-24">
              <span className="absolute inset-0 bg-porcelain/40" />
              <span className="absolute inset-y-0 left-0 w-full origin-left scale-x-[0.34] bg-porcelain transition-transform duration-[900ms] ease-out group-hover:scale-x-100" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* All that survives of the paper: a torn strip at the foot of the
          page, carrying the plate's caption the way a monograph does. It
          slides up under the picture last, the way the mount is laid in
          after the print. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[64px] bg-porcelain lg:h-[76px]"
        initial={{ y: box.reduced ? 0 : "100%" }}
        animate={{ y: lit ? 0 : box.reduced ? 0 : "100%" }}
        transition={{ duration: box.reduced ? 0.3 : 1.1, delay: box.reduced ? 0 : 0.72, ease: RISE }}
      >
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
                {/* A caption under a full-page photograph names the picture.
                    On a phone the numeral is the part worth dropping — the
                    marks already say which plate this is — so the caption
                    itself survives instead. */}
                <span className="hidden md:inline">Plate {NUMERALS[shown]} — </span>
                {PLATES[seq[shown]].caption}
              </motion.span>
            </AnimatePresence>
          </span>

          {/* The marks keep the clock. The lit one is a rule that fills as
              its plate is held, so how long is left is available to anyone
              who looks for it and invisible to everyone else. */}
          <span className="flex shrink-0 items-center gap-[9px]">
            {seq.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => turnTo(i)}
                aria-label={`Plate ${NUMERALS[i]}`}
                className="group flex h-6 w-2 items-center justify-center"
              >
                <span
                  className={`relative w-px overflow-hidden transition-all duration-500 ${
                    i === shown ? "h-[15px] bg-navy/22" : "h-[10px] bg-navy/25 group-hover:bg-navy/50"
                  }`}
                >
                  {i === shown && (
                    <motion.span
                      className="absolute inset-x-0 top-0 h-full origin-top bg-navy"
                      style={{ scaleY: held }}
                    />
                  )}
                </span>
              </button>
            ))}
          </span>

          {/* The running foot of the book. It carried the place until the
              credit line above the headline started saying it — the same
              two words twice in one screen is the sort of thing that reads
              as a template. The studio's name is what a monograph runs at
              the foot of the page anyway. */}
          <span className="label label-sheet hidden whitespace-nowrap text-ink/40 lg:block">
            {site.name}
          </span>
        </div>
      </motion.div>
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
