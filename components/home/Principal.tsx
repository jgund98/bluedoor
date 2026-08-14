"use client";

import Link from "next/link";
import { site, written } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";

export default function Principal() {
  return (
    <section className="relative bg-chalk py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        {/* her name, written across the full measure */}
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <span className="script block whitespace-nowrap text-[clamp(76px,15vw,120px)] text-navy lg:text-[clamp(120px,11vw,178px)]">
              Siobhan Zerilla
            </span>
            <span className="label mt-3 shrink-0 text-ink/50 lg:mb-6 lg:mt-0">
              {site.principal.title} — Bluedoor Building
            </span>
          </div>
        </Reveal>

        <div className="hair mt-7 h-px w-full lg:mt-9" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          {/* her, in an arch, on a site she is building */}
          <div className="lg:col-span-5">
            <RevealPlate className="portal aspect-[3/4.1] overflow-hidden plate ring-1 ring-navy/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/siobhan-arch.jpg"
                alt="Siobhan Zerilla on site"
                loading="lazy"
                style={{ objectPosition: "42% 46%" }}
              />
            </RevealPlate>

            <Reveal delay={0.1}>
              <p className="answer mt-4 text-[15px] leading-[1.45] text-ink/50">
                On site, mid-construction — where she has spent most of her career.
              </p>
            </Reveal>
          </div>

          {/* what she does, and why it reads in the work */}
          <div className="flex flex-col lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2>
                <span className="display block text-[clamp(27px,6.2vw,32px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                  {written.principalLine}
                </span>
                <span className="answer mt-0.5 block text-[clamp(29px,6.6vw,34px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                  {written.principalAnswer}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="prose-lux mt-7 lg:mt-9">{site.copy.siobhanBio1}</p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="prose-lux mt-5">{site.copy.siobhanBio2}</p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 border-l border-navy/25 pl-6 lg:mt-10">
                <p className="answer text-[18px] leading-[1.55] text-ink/85 lg:text-[21px]">
                  “{site.principal.quote}”
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.26} className="mt-auto">
              <div className="mt-9 flex items-center gap-6 lg:mt-12">
                <Link href="/culture/" className="quiet-link inline-block text-navy">
                  Meet the studio
                </Link>
                <span className="hair hidden h-px flex-1 lg:block" />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
