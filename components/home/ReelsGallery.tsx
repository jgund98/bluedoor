"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { FadeUp, Lines } from "@/components/motion";

/**
 * Their Instagram as a loggia walk: one coquina arch holds center stage,
 * its reel playing large, while the arches beside it recede in scale and
 * shadow. Scroll advances the colonnade one arch at a time and ends at
 * the mark itself. Touch devices swipe the same colonnade natively.
 */

const N = site.reels.length; // + 1 endcap arch for the profile
const SPACING = 400; // px between arch centers at rest

function ReelVideo({
  src,
  poster,
  label,
  active,
}: {
  src: string;
  poster: string;
  label: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  // the projector runs one film at a time — and only while on screen
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let inView = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && active) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(video);
    if (active) video.play().catch(() => {});
    else video.pause();
    return () => io.disconnect();
  }, [active]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!active && sound) {
      video.muted = true;
      setSound(false);
    }
  }, [active, sound]);

  return (
    <button
      type="button"
      aria-label={sound ? `Mute — ${label}` : `Play with sound — ${label}`}
      onClick={() => {
        const video = ref.current;
        if (!video) return;
        video.muted = sound;
        if (!sound) video.play().catch(() => {});
        setSound(!sound);
      }}
      className="group relative block h-full w-full overflow-hidden rounded-t-full border border-umber/15 bg-cover bg-center"
      style={{ backgroundImage: `url(${poster})` }}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span
        className={`label-wide absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[9px] backdrop-blur-sm transition-all duration-500 ${
          sound
            ? "bg-bone/90 text-navy"
            : "bg-espresso/45 text-bone/90 opacity-0 group-hover:opacity-100"
        }`}
      >
        {sound ? "Sound On" : "Tap for Sound"}
      </span>
    </button>
  );
}

/** One film in the projection room — it fades through the shared arch. */
function StackedFilm({
  index,
  pos,
  children,
}: {
  index: number;
  pos: MotionValue<number>;
  children: React.ReactNode;
}) {
  const opacity = useTransform(pos, (p) => {
    const d = Math.abs(index - p);
    return d >= 0.5 ? 0 : 1 - d * 2;
  });
  const scale = useTransform(pos, (p) => {
    const d = Math.min(Math.abs(index - p), 0.5);
    return 1 + d * 0.06;
  });
  const visibility = useTransform(pos, (p) =>
    Math.abs(index - p) >= 0.5 ? "hidden" : "visible"
  );
  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, scale, visibility }}
    >
      {children}
    </motion.div>
  );
}

/** The running order beside the arch, engraved like a programme. */
function Programme({ pos }: { pos: MotionValue<number> }) {
  return (
    <div className="hidden flex-col gap-5 lg:flex">
      {site.reels.map((reel, i) => (
        <ProgrammeRow key={reel.src} index={i} pos={pos} label={reel.label} />
      ))}
    </div>
  );
}

function ProgrammeRow({
  index,
  pos,
  label,
}: {
  index: number;
  pos: MotionValue<number>;
  label: string;
}) {
  const opacity = useTransform(pos, (p) =>
    Math.abs(index - p) < 0.5 ? 1 : 0.35
  );
  const x = useTransform(pos, (p) => (Math.abs(index - p) < 0.5 ? 10 : 0));
  return (
    <motion.div className="flex items-baseline gap-4" style={{ opacity, x }}>
      <span className="display text-lg text-taupe">{String(index + 1).padStart(2, "0")}</span>
      <span className="serif-body max-w-[180px] text-[15px] italic leading-snug text-umber/80">
        {label}
      </span>
    </motion.div>
  );
}

export default function ReelsGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [stage, setStage] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () =>
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // continuous projection position: 0 … N-1, with a quiet hold on the last
  const pos = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.04) / 0.92));
    return t * (N - 1);
  });

  // which arch holds center stage (for sound handoff + the counter)
  useEffect(() => {
    const unsub = pos.on("change", (p) => {
      const s = Math.round(p);
      setStage((prev) => (prev === s ? prev : s));
    });
    return () => unsub();
  }, [pos]);

  const driven = isDesktop && !reduce;

  if (!driven) {
    // touch + reduced motion: swipeable colonnade, sides peeking
    return (
      <section className="overflow-hidden bg-linen">
        <div className="py-20 md:py-28">
          <div className="mx-auto w-full max-w-[1520px] px-5 md:px-10">
            <FadeUp>
              <p className="label mb-6 text-navy">On Site, Daily</p>
            </FadeUp>
            <Lines
              as="h2"
              className="display max-w-2xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
              lines={["Through the arches,", "the work in motion."]}
            />
          </div>
          <div className="mt-12 flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {site.reels.map((reel) => (
              <figure key={reel.src} className="w-[66vw] shrink-0 snap-center sm:w-[280px]">
                <div className="aspect-[9/14] w-full">
                  <ReelVideo {...reel} active />
                </div>
                <figcaption className="serif-body mt-4 text-center text-[15px] italic text-umber/70">
                  {reel.label}
                </figcaption>
              </figure>
            ))}
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-[200px] shrink-0 flex-col items-center justify-center gap-4 self-stretch pb-12"
            >
              <img src="/images/logo.png" alt="" className="h-16 w-16" />
              <span className="label text-center text-navy">
                Follow
                <br />
                {site.instagramHandle}
              </span>
            </a>
          </div>
          <FadeUp delay={0.1}>
            <p className="serif-body mx-auto mt-8 max-w-xl px-5 text-center text-[17px] italic leading-relaxed text-umber/70">
              {site.bio}
            </p>
          </FadeUp>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-linen" style={{ height: "240vh" }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pb-6 pt-24">
        <div className="mx-auto w-full max-w-[1520px] px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <FadeUp>
                <p className="label mb-5 text-navy">On Site, Daily</p>
              </FadeUp>
              <Lines
                as="h2"
                className="display max-w-2xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
                lines={["Through the arches,", "the work in motion."]}
              />
            </div>
            <div className="flex flex-col items-end gap-3">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="label border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
              >
                {site.instagramHandle}
              </a>
              {/* the walk's position, counted like plates in a monograph */}
              <p className="display text-xl text-taupe">
                {String(Math.min(stage, N - 1) + 1).padStart(2, "0")}
                <span className="text-sand">&ensp;/&ensp;{String(N).padStart(2, "0")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* the projection room: one arch, the films change inside it */}
        <div className="relative mt-8 flex flex-1 items-center justify-center gap-14 xl:gap-20">
          <Programme pos={pos} />
          <div className="relative h-[54vh] min-h-[380px] w-[min(34vh,80vw)] min-w-[250px]">
            <div
              className="absolute -inset-3 rounded-t-full border border-umber/15"
              aria-hidden
            />
            <div className="relative h-full w-full overflow-hidden rounded-t-full">
              {site.reels.map((reel, i) => (
                <StackedFilm key={reel.src} index={i} pos={pos}>
                  <ReelVideo {...reel} active={stage === i} />
                </StackedFilm>
              ))}
            </div>
          </div>
          <div className="hidden w-[220px] flex-col gap-6 lg:flex">
            <p className="serif-body text-[16px] italic leading-relaxed text-umber/75">
              {site.bio}
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[10.5px] font-medium uppercase tracking-[0.34em] text-navy underline decoration-navy/35 underline-offset-8 transition-colors hover:decoration-navy"
            >
              Follow {site.instagramHandle}
            </a>
          </div>
        </div>


      </div>
    </section>
  );
}
