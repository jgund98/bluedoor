"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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

const STUDY = ["I", "II", "III", "IV", "V"] as const;

/**
 * The lift off the rail, and the settle back onto it. A tween on the same
 * decelerating curve the hero settles on, not a spring — a spring arrives
 * eagerly, and nothing here should look eager. Slow enough that the eye can
 * follow the painting across the room.
 */
const LIFT = { type: "tween" as const, duration: 0.86, ease: [0.45, 0, 0.15, 1] as const };

export default function Atelier() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  /* Which painting has been taken down off the rail, by index. */
  const [held, setHeld] = useState<number | null>(null);
  const step = useCallback(
    (d: number) => setHeld((h) => (h === null ? h : (h + d + HANGS.length) % HANGS.length)),
    [],
  );

  useEffect(() => {
    if (held === null) return;
    document.documentElement.classList.add("no-scroll");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [held, step]);

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
            <Hang
              key={h.src}
              hang={h}
              i={i}
              progress={scrollYProgress}
              held={held === i}
              onLift={() => setHeld(i)}
            />
          ))}
        </div>

        {/* mobile: a swipeable hang */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 pt-8 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {HANGS.map((h, i) => (
            <div key={h.src} className="w-[62vw] shrink-0 snap-center">
              <button
                type="button"
                onClick={() => setHeld(i)}
                aria-label={`Look closer at study ${STUDY[i]}`}
                className="block w-full"
              >
                <motion.div
                  layoutId={`study-${i}`}
                  className="bg-porcelain p-2 shadow-[0_18px_40px_-30px_rgba(20,41,74,0.55)] ring-1 ring-navy/12"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.src} alt="Watercolor study of a Bluedoor home" loading="lazy" />
                </motion.div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Held index={held} onClose={() => setHeld(null)} onStep={step} />
    </section>
  );
}

/**
 * Taken down off the rail. The painting itself travels from its place on the
 * wall to the middle of a sheet of paper — the same object, moved, not a
 * second copy of it appearing over the first. The room behind goes to paper
 * rather than to black: this is a studio, and the lights do not go down.
 */
function Held({
  index,
  onClose,
  onStep,
}: {
  index: number | null;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-5 lg:px-12">
          {/* the sheet the study is laid on */}
          <motion.button
            type="button"
            aria-label="Put the study back"
            onClick={onClose}
            className="absolute inset-0 cursor-zoom-out bg-porcelain/95 grain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62 }}
          />

          <motion.div
            layoutId={`study-${index}`}
            className="relative bg-porcelain p-3 shadow-[0_60px_120px_-60px_rgba(20,41,74,0.7)] ring-1 ring-navy/15 lg:p-4"
            /* One width, and the height follows the paper. No `layout` on the
               image inside: that counter-scales the child to correct
               distortion, and since the study and its thumbnail are the same
               picture at the same ratio there is no distortion to correct --
               it only made the painting snap to full size and slide, instead
               of growing. */
            style={{ width: "min(92vw, min(820px, 96svh))" }}
            transition={LIFT}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HANGS[index].src}
              alt="Watercolor study of a Bluedoor home"
              className="block h-auto w-full"
            />
          </motion.div>

          {/* the plate line, set after the painting has come to rest */}
          <motion.div
            className="relative mt-7 flex items-center gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
            transition={{ duration: 0.7, delay: 0.58, ease: [0.19, 1, 0.22, 1] }}
          >
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="The study before"
              className="label text-ink/40 transition-colors duration-500 hover:text-navy"
            >
              ‹
            </button>
            <span className="label label-sheet whitespace-nowrap text-ink/50">
              Study {STUDY[index]} — watercolor, before the line was staked
            </span>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="The next study"
              className="label text-ink/40 transition-colors duration-500 hover:text-navy"
            >
              ›
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hang({
  hang,
  i,
  progress,
  held,
  onLift,
}: {
  hang: (typeof HANGS)[number];
  i: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  held: boolean;
  onLift: () => void;
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
      {/* The wire it hangs by — it lets go while the study is off the wall,
          so nothing is left holding an empty hook. */}
      <motion.div
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-navy/25"
        style={{ height: hang.drop }}
        animate={{ opacity: held ? 0 : 1, scaleY: held ? 0.4 : 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <div className="absolute left-1/2 top-0 h-[5px] w-[5px] -translate-x-1/2 -translate-y-[2px] rounded-full bg-navy/45" />

      <div style={{ paddingTop: hang.drop }}>
        <button
          type="button"
          onClick={onLift}
          aria-label={`Look closer at study ${STUDY[i]}`}
          className="block w-full cursor-zoom-in"
        >
          <motion.div
            /* the id is surrendered while this one is the study in hand, so
               framer moves the single painting rather than crossfading two */
            layoutId={`study-${i}`}
            className="bg-porcelain p-[10px] shadow-[0_18px_40px_-30px_rgba(20,41,74,0.55)] ring-1 ring-navy/12"
            whileHover={{ y: -6, boxShadow: "0 34px 60px -32px rgba(20,41,74,0.62)" }}
            transition={LIFT}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hang.src} alt="Watercolor study of a Bluedoor home" loading="lazy" />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}
