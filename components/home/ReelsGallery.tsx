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

  // play while visible; drop sound the moment the arch leaves center stage
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

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

/** One arch riding the colonnade, all styling derived from distance to center. */
function ColonnadeArch({
  index,
  pos,
  children,
  caption,
}: {
  index: number;
  pos: MotionValue<number>;
  children: React.ReactNode;
  caption: string;
}) {
  const x = useTransform(pos, (p) => (index - p) * SPACING);
  const scale = useTransform(pos, (p) => {
    const d = Math.min(Math.abs(index - p), 2.5);
    return 1 - d * 0.13;
  });
  const y = useTransform(pos, (p) => Math.min(Math.abs(index - p), 2.5) * 26);
  const veil = useTransform(pos, (p) =>
    Math.min(Math.abs(index - p) * 0.42, 0.62)
  );
  const captionOpacity = useTransform(pos, (p) =>
    Math.max(0, 1 - Math.abs(index - p) * 1.6)
  );

  return (
    <motion.div
      className="absolute left-1/2 top-0 will-change-transform"
      style={{ x, scale, y, translateX: "-50%", zIndex: 50 - index }}
    >
      <div className="relative h-[52vh] min-h-[380px] w-[30vh] min-w-[244px] max-w-[318px] md:w-[33vh]">
        {children}
        {/* the recession veil — arches out of focus fall into shadow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-t-full bg-espresso"
          style={{ opacity: veil }}
        />
      </div>
      <motion.p
        className="serif-body mt-5 text-center text-[16px] italic text-umber/75"
        style={{ opacity: captionOpacity }}
      >
        {caption}
      </motion.p>
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
  // continuous colonnade position: 0 … N (last stop is the mark)
  const pos = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.86));
    return t * N;
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
    <section ref={sectionRef} className="relative bg-linen" style={{ height: "420vh" }}>
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

        {/* the colonnade */}
        <div className="relative mt-10 flex-1">
          {site.reels.map((reel, i) => (
            <ColonnadeArch key={reel.src} index={i} pos={pos} caption={reel.label}>
              <ReelVideo {...reel} active={stage === i} />
            </ColonnadeArch>
          ))}
          {/* the walk ends at the door */}
          <ColonnadeArch index={N} pos={pos} caption="Follow the work, daily.">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full w-full flex-col items-center justify-center gap-6 rounded-t-full border border-navy/25 bg-bone"
            >
              <img
                src="/images/logo.png"
                alt=""
                className="h-24 w-24 transition-transform duration-700 group-hover:scale-110"
              />
              <span className="label text-center leading-relaxed text-navy">
                Follow
                <br />
                {site.instagramHandle}
              </span>
            </a>
          </ColonnadeArch>
        </div>

        <p className="serif-body mx-auto max-w-xl px-5 text-center text-[16px] italic leading-relaxed text-umber/70">
          {site.bio}
        </p>
      </div>
    </section>
  );
}
