"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { FadeUp, ImageReveal, Lines, Parallax } from "@/components/motion";
import { useWarmImages } from "@/components/useWarmImages";
import DoorReveal from "./DoorReveal";
import HeroArch from "./HeroArch";
import ReelsGallery from "./ReelsGallery";

/**
 * IVORY IS THE CANVAS; ARCHITECTURE IS THE EVENT.
 * Informational content lives on warm ivory with disciplined, asymmetric
 * editorial composition. Full bleed is reserved for three deliberate
 * events: the hero's arch bloom, the blue doors, and the principal.
 */

// pre-warm the showpieces once the page is idle, so no reveal ever
// starts before its photograph is in the cache
const WARM = [
  "/images/aerial-oceanfront.jpg",
  "/images/estate-bougainvillea.jpg",
  "/images/watercolor-2.jpg",
  "/images/kitchen-marble.jpg",
  "/images/loggia-ocean.jpg",
  "/images/siobhan-arch.jpg",
  "/reels/arch-stairs-poster.jpg",
  "/reels/interior-ocean-poster.jpg",
  "/reels/coast-aerial-poster.jpg",
  "/reels/cabana-poster.jpg",
  "/reels/soso-progress-poster.jpg",
  "/reels/stone-facade-poster.jpg",
];

const MICRO = "text-[10px] font-medium uppercase tracking-[0.42em]";
const LINK_LIGHT =
  "inline-block text-[10.5px] font-medium uppercase tracking-[0.34em] text-navy underline decoration-navy/35 underline-offset-8 transition-colors hover:decoration-navy";

export default function HomeView() {
  useWarmImages(WARM, 1200);
  return (
    <>
      {/* ————— the signature: the arch blooms open ————— */}
      <HeroArch />

      {/* ————— the commitment, set like a dedication page ————— */}
      <section className="grain relative bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 pb-24 pt-24 md:px-10 md:pb-36 md:pt-40">
          <p className={`${MICRO} text-taupe`}>Our Commitment</p>
          <p className="serif-body mt-8 max-w-3xl text-[1.6rem] leading-[1.48] text-umber md:text-[2.2rem]">
            {site.copy.commitment}
          </p>
          <div className="mt-10 flex max-w-3xl justify-end">
            <p className={`${MICRO} text-taupe`}>
              Palm Beach&ensp;·&ensp;Est. by Siobhan Zerilla
            </p>
          </div>
        </div>
      </section>

      {/* ————— the disciplines: three spreads of one monograph ————— */}
      <section className="overflow-hidden bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 md:px-10">
          <p className={`${MICRO} text-taupe`}>Our Services</p>
          <Lines
            as="h2"
            className="display mt-6 max-w-3xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
            lines={["Elevating your vision", "with our expertise."]}
          />
        </div>

        {/* spread 01 — the image runs off the page */}
        <div className="mt-16 md:mt-24">
          <div className="mx-auto grid max-w-[1520px] items-end gap-10 px-0 md:grid-cols-12 md:gap-0 md:px-10">
            <div className="order-2 px-5 md:order-1 md:col-span-4 md:px-0 md:pb-6">
              <p className="display text-[5.5rem] leading-none text-sand md:text-[8rem]">01</p>
              <h3 className="display mt-2 text-[1.8rem] text-umber md:text-4xl">
                {site.services[0].name}
              </h3>
              <p className="mt-5 max-w-sm text-[15.5px] font-light leading-relaxed text-umber/80">
                {site.services[0].copy}
              </p>
              <Link href="/portfolio#luxury-residential" className={`${LINK_LIGHT} mt-7`}>
                See the Work
              </Link>
            </div>
            <div className="order-1 md:order-2 md:col-span-8">
              {/* bleeds past the grid to the right edge of the viewport */}
              <div className="md:-mr-[calc((100vw-min(100vw,1520px))/2+2.5rem)]">
                <ImageReveal
                  src={site.services[0].image}
                  alt={site.services[0].name}
                  className="aspect-[16/10] w-full md:aspect-[16/9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* spread 02 — matted photography floating in ivory */}
        <div className="mt-24 md:mt-40">
          <div className="mx-auto grid max-w-[1520px] gap-12 px-5 md:grid-cols-12 md:gap-0 md:px-10">
            <div className="relative md:col-span-6 md:col-start-2">
              <div className="border border-umber/10 bg-white p-2.5 md:mr-16">
                <ImageReveal
                  src={site.services[1].image}
                  alt={site.services[1].name}
                  className="aspect-[4/3] w-full"
                />
              </div>
              {/* a smaller study resting on the mat's corner */}
              <div className="absolute -bottom-10 right-0 hidden w-44 border border-umber/10 bg-white p-2 md:block lg:w-56">
                <ImageReveal
                  src="/images/watercolor-2.jpg"
                  alt="Watercolor study of a historic residence"
                  className="aspect-[3/4] w-full"
                />
              </div>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:pt-10 md:text-right">
              <p className="display text-[5.5rem] leading-none text-sand md:text-[8rem]">02</p>
              <h3 className="display mt-2 text-[1.8rem] text-umber md:text-4xl">
                {site.services[1].name}
              </h3>
              <p className="mt-5 text-[15.5px] font-light leading-relaxed text-umber/80 md:ml-auto md:max-w-sm">
                {site.services[1].copy}
              </p>
              <Link href="/portfolio#historic-renovation" className={`${LINK_LIGHT} mt-7`}>
                See the Work
              </Link>
            </div>
          </div>
        </div>

        {/* spread 03 — the release: one wide room, the name crossing its edge */}
        <div className="mt-24 pb-24 md:mt-44 md:pb-36">
          <div className="mx-auto max-w-[1520px] px-5 md:px-10">
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-5">
              <p className="display text-[5.5rem] leading-none text-sand md:text-[8rem]">03</p>
              <h3 className="display relative z-10 mb-5 text-[1.8rem] text-umber md:-mb-7 md:mb-0 md:text-4xl">
                {site.services[2].name}
              </h3>
            </div>
          </div>
          <ImageReveal
            src={site.services[2].image}
            alt={site.services[2].name}
            className="h-[46vh] w-full md:h-[68vh]"
          />
          <div className="mx-auto max-w-[1520px] px-5 md:px-10">
            <div className="mt-7 flex flex-col gap-5 md:ml-auto md:max-w-md md:text-right">
              <p className="text-[15.5px] font-light leading-relaxed text-umber/80">
                {site.services[2].copy}
              </p>
              <Link href="/portfolio#quality-interiors" className={`${LINK_LIGHT} md:self-end`}>
                See the Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ————— event: the blue doors ————— */}
      <DoorReveal />

      {/* ————— the company they keep, on calm linen ————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 py-24 md:px-10 md:py-36">
          <p className={`${MICRO} text-taupe`}>{site.copy.whyLabel}</p>
          <Lines
            as="h2"
            className="display mt-6 max-w-4xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
            lines={["Uncompromising quality,", "unparalleled expertise."]}
          />
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:gap-0">
            <p className="text-[16px] font-light leading-relaxed text-umber/80 md:col-span-5">
              {site.copy.why}
            </p>
            <p className="serif-body text-xl italic leading-relaxed text-umber/85 md:col-span-5 md:col-start-8">
              {site.copy.collaborations}
            </p>
          </div>

          <div className="rule mt-16 md:mt-20" />
          <div className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {(
              [
                ["Architects", site.collaborators.architects],
                ["Interior Designers", site.collaborators.interiors],
                ["Landscape Architects", site.collaborators.landscape],
              ] as const
            ).map(([title, names]) => (
              <div key={title}>
                <p className={`${MICRO} mb-6 text-taupe`}>{title}</p>
                <ul className="flex flex-col gap-3.5">
                  {names.map((firm) => (
                    <li key={firm.name}>
                      <a
                        href={firm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="serif-body border-b border-transparent text-lg leading-snug text-umber/85 transition-colors duration-300 hover:border-navy/40 hover:text-umber"
                      >
                        {firm.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————— in print: the clippings shelf ————— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 py-24 md:px-10 md:py-36">
          <div className="flex flex-wrap items-baseline justify-between gap-6">
            <div>
              <p className={`${MICRO} text-taupe`}>In Print</p>
              <h2 className="display mt-5 max-w-2xl text-[1.9rem] text-umber sm:text-4xl">
                Recognized by the pages that define the&nbsp;craft.
              </h2>
            </div>
            <Link href="/media" className={LINK_LIGHT}>
              All Publications
            </Link>
          </div>
          <div className="mt-16 md:mt-20">
            <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-12 md:gap-x-14">
              {(
                [
                  {
                    image: "/images/press-housebeautiful.jpg",
                    name: "House Beautiful",
                    note: "The Color Issue",
                    url: site.publications[0].url,
                    w: "w-[230px] md:w-[300px]",
                    tilt: "md:-rotate-[1.5deg]",
                  },
                  {
                    image: "/images/press-builders.jpg",
                    name: "Luxury Home Magazine",
                    note: "Builders to Know",
                    url: site.publications[1].url,
                    w: "w-[210px] md:w-[260px]",
                    tilt: "md:rotate-[1deg]",
                  },
                  {
                    image: "/images/press-lhm2.jpg",
                    name: "Luxury Home Magazine",
                    note: "The Bluedoor Standard",
                    url: site.publications[3].url,
                    w: "w-[210px] md:w-[260px]",
                    tilt: "md:-rotate-[2deg]",
                  },
                  {
                    image: "/images/press-lhm.jpg",
                    name: "Luxury Home Magazine",
                    note: "Coastal Collection",
                    url: site.publications[3].url,
                    w: "w-[170px] md:w-[200px]",
                    tilt: "md:rotate-[2.5deg]",
                  },
                ] as const
              ).map((sheet, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <a
                    href={sheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div
                      className={`${sheet.w} ${sheet.tilt} border border-umber/10 bg-white p-2 shadow-[0_24px_55px_-28px_rgba(53,48,42,0.55)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-0`}
                    >
                      <img
                        src={sheet.image}
                        alt={`${sheet.name} — ${sheet.note}`}
                        loading="lazy"
                        className="h-auto w-full"
                      />
                    </div>
                    <p className="label mt-5 text-center text-umber/70 transition-colors group-hover:text-navy">
                      {sheet.name}
                    </p>
                    <p className="serif-body mt-1 text-center text-[15px] italic text-taupe">
                      {sheet.note}
                    </p>
                  </a>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ————— the work in motion ————— */}
      <ReelsGallery />

      {/* ————— event: the principal ————— */}
      <section className="relative overflow-hidden bg-espresso">
        <Parallax amount={50} className="absolute inset-0">
          <img
            src="/images/siobhan-arch.jpg"
            alt="Siobhan Zerilla standing beneath a coquina arch mid-construction"
            loading="lazy"
            className="h-[115%] w-full -translate-y-[6%] object-cover object-[62%_52%]"
          />
        </Parallax>
        <div className="veil-bl absolute inset-0" />
        {/* the scene settles into the footer's midnight — no seam, no reset */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-[#141922]" />
        <div className="relative mx-auto flex min-h-[96vh] max-w-[1520px] flex-col justify-end px-5 pb-16 pt-28 md:px-10 md:pb-24">
          <p className={`${MICRO} on-photo text-bone/85`}>The Principal</p>
          <Lines
            as="h2"
            className="display on-photo mt-5 text-[2.6rem] text-bone sm:text-5xl md:text-7xl"
            lines={["Siobhan Zerilla"]}
          />
          <FadeUp delay={0.1}>
            <p className="serif-body on-photo mt-8 max-w-2xl text-xl italic leading-[1.5] text-bone/95 md:text-2xl">
              “{site.principal.quote}”
            </p>
          </FadeUp>
          <FadeUp delay={0.16}>
            <Link
              href="/culture"
              className="on-photo mt-10 inline-block w-fit text-[11px] font-medium uppercase tracking-[0.34em] text-bone underline decoration-bone/40 underline-offset-8 transition-colors hover:decoration-bone"
            >
              Meet Siobhan
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
