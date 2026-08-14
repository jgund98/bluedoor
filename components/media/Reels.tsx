"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/motion";

const DROP = [0, 46, 14, 28, 0, 40];

export default function Reels() {
  // one clip has the sound at a time, the way it works on a phone
  const [audible, setAudible] = useState<string | null>(null);

  return (
    <section className="bg-porcelain py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-[520px]">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-navy/30" />
              <span className="label text-navy/75">From the site</span>
            </div>
            <h2 className="mt-6">
              <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                Work in progress,
              </span>
              <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                as it happens.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="quiet-link inline-block text-navy"
            >
              {site.instagramHandle}
            </a>
          </Reveal>
        </div>

        {/* desktop: a staggered hang of arches */}
        <div className="mt-14 hidden grid-cols-3 gap-8 lg:grid xl:gap-10">
          {site.reels.map((r, i) => (
            <div key={r.src} style={{ paddingTop: DROP[i % DROP.length] }}>
              <Clip
                {...r}
                audible={audible === r.src}
                onToggle={() => setAudible(audible === r.src ? null : r.src)}
              />
            </div>
          ))}
        </div>

        {/* mobile: swipe through them */}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {site.reels.map((r) => (
            <div key={r.src} className="w-[72vw] shrink-0 snap-center">
              <Clip
                {...r}
                audible={audible === r.src}
                onToggle={() => setAudible(audible === r.src ? null : r.src)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clip({
  src,
  poster,
  label,
  audible,
  onToggle,
}: {
  src: string;
  poster: string;
  label: string;
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
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Muted must stay a real DOM property — autoplay policies read the
  // property, not the attribute.
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
        aria-label={audible ? `Mute ${label}` : `Play sound for ${label}`}
        className="portal group relative block aspect-[3/4.1] w-full overflow-hidden ring-1 ring-navy/12"
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
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

        {/* the affordance, always legible, never in the way */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/55 to-transparent" />
        <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/55 px-4 py-2 backdrop-blur-[6px] transition-colors duration-500 group-hover:bg-ink/75">
          <Speaker on={audible} />
          <span className="label whitespace-nowrap text-porcelain">
            {audible ? "Sound on" : "Tap for sound"}
          </span>
        </span>
      </button>
      <figcaption className="answer mt-4 text-[15px] leading-[1.4] text-ink/55">{label}</figcaption>
    </figure>
  );
}

function Speaker({ on }: { on: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 6h2.5L9 3v10L5.5 10H3V6z"
        fill="currentColor"
        className="text-porcelain"
      />
      {on ? (
        <>
          <path d="M11 5.5a3.4 3.4 0 0 1 0 5" stroke="currentColor" strokeWidth="1.2" className="text-porcelain" strokeLinecap="round" />
          <path d="M12.8 3.6a6 6 0 0 1 0 8.8" stroke="currentColor" strokeWidth="1.2" className="text-porcelain" strokeLinecap="round" />
        </>
      ) : (
        <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.2" className="text-porcelain" strokeLinecap="round" />
      )}
    </svg>
  );
}
