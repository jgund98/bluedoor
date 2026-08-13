"use client";

import { site } from "@/lib/site";
import { FadeUp, Lines } from "@/components/motion";
import PageHero from "@/components/PageHero";
import { useWarmImages } from "@/components/useWarmImages";

const SHEET =
  "border border-umber/10 bg-white p-2 shadow-[0_30px_65px_-30px_rgba(53,48,42,0.55)]";

const WARM = [
  "/images/press-housebeautiful.jpg",
  "/images/press-builders.jpg",
  "/images/press-lhm.jpg",
  "/images/press-lhm2.jpg",
  "/images/press-tailormade.jpg",
  "/images/press-modernluxury.jpg",
];

export default function MediaView() {
  useWarmImages(WARM);
  const [hb, builders, modernLuxury, lhmCover] = site.publications;

  return (
    <>
      <PageHero
        label="Publications"
        lines={["Featured in the pages", "that define the craft."]}
        intro={site.copy.publicationsIntro}
      />

      {/* ————— House Beautiful ————— */}
      <section className="bg-linen">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-5 text-navy">{hb.name}</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display balance max-w-2xl text-3xl leading-tight text-umber md:text-5xl"
            lines={["The Color Issue —", "a house tour in print."]}
          />
          <FadeUp delay={0.12}>
            <p className="serif-body mt-7 max-w-xl text-lg italic leading-relaxed text-umber/75">
              {hb.blurb}
            </p>
          </FadeUp>
          <FadeUp delay={0.16} className="mt-12">
            <a href={hb.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div
                className={`${SHEET} w-[250px] transition-transform duration-700 ease-out group-hover:-translate-y-2 md:w-[320px] md:-rotate-[1.2deg] md:group-hover:rotate-0`}
              >
                <img
                  src={hb.image}
                  alt="House Beautiful — The Color Issue"
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            </a>
          </FadeUp>
          <FadeUp delay={0.2}>
            <a
              href={hb.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-10 inline-block border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
            >
              Read the Feature
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ————— Luxury Home Magazine — the collage, at true size ————— */}
      <section className="grain relative bg-bone">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-32">
          <FadeUp>
            <p className="label mb-5 text-navy">{builders.name}</p>
          </FadeUp>
          <Lines
            as="h2"
            className="display balance max-w-2xl text-3xl leading-tight text-umber md:text-5xl"
            lines={["Builders to know,", "cover to cover."]}
          />
          <FadeUp delay={0.12}>
            <p className="serif-body mt-7 max-w-xl text-lg italic leading-relaxed text-umber/75">
              {builders.blurb}
            </p>
          </FadeUp>
          <FadeUp delay={0.16} className="mt-12">
            <div className="relative w-fit pb-10 pr-10 md:pb-14 md:pr-16">
              <a href={builders.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div
                  className={`${SHEET} w-[260px] transition-transform duration-700 ease-out group-hover:-translate-y-2 md:w-[310px]`}
                >
                  <img
                    src={builders.image}
                    alt="Luxury Home Magazine — Builders to Know, Siobhan Zerilla"
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </div>
              </a>
              {/* the cover clipping, resting on the spread */}
              <a
                href={lhmCover.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group absolute bottom-0 right-0 block"
              >
                <div
                  className={`${SHEET} w-[150px] rotate-[4deg] transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[1.5deg] md:w-[185px]`}
                >
                  <img
                    src={lhmCover.image}
                    alt="Luxury Home Magazine — Coastal Collection cover"
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </div>
              </a>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mx-auto mt-8 max-w-xl text-[15.5px] font-light leading-relaxed text-umber/70">
              From the Builders to Know profile to the Coastal Collection cover,
              the Palm Beaches' own pages continue to celebrate the Bluedoor
              Building&nbsp;standard.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <a
              href={builders.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-8 inline-block border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
            >
              See the Issue
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ————— Modern Luxury — the Manalapan estate, told wide ————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <p className="label mb-5 text-navy">{modernLuxury.name}</p>
            </FadeUp>
            <Lines
              as="h2"
              className="display balance text-3xl leading-tight text-umber md:text-5xl"
              lines={["An extraordinary estate,", "Manalapan."]}
            />
            <FadeUp delay={0.12}>
              <p className="serif-body mt-7 text-lg italic leading-relaxed text-umber/75">
                {modernLuxury.blurb}
              </p>
            </FadeUp>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:gap-10">
            {[
              { img: "/images/press-tailormade.jpg", alt: "Modern Luxury — Sun, Stone, and Sea Shape a Manalapan Estate" },
              { img: "/images/press-modernluxury.jpg", alt: "Modern Luxury — Manalapan's premier oceanfront listing" },
            ].map((sheet, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <a
                  href={modernLuxury.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div
                    className={`${SHEET} transition-transform duration-700 ease-out group-hover:-translate-y-2 ${
                      i === 1 ? "md:ml-16" : "md:mr-16"
                    }`}
                  >
                    <img src={sheet.img} alt={sheet.alt} loading="lazy" className="h-auto w-full" />
                  </div>
                </a>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.15}>
            <div className="mt-12 text-center">
              <a
                href={modernLuxury.url}
                target="_blank"
                rel="noopener noreferrer"
                className="label inline-block border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
              >
                Read the Feature
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="bg-bone">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-28">
          <FadeUp>
            <img src="/images/logo.png" alt="" className="h-14 w-14 opacity-90" />
          </FadeUp>
          <FadeUp delay={0.08}>
            <p className="serif-body balance mt-8 max-w-2xl text-2xl italic leading-[1.45] text-umber md:text-3xl">
              The industry partners who continue to trust and celebrate the
              Bluedoor Building&nbsp;standard.
            </p>
          </FadeUp>
          <FadeUp delay={0.14}>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-10 inline-block border-b border-navy/40 pb-1.5 text-navy transition-colors hover:border-navy"
            >
              Follow the Work — {site.instagramHandle}
            </a>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
