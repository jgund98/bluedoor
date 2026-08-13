"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { FadeUp, Lines } from "@/components/motion";

/**
 * Their Instagram as a colonnade: reels playing inside coquina-arch apertures —
 * the same arches Bluedoor raises in stone. On desktop the scroll drives the
 * colonnade past the viewer, like walking a loggia; on touch it swipes.
 * Muted autoplay while in view, tap for sound, everything pointing back
 * to the profile.
 */
function ArchReel({
  src,
  poster,
  label,
  tall,
}: {
  src: string;
  poster: string;
  label: string;
  tall?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else {
          video.pause();
          video.muted = true;
          setSound(false);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="w-[66vw] shrink-0 snap-center sm:w-[280px] md:w-[256px]">
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
        className={`group relative block w-full overflow-hidden rounded-t-full border border-umber/15 bg-espresso shadow-[0_30px_60px_-35px_rgba(34,30,24,0.55)] ${
          tall ? "aspect-[9/15]" : "aspect-[9/14]"
        }`}
      >
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* sound state, whisper-quiet */}
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
      <figcaption className="serif-body mt-4 text-center text-[15px] italic text-umber/70">
        {label}
      </figcaption>
    </figure>
  );
}

export default function ReelsGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const reduce = useReducedMotion();

  // how far the colonnade must travel so its far end reaches the viewport edge
  useEffect(() => {
    const measure = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);
      const strip = stripRef.current;
      if (strip) {
        setOverflow(Math.max(0, strip.scrollWidth - window.innerWidth));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.08) / 0.84));
    return -t * overflow;
  });

  const driven = isDesktop && !reduce;

  const header = (
    <div className="mx-auto w-full max-w-[1520px] px-5 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <FadeUp>
            <p className="label mb-6 text-navy">On Site, Daily</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display max-w-2xl text-4xl text-umber md:text-5xl"
            lines={["Through the arches,", "the work in motion."]}
          />
        </div>
        <FadeUp>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="label border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
          >
            {site.instagramHandle}
          </a>
        </FadeUp>
      </div>
    </div>
  );

  const strip = (
    <div
      ref={stripRef}
      className={
        driven
          ? "flex w-max items-end gap-8 pl-[max(1.25rem,calc((100vw-1520px)/2+2.5rem))] pr-16"
          : "flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {site.reels.map((reel, i) => (
        <div key={reel.src} className={i % 2 === 1 ? "md:mb-8" : undefined}>
          <ArchReel {...reel} tall={i % 2 === 0} />
        </div>
      ))}
      {/* the colonnade ends at the source */}
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-[200px] shrink-0 flex-col items-center justify-center gap-4 self-stretch pb-12"
      >
        <img
          src="/images/logo.png"
          alt=""
          className="h-16 w-16 transition-transform duration-700 group-hover:scale-110"
        />
        <span className="label text-center text-navy">
          Follow
          <br />
          {site.instagramHandle}
        </span>
      </a>
    </div>
  );

  if (!driven) {
    // touch + reduced motion: a swipeable colonnade, sides peeking
    return (
      <section ref={sectionRef} className="overflow-hidden bg-linen">
        <div className="py-20 md:py-28">
          {header}
          <div className="mt-14">{strip}</div>
          <FadeUp delay={0.1}>
            <p className="serif-body mx-auto mt-10 max-w-xl px-5 text-center text-lg italic leading-relaxed text-umber/70">
              {site.bio}
            </p>
          </FadeUp>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-linen" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pb-5 pt-20">
        {header}
        <motion.div className="mt-8 will-change-transform" style={{ x }}>
          {strip}
        </motion.div>
        <p className="serif-body mx-auto mt-6 max-w-xl px-5 text-center text-[17px] italic leading-relaxed text-umber/70">
          {site.bio}
        </p>
      </div>
    </section>
  );
}
