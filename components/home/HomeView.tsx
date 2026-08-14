"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { FadeUp, Lines, Parallax } from "@/components/motion";
import { SectionMark, HandOff } from "@/components/SectionMark";
import { useWarmImages } from "@/components/useWarmImages";
import DoorReveal from "./DoorReveal";
import HeroDoors from "./HeroDoors";
import ReelsGallery from "./ReelsGallery";

// text anchors rotate so no two service plates compose alike
const SERVICE_ANCHOR = [
  "items-end justify-start",
  "items-end justify-end",
  "items-end justify-start",
] as const;

// pre-warm the showpieces once the page is idle, so no reveal ever
// starts before its photograph is in the cache
const WARM = [
  "/images/aerial-oceanfront.jpg",
  "/images/estate-bougainvillea.jpg",
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

export default function HomeView() {
  useWarmImages(WARM, 1200);
  return (
    <>
      {/* ————————————————— HERO — the site loads as the blue door ————————————————— */}
      <HeroDoors />

      {/* ————————————————— I · COMMITMENT ————————————————— */}
      {/* The chapter opening, set on the page's centre line. Left-aligned it
          left the right half of a wide screen empty and the band read lopsided;
          centred, it also puts the statement, the thread below it and the mark
          that opens the next section all on one axis. */}
      <section className="grain relative bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 pb-16 pt-24 text-center md:px-10 md:pb-20 md:pt-40">
          <FadeUp>
            <SectionMark
              numeral="I"
              label={site.copy.commitmentLabel}
              className="mb-10 justify-center"
            />
          </FadeUp>
          <FadeUp delay={0.08}>
            <p className="serif-body balance mx-auto max-w-4xl text-[1.7rem] leading-[1.45] text-umber md:text-[2.5rem]">
              {site.copy.commitment}
            </p>
          </FadeUp>
          <FadeUp delay={0.16}>
            <div className="mt-12 flex items-center justify-center gap-6">
              <div className="rule w-16 md:w-24" />
              <p className="label text-taupe">Palm Beach&ensp;·&ensp;Est. by Siobhan Zerilla</p>
              <div className="rule w-16 md:w-24" />
            </div>
          </FadeUp>
        </div>

        {/* The thread out of the statement and into the work. It lands on the
            mark at the top of the next section, so the two bands read as one
            continuous move rather than two stacked blocks. */}
        <div className="mx-auto max-w-[1520px] px-5 pb-14 md:px-10 md:pb-16">
          <HandOff align="center">The standard, in three disciplines.</HandOff>
        </div>
      </section>

      {/* ————————————————— II · SERVICES — full-bleed plates ————————————————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 pb-16 pt-14 md:px-10 md:pb-24 md:pt-16">
          {/* where the thread lands */}
          <FadeUp className="mb-16 md:mb-24">
            <div className="flex items-center gap-8">
              <div className="rule flex-1" />
              <img src="/images/logo.png" alt="" className="h-10 w-10 opacity-80" />
              <div className="rule flex-1" />
            </div>
          </FadeUp>
          <FadeUp>
            <SectionMark numeral="II" label="Our Services" className="mb-6" />
          </FadeUp>
          <Lines
            as="h2"
            className="display max-w-3xl text-[2rem] text-umber sm:text-4xl md:text-6xl"
            lines={["Elevating your vision", "with our expertise."]}
          />
        </div>

        {/* three full-height plates — the work carries the screen, the words sit on it */}
        {site.services.map((service, i) => (
          <div key={service.slug} className="relative overflow-hidden">
            <Parallax amount={70} className="absolute inset-0">
              <img
                src={service.image}
                alt={service.name}
                loading="lazy"
                className="h-[120%] w-full -translate-y-[8%] object-cover"
              />
            </Parallax>
            {/* the veil: exposure falls only where the words live */}
            <div className={`absolute inset-0 ${i === 1 ? "veil-br" : "veil-bl"}`} />
            <div
              className={`relative mx-auto flex min-h-[88vh] max-w-[1520px] px-5 pb-14 pt-24 md:min-h-[92vh] md:px-10 md:pb-20 ${SERVICE_ANCHOR[i]}`}
            >
              <div className={`max-w-xl ${i === 1 ? "md:flex md:flex-col md:items-end" : ""}`}>
                <FadeUp>
                  <p className="display on-photo text-2xl text-bone/70">{`0${i + 1}`}</p>
                </FadeUp>
                <Lines
                  as="h3"
                  className="display on-photo mt-4 text-[2.1rem] text-bone sm:text-4xl md:text-6xl"
                  lines={[service.name]}
                />
                <FadeUp delay={0.1}>
                  <p className="on-photo mt-6 max-w-lg text-[16.5px] font-light leading-relaxed text-bone/95">
                    {service.copy}
                  </p>
                </FadeUp>
                <FadeUp delay={0.16}>
                  <Link
                    href={`/portfolio#${service.slug}`}
                    className="on-photo mt-8 inline-block text-[11px] font-medium uppercase tracking-[0.34em] text-bone underline decoration-bone/40 underline-offset-8 transition-colors hover:decoration-bone"
                  >
                    See the Work
                  </Link>
                </FadeUp>
              </div>
            </div>
          </div>
        ))}

        {/* …and all three arrive at the same place, which is the next screen */}
        <div className="mx-auto max-w-[1520px] px-5 py-16 md:px-10 md:py-20">
          <HandOff align="center">And every one of them begins at the same door.</HandOff>
        </div>
      </section>

      {/* ————————————————— PLATE · THE BLUE DOOR ————————————————— */}
      <DoorReveal />

      {/* ————————————————— III · WHY / COLLABORATIONS ————————————————— */}
      <section className="relative overflow-hidden bg-espresso text-bone">
        {/* the stone loggia at dusk, graded to texture — atmosphere, not content */}
        <img
          src="/images/loggia-stone.jpg"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-espresso/30 to-espresso/85" />
        <div className="relative mx-auto max-w-[1520px] px-5 py-24 md:px-10 md:py-36">
          <FadeUp>
            <SectionMark numeral="III" label={site.copy.whyLabel} tone="light" className="mb-8" />
          </FadeUp>
          <Lines
            as="h2"
            className="display max-w-4xl text-[1.9rem] text-bone sm:text-4xl md:text-[3.8rem]"
            lines={["Uncompromising quality,", "unparalleled expertise."]}
          />
          <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-2 md:gap-20">
            <FadeUp delay={0.08}>
              <p className="max-w-xl text-[17px] font-light leading-relaxed text-bone/75">
                {site.copy.why}
              </p>
            </FadeUp>
            <FadeUp delay={0.14}>
              <p className="serif-body max-w-xl text-xl italic leading-relaxed text-bone/85">
                {site.copy.collaborations}
              </p>
            </FadeUp>
          </div>

          <div className="mt-24 md:mt-32">
            <FadeUp>
              <div className="flex items-center gap-6">
                <p className="label-wide text-clay">Collaborations</p>
                <div className="rule-light flex-1" />
              </div>
            </FadeUp>
            <div className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8">
              {(
                [
                  ["Architects", site.collaborators.architects],
                  ["Interior Designers", site.collaborators.interiors],
                  ["Landscape Architects", site.collaborators.landscape],
                ] as const
              ).map(([title, names], col) => (
                <FadeUp key={title} delay={col * 0.1}>
                  <p className="label mb-6 text-bone/50">{title}</p>
                  <ul className="flex flex-col gap-3.5">
                    {names.map((firm) => (
                      <li key={firm.name}>
                        <a
                          href={firm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="serif-body border-b border-transparent text-lg leading-snug text-bone/85 transition-colors duration-300 hover:border-bone/50 hover:text-bone"
                        >
                          {firm.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* the names above are the same ones the magazines credit below */}
          <div className="mt-24 md:mt-32">
            <HandOff align="center" tone="light">
              A standard recognized in the most respected design publications.
            </HandOff>
          </div>
        </div>
      </section>

      {/* ————————————————— IV · IN PRINT ————————————————— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 py-24 md:px-10 md:py-36">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <FadeUp>
                <SectionMark numeral="IV" label="In Print" className="mb-6" />
              </FadeUp>
              <Lines
                as="h2"
                className="display max-w-2xl text-[1.9rem] text-umber sm:text-4xl md:text-5xl"
                lines={["Recognized by the pages", "that define the craft."]}
              />
            </div>
            <FadeUp>
              <Link
                href="/media"
                className="label border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
              >
                All Publications
              </Link>
            </FadeUp>
          </div>
          {/* tearsheets at their true size — clippings on a shelf, never scaled up */}
          <div className="mt-20">
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
            <div className="rule mx-auto mt-14 max-w-3xl" />
          </div>

          {/* finished pages above; unfinished work below */}
          <div className="mt-16 md:mt-20">
            <HandOff align="center">And on site, the work continues daily.</HandOff>
          </div>
        </div>
      </section>

      {/* ————————————————— PLATE · ON INSTAGRAM ————————————————— */}
      <ReelsGallery />

      {/* ————————————————— V · THE PRINCIPAL — full-bleed ————————————————— */}
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
          <FadeUp>
            <SectionMark numeral="V" label="The Principal" tone="light" className="on-photo mb-6" />
          </FadeUp>
          <Lines
            as="h2"
            className="display on-photo text-[2.6rem] text-bone sm:text-5xl md:text-7xl"
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
