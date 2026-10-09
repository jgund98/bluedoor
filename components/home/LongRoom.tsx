"use client";

/* The Long Room — a private viewing corridor.
 *
 * The page scrolls down; the room drifts sideways, so you walk past the work
 * rather than scroll through it. Three films hang on the wall at different
 * heights with photographs set between them, and every film is DARK until it
 * reaches the middle of the room: it wakes, plays, and goes quiet again as you
 * pass. Only one film is ever decoding, which is also why this costs almost
 * nothing to run.
 *
 * The clips are the studio's own phone footage, trimmed to their best seconds
 * and cropped clear of the burned-in Instagram captions. They are 540px wide at
 * source, so every frame here is deliberately small and contained — blown up
 * full-bleed they would fall apart.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

type Film = {
  kind: "film";
  src: string;
  poster: string;
  /** Rendered width in px at desktop; height follows the clip's true ratio. */
  w: number;
  ratio: number;
  numeral: string;
  place: string;
  line: string;
  /** Distance from the top of the room, in svh. Varies the hang. */
  top: number;
};

type Plate = {
  kind: "plate";
  src: string;
  w: number;
  ratio: number;
  caption: string;
  top: number;
  /** 0 = hung on the wall, 1 = far back. Drives the parallax. */
  depth: number;
};

type Piece = Film | Plate;

const PIECES: Piece[] = [
  {
    kind: "film",
    src: "/reels/home/place.mp4",
    poster: "/reels/home/place.jpg",
    w: 296,
    ratio: 540 / 960,
    numeral: "I",
    place: "Palm Beach",
    line: "The island, from the air",
    top: 15,
  },
  {
    kind: "plate",
    src: "/images/gate-pineapple.jpg",
    w: 186,
    ratio: 3 / 4,
    caption: "The gate",
    top: 55,
    depth: 0.55,
  },
  {
    kind: "film",
    src: "/reels/home/frame.mp4",
    poster: "/reels/home/frame.jpg",
    w: 384,
    ratio: 540 / 720,
    numeral: "II",
    place: "SoSo House",
    line: "Arches, before the glass",
    top: 24,
  },
  {
    kind: "plate",
    src: "/images/detail-stone-column.jpg",
    w: 168,
    ratio: 3 / 4,
    caption: "Cut stone",
    top: 12,
    depth: 0.7,
  },
  {
    kind: "film",
    src: "/reels/home/finish.mp4",
    poster: "/reels/home/finish.jpg",
    w: 332,
    ratio: 540 / 810,
    numeral: "III",
    place: "Oceanfront",
    line: "The room, finished",
    top: 19,
  },
  {
    kind: "plate",
    src: "/images/loggia-ocean.jpg",
    w: 214,
    ratio: 4 / 3,
    caption: "The loggia",
    top: 58,
    depth: 0.45,
  },
];

const FILM_INDEXES = PIECES.reduce<number[]>(
  (acc, p, i) => (p.kind === "film" ? [...acc, i] : acc),
  []
);

export default function LongRoom() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);

  // The room is exactly as long as it is wide: one pixel of scroll moves the
  // wall one pixel sideways, which is the only ratio that doesn't feel either
  // sticky or slippery.
  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      setTravel(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  // Which film is standing in the middle of the room. Offsets are cached at
  // layout time, so this reads no geometry while you scroll.
  const centers = useRef<number[]>([]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    centers.current = FILM_INDEXES.map((i) => {
      const node = el.querySelector<HTMLElement>(`[data-piece="${i}"]`);
      return node ? node.offsetLeft + node.offsetWidth / 2 : 0;
    });
  }, [travel]);

  useMotionValueEvent(x, "change", (v) => {
    if (!centers.current.length) return;
    const target = window.innerWidth / 2 - v;
    let best = 0;
    let bestD = Infinity;
    centers.current.forEach((c, n) => {
      const d = Math.abs(c - target);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    });
    setActive((prev) => (prev === best ? prev : best));
  });

  return (
    <>
      {/* ------------------------------- desktop ------------------------------ */}
      <section
        ref={section}
        aria-label="Three films from the field"
        className="relative hidden lg:block"
        style={{ height: travel ? `calc(100svh + ${travel}px)` : "100svh" }}
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-porcelain grain">
          <motion.div
            ref={track}
            style={{ x }}
            className="absolute inset-y-0 left-0 flex h-full items-start gap-[clamp(80px,7vw,150px)] pl-[8vw] pr-[10vw] will-change-transform"
          >
            <Opening />

            {PIECES.map((piece, i) =>
              piece.kind === "film" ? (
                <FilmPlate
                  key={piece.src}
                  index={i}
                  film={piece}
                  awake={FILM_INDEXES.indexOf(i) === active}
                  progress={scrollYProgress}
                  travel={travel}
                />
              ) : (
                <StillPlate
                  key={piece.src}
                  index={i}
                  plate={piece}
                  progress={scrollYProgress}
                  travel={travel}
                />
              )
            )}

            <Closing />
          </motion.div>

          {/* the floor of the room */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[7svh] h-px bg-navy/10" />
        </div>
      </section>

      {/* ------------------------------- mobile ------------------------------- */}
      <section
        aria-label="Three films from the field"
        className="bg-porcelain grain px-5 py-20 lg:hidden"
      >
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-navy/30" />
          <span className="label text-navy/75">On film</span>
        </div>
        <h2 className="mt-5">
          <span className="display block text-[30px] text-ink">Three rooms,</span>
          <span className="answer mt-0.5 block text-[32px] text-navy">one island.</span>
        </h2>
        <p className="prose-lux mt-4 text-[15px] leading-[1.62]">
          Shot on the job, on our own phones, in the order a house actually
          happens.
        </p>

        <div className="mt-12 space-y-14">
          {PIECES.filter((p): p is Film => p.kind === "film").map((f, n) => (
            <MobileFilm key={f.src} film={f} flip={n % 2 === 1} />
          ))}
        </div>

        <Link href="/media" className="quiet-link mt-12 inline-block text-navy">
          More on film
        </Link>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Opening() {
  return (
    <div className="flex h-full w-[clamp(340px,26vw,430px)] shrink-0 flex-col justify-center">
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-navy/30" />
        <span className="label text-navy/75">On film</span>
      </div>
      <h2 className="mt-8">
        <span className="display block text-[clamp(34px,2.9vw,46px)] text-ink">
          Three rooms,
        </span>
        <span className="answer mt-1 block text-[clamp(36px,3.1vw,50px)] text-navy">
          one island.
        </span>
      </h2>
      <p className="prose-lux mt-7 max-w-[380px]">
        Shot on the job, on our own phones, in the order a house actually
        happens. Keep scrolling and the room moves past you.
      </p>
      <span className="label mt-10 text-ink/35">Walk the room →</span>
    </div>
  );
}

function Closing() {
  return (
    <div className="flex h-full w-[clamp(280px,20vw,340px)] shrink-0 flex-col justify-center">
      <span className="display block text-[clamp(26px,2.1vw,34px)] leading-[1.25] text-ink">
        There is more where these came from.
      </span>
      <Link href="/media" className="quiet-link mt-8 inline-block text-navy">
        More on film
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FilmPlate({
  index,
  film,
  awake,
  progress,
  travel,
}: {
  index: number;
  film: Film;
  awake: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  travel: number;
}) {
  const video = useRef<HTMLVideoElement>(null);

  // Waking is what makes the room feel alive, and it is also the whole
  // performance story: one decoder at a time, nothing fetched until needed.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (awake) {
      const p = el.play();
      if (p) p.catch(() => {});
    } else {
      el.pause();
    }
  }, [awake]);

  const h = film.w / film.ratio;

  return (
    <figure
      data-piece={index}
      className="relative shrink-0"
      style={{ width: film.w, marginTop: `${film.top}svh` }}
    >
      <motion.div
        animate={{
          opacity: awake ? 1 : 0.42,
          scale: awake ? 1 : 0.965,
          filter: awake ? "saturate(1)" : "saturate(0.45)",
        }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative overflow-hidden bg-mist ring-1 ring-navy/12 will-change-transform"
        style={{ height: h }}
      >
        <video
          ref={video}
          src={film.src}
          poster={film.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={film.line}
          className="h-full w-full object-cover"
        />
      </motion.div>

      <figcaption className="mt-5 flex items-baseline gap-3">
        <span className="display text-[13px] tracking-[0.2em] text-navy/50">
          {film.numeral}
        </span>
        <span className="h-px w-5 shrink-0 self-center bg-navy/25" />
        <span className="min-w-0">
          <span className="block text-[15px] leading-snug text-ink">
            {film.line}
          </span>
          <span className="label mt-1 block text-ink/40">{film.place}</span>
        </span>
      </figcaption>
      <Drift progress={progress} travel={travel} depth={0.12} />
    </figure>
  );
}

function StillPlate({
  index,
  plate,
  progress,
  travel,
}: {
  index: number;
  plate: Plate;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  travel: number;
}) {
  // Set further back in the room, so it slides past more slowly than the films.
  const x = useTransform(progress, [0, 1], [0, travel * plate.depth * 0.16]);

  return (
    <motion.figure
      data-piece={index}
      style={{ width: plate.w, marginTop: `${plate.top}svh`, x }}
      className="relative shrink-0 will-change-transform"
    >
      <div
        className="overflow-hidden bg-mist plate ring-1 ring-navy/10"
        style={{ height: plate.w / plate.ratio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={plate.src} alt="" loading="lazy" />
      </div>
      <figcaption className="label mt-4 text-ink/35">{plate.caption}</figcaption>
    </motion.figure>
  );
}

/** A hair of extra travel so the films sit forward of the photographs. */
function Drift({
  progress,
  travel,
  depth,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  travel: number;
  depth: number;
}) {
  const y = useTransform(progress, [0, 1], [0, -travel * depth * 0.05]);
  return (
    <motion.span
      aria-hidden
      style={{ y }}
      className="pointer-events-none absolute -left-6 top-0 h-full w-px bg-navy/[0.07]"
    />
  );
}

/* -------------------------------------------------------------------------- */

/** Same idea, standing up: the film wakes when it reaches the middle. */
function MobileFilm({ film, flip }: { film: Film; flip: boolean }) {
  const wrap = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [awake, setAwake] = useState(false);

  const set = useCallback((on: boolean) => {
    const el = video.current;
    if (!el) return;
    setAwake(on);
    if (on) {
      const p = el.play();
      if (p) p.catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => set(e.isIntersecting && e.intersectionRatio > 0.55),
      { threshold: [0, 0.55, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [set]);

  return (
    <figure ref={wrap} className={flip ? "pl-10" : "pr-10"}>
      <motion.div
        animate={{ opacity: awake ? 1 : 0.5, filter: awake ? "saturate(1)" : "saturate(0.5)" }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative overflow-hidden bg-mist ring-1 ring-navy/12"
        style={{ aspectRatio: `${film.ratio}` }}
      >
        <video
          ref={video}
          src={film.src}
          poster={film.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={film.line}
          className="h-full w-full object-cover"
        />
      </motion.div>
      <figcaption className="mt-4 flex items-baseline gap-3">
        <span className="display text-[12px] tracking-[0.2em] text-navy/50">
          {film.numeral}
        </span>
        <span className="h-px w-4 shrink-0 self-center bg-navy/25" />
        <span>
          <span className="block text-[15px] leading-snug text-ink">{film.line}</span>
          <span className="label mt-1 block text-ink/40">{film.place}</span>
        </span>
      </figcaption>
    </figure>
  );
}
