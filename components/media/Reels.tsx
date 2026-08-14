"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/motion";

const DROP = [0, 46, 14, 28, 0, 40];

export default function Reels() {
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
              <Clip src={r.src} poster={r.poster} label={r.label} />
            </div>
          ))}
        </div>

        {/* mobile: swipe through them */}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {site.reels.map((r) => (
            <div key={r.src} className="w-[72vw] shrink-0 snap-center">
              <Clip src={r.src} poster={r.poster} label={r.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clip({ src, poster, label }: { src: string; poster: string; label: string }) {
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

  return (
    <figure>
      <div
        className="portal relative aspect-[3/4.1] overflow-hidden ring-1 ring-navy/12"
        style={{ backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" }}
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
      </div>
      <figcaption className="answer mt-4 text-[15px] leading-[1.4] text-ink/55">{label}</figcaption>
    </figure>
  );
}
