"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { FadeUp, ImageReveal, Lines, Parallax } from "@/components/motion";
import PageHero from "@/components/PageHero";

const JOURNEY = [
  {
    src: "/images/watercolor-1.jpg",
    step: "The Vision",
    caption: "Identifying your unique vision.",
  },
  {
    src: "/images/blueprint.jpg",
    step: "The Plan",
    caption: "Meticulous attention to detail and masterful planning.",
  },
  {
    src: "/images/siobhan-measuring.jpg",
    step: "The Build",
    caption: "Daily monitoring of the site, in person.",
  },
  {
    src: "/images/greatroom.jpg",
    step: "The Home",
    caption: "Completed with unmatched craftsmanship and care.",
  },
];

const PILLARS = [
  {
    numeral: "01",
    name: "Vision",
    copy: "We work closely with clients to identify their unique vision — the what and the why — so the home reflects the life it will hold.",
  },
  {
    numeral: "02",
    name: "Priorities",
    copy: "Understanding priorities enables us to redirect the build for cost-efficiency or time-constraints, without compromising the outcome.",
  },
  {
    numeral: "03",
    name: "Budget",
    copy: "We operate with transparency to gain trust — no hidden agenda, no hidden fees, and full record keeping of costs accrued throughout the project.",
  },
];

const VOICES = ["Owner", "Architect", "Designer", "Engineer", "Vendors", "City Officials"];

export default function ProcessView() {
  return (
    <>
      <PageHero
        label="The Process"
        lines={["Creative, simple solutions", "to complicated problems."]}
        intro={`${site.copy.processIntro} ${site.copy.processBuilders}`}
      />

      {/* ————— from watercolor to welcome home ————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-6 text-navy">The Journey of a Home</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display max-w-3xl text-4xl text-umber md:text-6xl"
            lines={["From concept", "to completion."]}
          />
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            {JOURNEY.map((stage, i) => (
              <div key={stage.step}>
                <ImageReveal
                  src={stage.src}
                  alt={stage.caption}
                  className="img-hover aspect-[4/5] w-full"
                  delay={i * 0.08}
                />
                <FadeUp delay={i * 0.08 + 0.1}>
                  <div className="mt-5 flex items-baseline gap-4">
                    <span className="display text-2xl text-sand">{`0${i + 1}`}</span>
                    <div>
                      <p className="label text-umber">{stage.step}</p>
                      <p className="serif-body mt-2 text-[16px] italic leading-snug text-umber/70">
                        {stage.caption}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————— the big three ————— */}
      <section className="grain relative bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-6 text-navy">The Big Three</p>
          </FadeUp>
          <FadeUp delay={0.06}>
            <p className="serif-body balance max-w-3xl text-[1.6rem] leading-[1.42] text-umber md:text-[2.1rem]">
              {site.copy.bigThree}
            </p>
          </FadeUp>
          <div className="mt-16 grid gap-0 overflow-hidden md:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <FadeUp
                key={pillar.name}
                delay={i * 0.1}
                className={`border-umber/12 py-10 md:px-10 md:py-6 ${
                  i > 0 ? "border-t md:border-l md:border-t-0" : ""
                } ${i === 0 ? "md:pl-0" : ""}`}
              >
                <span className="display text-6xl text-sand md:text-7xl">{pillar.numeral}</span>
                <h3 className="display mt-5 text-3xl text-umber">{pillar.name}</h3>
                <p className="mt-5 max-w-sm text-[15.5px] font-light leading-relaxed text-umber/75">
                  {pillar.copy}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ————— the funnel — one centered instrument ————— */}
      <section className="bg-espresso text-bone">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-6 text-clay">One Point of Contact</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display balance text-[1.85rem] text-bone sm:text-4xl md:text-5xl"
            lines={["Seamless communication", "across the project."]}
          />
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-2xl text-[17px] font-light leading-relaxed text-bone/75">
              {site.copy.funnel}
            </p>
          </FadeUp>

          {/* the correspondence, converging on the door */}
          <FadeUp delay={0.14}>
            <div className="relative mx-auto mt-14 flex max-w-lg flex-col items-center">
              <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {VOICES.map((voice, i) => (
                  <FadeUp key={voice} delay={0.18 + i * 0.06} className="h-full">
                    <p className="flex h-full min-h-[52px] items-center justify-center whitespace-nowrap border border-bone/20 px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-bone/75">
                      {voice}
                    </p>
                  </FadeUp>
                ))}
              </div>
              <div className="my-7 h-14 w-px bg-gradient-to-b from-bone/10 via-bone/50 to-bone/10" />
              <img src="/images/logo.png" alt="Bluedoor" className="h-24 w-24" />
              <div className="my-7 h-14 w-px bg-gradient-to-b from-bone/10 via-bone/50 to-bone/10" />
              <p className="serif-body text-2xl italic text-bone">You</p>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="serif-body mt-10 max-w-xl text-lg italic leading-relaxed text-bone/80">
              {site.copy.communication}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ————— supervision — the words, then the site itself ————— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 pb-14 pt-20 md:px-10 md:pb-16 md:pt-32">
          <FadeUp>
            <p className="label mb-6 text-navy">{site.copy.supervisionLabel}</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display text-[1.85rem] text-umber sm:text-4xl md:text-5xl"
            lines={["We do not leave", "projects unsupervised."]}
          />
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-3xl text-[16.5px] font-light leading-relaxed text-umber/80">
              {site.copy.supervision}
            </p>
          </FadeUp>
        </div>
        <div className="relative overflow-hidden">
          <Parallax amount={60} className="absolute inset-0">
            <img
              src="/images/siobhan-site.jpg"
              alt="Siobhan Zerilla directing work on the site stairs"
              loading="lazy"
              className="h-[120%] w-full -translate-y-[8%] object-cover object-[center_35%]"
            />
          </Parallax>
          <div className="relative min-h-[62vh] md:min-h-[80vh]" />
        </div>
      </section>

      {/* ————— the hand-off ————— */}
      <section className="bg-linen">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-6 text-navy">The Hand-Off</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display balance text-[1.8rem] text-umber sm:text-4xl md:text-5xl"
            lines={["A seamless transition,", "and a guidebook to match."]}
          />
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-2xl text-[16.5px] font-light leading-relaxed text-umber/80">
              {site.copy.handOff}
            </p>
          </FadeUp>
          <FadeUp delay={0.16}>
            <div className="mt-14 w-[280px] rotate-[-1.5deg] border border-umber/10 bg-white p-3.5 pb-12 shadow-[0_30px_65px_-30px_rgba(53,48,42,0.5)] transition-transform duration-700 ease-out hover:rotate-0 md:w-[420px]">
              <img
                src="/images/watercolor-5.jpg"
                alt="Watercolor of a completed Bluedoor residence — the cover of its guidebook"
                loading="lazy"
                className="h-auto w-full"
              />
              <p className="serif-body mt-4 text-center text-[15px] italic text-taupe">
                Your home, recorded — cover to&nbsp;cover.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.22}>
            <Link
              href="/build-with-bluedoor"
              className="label mt-14 inline-block border border-navy px-9 py-4 text-navy transition-colors duration-500 hover:bg-navy hover:text-bone"
            >
              Begin the Conversation
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
