"use client";

import { written } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";
import { srcSetFor } from "@/lib/img";

/**
 * Her ask (10-14): take her off the homepage and give a visitor the snapshot,
 * "a little blurb about everything we do": new construction, renovation,
 * condos, historic renovation, and the estate management division.
 * A typeset ledger beside one arch, so the column with the heading carries
 * as much weight as the list.
 */
export default function WhatWeDo() {
  return (
    <section className="relative bg-chalk py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="flex items-center gap-5">
          <span className="label shrink-0 text-navy/75">{written.whatLabel}</span>
          <span className="hair h-px flex-1" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <h2>
                <span className="display block text-[clamp(28px,6.6vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,46px)]">
                  {written.whatLine}
                </span>
                <span className="answer mt-0.5 block text-[clamp(30px,7vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,50px)]">
                  {written.whatAnswer}
                </span>
              </h2>
            </Reveal>

            <RevealPlate delay={0.08} className="portal mt-9 aspect-[4/5] overflow-hidden plate ring-1 ring-navy/12 lg:mt-10 lg:aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/foyer-arched.jpg" srcSet={srcSetFor("/images/foyer-arched.jpg")} sizes="(min-width: 1024px) 40vw, 100vw" alt="An arched foyer looking to the front door" loading="lazy" decoding="async" style={{ objectPosition: "50% 50%" }} />
            </RevealPlate>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <Reveal delay={0.06}>
              <ul className="border-t border-navy/20">
                {written.whatWeDo.map((d) => (
                  <li key={d.name} className="grid grid-cols-[36px_1fr] gap-x-3 border-b border-navy/15 py-7 lg:grid-cols-[52px_1fr] lg:py-9">
                    <span className="display pt-[5px] text-[15px] text-navy/45 lg:pt-[8px] lg:text-[17px]">{d.n}</span>
                    <div>
                      <h3 className="display text-[24px] leading-[1.2] text-ink lg:text-[30px]">{d.name}</h3>
                      <p className="prose-lux mt-2.5 text-[16px] leading-[1.65] lg:text-[17px]">{d.copy}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
