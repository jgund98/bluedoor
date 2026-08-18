"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion";

/*
 * Three films, hung in the same arch the site uses everywhere else — the
 * doorway. They play themselves, silently, when they come into view, and
 * give you their sound if you ask for it. One at a time, ever.
 *
 * The clips are the studio's own footage, re-cut from the reels: trimmed to
 * the seconds that are actually worth showing, cropped clear of the burned-in
 * Instagram captions, and kept at their source width. They are 540px wide, so
 * the frames here are deliberately contained — blown up they would show it.
 */
const FILMS = [
  {
    src: "/reels/home/frame.mp4",
    poster: "/reels/home/frame.jpg",
    label: "The frame",
    caption: "Arches, before the glass",
    drop: 0,
  },
  {
    src: "/reels/home/room.mp4",
    poster: "/reels/home/room.jpg",
    label: "The room",
    caption: "Finished, to the horizon",
    drop: 44,
  },
  {
    src: "/reels/home/view.mp4",
    poster: "/reels/home/view.jpg",
    label: "The terrace",
    caption: "Out to the Atlantic",
    drop: 18,
  },
];

export default function Films() {
  // one film has the sound at a time, the way it works on a phone
  const [audible, setAudible] = useState<string | null>(null);

  return (
    <section className="bg-chalk py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-[520px]">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-navy/30" />
              <span className="label text-navy/75">On film</span>
            </div>
            <h2 className="mt-6">
              <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                Three moments,
              </span>
              <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                as they happened.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <Link href="/media/" className="quiet-link inline-block text-navy">
              More on film
            </Link>
          </Reveal>
        </div>

        {/* One list, two layouts. A second copy behind `hidden` is still a
            <video> in the document and a display:none video keeps playing its
            audio — two copies of one clip unmuting together is two
            soundtracks a few hundred milliseconds apart. */}
        <div className="mt-12 flex flex-col gap-12 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-10 xl:gap-12">
          {FILMS.map((f) => (
            <div
              key={f.src}
              className="lg:pt-[var(--drop)]"
              style={{ "--drop": `${f.drop}px` } as CSSProperties}
            >
              <Film
                {...f}
                audible={audible === f.src}
                onToggle={() => setAudible(audible === f.src ? null : f.src)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Film({
  src,
  poster,
  label,
  caption,
  audible,
  onToggle,
}: {
  src: string;
  poster: string;
  label: string;
  caption: string;
  audible: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Muted has to be a real DOM property — autoplay policy reads the property,
  // not the attribute.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !audible;
    if (audible) el.play().catch(() => {});
  }, [audible]);

  return (
    <figure>
      <button
        type="button"
        onClick={onToggle}
        aria-label={audible ? `Mute ${caption}` : `Play sound for ${caption}`}
        className="portal group relative block aspect-[3/4.05] w-full cursor-pointer overflow-hidden bg-mist ring-1 ring-navy/12"
      >
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        />

        {/* the ask, legible on anything, never in the way of the picture */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/55 to-transparent" />
        <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/50 px-4 py-2 transition-colors duration-500 group-hover:bg-ink/70">
          <Speaker on={audible} />
          <span className="label label-sheet whitespace-nowrap text-porcelain">
            {audible ? "Sound on" : "Tap for sound"}
          </span>
        </span>
      </button>

      <figcaption className="mt-5 flex items-baseline gap-3">
        <span className="label shrink-0 text-navy/70">{label}</span>
        <span className="h-px w-5 shrink-0 bg-navy/25" />
        <span className="answer text-[15px] leading-[1.4] text-ink/60 lg:text-[16px]">
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

function Speaker({ on }: { on: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 6h2.5L9 3v10L5.5 10H3V6z" fill="currentColor" className="text-porcelain" />
      {on ? (
        <>
          <path
            d="M11 5.5a3.4 3.4 0 0 1 0 5"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-porcelain"
            strokeLinecap="round"
          />
          <path
            d="M12.8 3.6a6 6 0 0 1 0 8.8"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-porcelain"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M11 6l4 4M15 6l-4 4"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-porcelain"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
