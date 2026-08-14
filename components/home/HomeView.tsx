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
  "/images/detail-stone-column.jpg",
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

      {/* ————— the dedication page: a statement and a designed void ————— */}
      <section className="grain relative bg-bone">
        <div className="relative mx-auto min-h-[72vh] max-w-[1520px] px-5 pb-20 pt-24 md:min-h-[86vh] md:px-10 md:pt-40">
          <div className="max-w-xl">
            <p className={`${MICRO} text-taupe`}>Our Commitment</p>
            <p className="serif-body mt-8 text-[1.5rem] leading-[1.5] text-umber md:text-[1.9rem]">
              {site.copy.commitment}
            </p>
            <p className={`${MICRO} mt-10 text-taupe`}>
              Palm Beach&ensp;·&ensp;Est. by Siobhan Zerilla
            </p>
          </div>
          {/* across the void, one small window of stone */}
          <div className="mt-14 flex justify-end md:absolute md:bottom-0 md:right-[8%] md:mt-0">
            <div className="w-[62%] max-w-[240px] overflow-hidden rounded-tl-[110px] md:w-[240px]">
              <ImageReveal
                src="/images/detail-stone-column.jpg"
                alt="Coquina column detail in a Bluedoor garden"
                className="aspect-[3/4] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ————— the disciplines: three negative-space spreads ————— */}
      <section className="overflow-hidden bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 md:px-10">
          <p className={`${MICRO} text-taupe`}>Our Services</p>
          <Lines
            as="h2"
            className="display mt-6 max-w-3xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
            lines={["Elevating your vision", "with our expertise."]}
          />
        </div>

        {/* 01 — an inset frame with one arch-born corner; 40% of the page stays ivory */}
        <div className="relative mx-auto max-w-[1520px] px-5 pt-16 md:min-h-[94vh] md:px-10 md:pt-24">
          <div className="relative z-10 max-w-xs">
            <p className="display text-[5rem] leading-none text-sand md:text-[7rem]">01</p>
            <h3 className="display mt-2 text-[1.7rem] text-umber md:text-3xl">
              {site.services[0].name}
            </h3>
            <p className="mt-5 text-[15px] font-light leading-relaxed text-umber/80">
              {site.services[0].copy}
            </p>
            <Link href="/portfolio#luxury-residential" className={`${LINK_LIGHT} mt-7`}>
              See the Work
            </Link>
          </div>
          <div className="mt-10 flex justify-end md:absolute md:right-[6%] md:top-[26%] md:mt-0 md:block md:w-[56%]">
            <div className="w-[92%] overflow-hidden rounded-tl-[160px] md:w-full">
              <ImageReveal
                src={site.services[0].image}
                alt={site.services[0].name}
                className="aspect-[16/10] w-full"
              />
            </div>
          </div>
        </div>

        {/* 02 — a contained portrait; the void carries only its numeral */}
        <div className="relative mx-auto max-w-[1520px] px-5 pt-24 md:min-h-[108vh] md:px-10 md:pt-36">
          <p
            aria-hidden
            className="display pointer-events-none absolute right-[8%] top-[14%] hidden select-none text-[15rem] leading-none text-sand/70 md:block"
          >
            02
          </p>
          <div className="relative md:absolute md:left-[10%] md:top-[20%] md:w-[32%]">
            <div className="border border-umber/10 bg-white p-2.5">
              <ImageReveal
                src={site.services[1].image}
                alt={site.services[1].name}
                className="aspect-[3/4] w-full"
              />
            </div>
            <div className="absolute -bottom-10 -right-8 hidden w-40 border border-umber/10 bg-white p-2 md:block lg:w-48">
              <ImageReveal
                src="/images/watercolor-2.jpg"
                alt="Watercolor study of a historic residence"
                className="aspect-[3/4] w-full"
              />
            </div>
          </div>
          <div className="ml-auto mt-10 max-w-xs text-right md:absolute md:bottom-[14%] md:right-[8%] md:mt-0">
            <p className="display text-[5rem] leading-none text-sand md:hidden">02</p>
            <h3 className="display mt-2 text-[1.7rem] text-umber md:mt-0 md:text-3xl">
              {site.services[1].name}
            </h3>
            <p className="mt-5 text-[15px] font-light leading-relaxed text-umber/80">
              {site.services[1].copy}
            </p>
            <Link href="/portfolio#historic-renovation" className={`${LINK_LIGHT} mt-7`}>
              See the Work
            </Link>
          </div>
        </div>

        {/* 03 — the photograph escapes the page; the words keep a framed plane */}
        <div className="relative mx-auto max-w-[1520px] pb-24 pt-24 md:min-h-[92vh] md:pb-36 md:pt-32">
          <div className="ml-auto w-[88%] overflow-hidden rounded-bl-[140px] md:absolute md:right-0 md:top-[10%] md:h-[48vh] md:w-[58%]">
            <ImageReveal
              src={site.services[2].image}
              alt={site.services[2].name}
              className="aspect-[16/10] w-full md:h-full"
              imgClassName="md:h-full md:w-full md:object-cover"
            />
          </div>
          <div className="relative z-10 mx-5 -mt-8 border border-umber/15 bg-bone px-7 pb-14 pt-9 md:absolute md:bottom-[12%] md:left-[6%] md:mx-0 md:mt-0 md:w-[40%] md:px-12 md:pb-24 md:pt-12">
            <p className="display text-[5rem] leading-none text-sand md:text-[7rem]">03</p>
            <h3 className="display mt-2 text-[1.7rem] text-umber md:text-3xl">
              {site.services[2].name}
            </h3>
            <p className="mt-5 max-w-sm text-[15px] font-light leading-relaxed text-umber/80">
              {site.services[2].copy}
            </p>
            <Link href="/portfolio#quality-interiors" className={`${LINK_LIGHT} mt-7`}>
              See the Work
            </Link>
          </div>
        </div>
      </section>

      {/* ————— event: the blue doors ————— */}
      <DoorReveal />

      {/* ————— the company they keep: an asymmetric page on linen ————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 py-24 md:px-10 md:py-40">
          <div className="max-w-2xl">
            <p className={`${MICRO} text-taupe`}>{site.copy.whyLabel}</p>
            <Lines
              as="h2"
              className="display mt-6 text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
              lines={["Uncompromising quality,", "unparalleled expertise."]}
            />
          </div>
          <div className="mt-10 flex md:mt-24 md:justify-end">
            <p className="max-w-md text-[16px] font-light leading-relaxed text-umber/80">
              {site.copy.why}
            </p>
          </div>
          <div className="mt-10 md:mt-6">
            <p className="serif-body max-w-md text-xl italic leading-relaxed text-umber/85">
              {site.copy.collaborations}
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-0">
            <div className="md:col-span-3">
              <p className={`${MICRO} text-taupe`}>Collaborations</p>
            </div>
            <div className="grid gap-12 sm:grid-cols-3 sm:gap-8 md:col-span-9">
              {(
                [
                  ["Architects", site.collaborators.architects],
                  ["Interior Designers", site.collaborators.interiors],
                  ["Landscape Architects", site.collaborators.landscape],
                ] as const
              ).map(([title, names]) => (
                <div key={title}>
                  <p className={`${MICRO} mb-6 text-taupe/80`}>{title}</p>
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
