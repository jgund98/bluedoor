"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { FadeUp, ImageReveal, Lines, Parallax } from "@/components/motion";
import { useWarmImages } from "@/components/useWarmImages";

const WARM = [
  "/images/siobhan-arch.jpg",
  "/images/siobhan-drafting.jpg",
  "/images/team-lisa.jpg",
  "/images/team-majic.jpg",
  "/images/watercolor-3.jpg",
];

export default function CultureView() {
  useWarmImages(WARM);
  return (
    <>
      {/* ————— the principal — a cover, not a split ————— */}
      <header className="grain relative bg-bone">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 pb-14 pt-36 text-center md:pb-20 md:pt-52">
          <FadeUp>
            <p className="label mb-7 text-navy">Culture&ensp;·&ensp;The Principal</p>
          </FadeUp>
          <Lines
            as="h1"
            className="display text-[3.4rem] leading-[1.0] text-umber md:text-[6.5rem]"
            lines={["Siobhan Zerilla"]}
          />
          <FadeUp delay={0.15}>
            <p className="serif-body balance mt-8 max-w-2xl text-xl italic leading-[1.5] text-umber/85 md:text-2xl">
              She started as a laborer, immersing herself in the fundamentals
              of the industry. Today, every Bluedoor project is completed with
              unmatched craftsmanship and&nbsp;care.
            </p>
          </FadeUp>
        </div>
      </header>

      {/* full-bleed cover image */}
      <section className="relative overflow-hidden bg-espresso">
        <Parallax amount={60} className="absolute inset-0">
          <img
            src="/images/siobhan-arch.jpg"
            alt="Siobhan Zerilla standing beneath a coquina arch on an active Bluedoor site"
            className="h-[120%] w-full -translate-y-[8%] object-cover object-[center_60%]"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-transparent to-transparent" />
        <div className="relative min-h-[62vh] md:min-h-[82vh]" />
        <p className="serif-body on-photo absolute bottom-7 left-5 text-[15px] italic text-bone/90 md:left-10">
          On site — beneath an arch her team raised
        </p>
      </section>

      {/* ————— her story, a measured column ————— */}
      <section className="bg-linen">
        <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-2xl">
            {[site.copy.siobhanBio1, site.copy.siobhanBio2].map((paragraph, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <p
                  className={`text-[17px] font-light leading-[1.8] text-umber/85 ${
                    i > 0 ? "mt-7" : ""
                  }`}
                >
                  {paragraph}
                </p>
              </FadeUp>
            ))}
          </div>

          {/* a figure inside the article, not a column beside it */}
          <div className="mx-auto mt-14 max-w-3xl md:mt-20">
            <ImageReveal
              src="/images/siobhan-drafting.jpg"
              alt="Siobhan at the drafting table, reviewing drawings"
              className="aspect-[16/10] w-full"
            />
            <p className="serif-body mt-4 text-center text-[15px] italic text-taupe">
              Every drawing reviewed personally, every detail resolved before it
              reaches the&nbsp;field.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-2xl md:mt-20">
            {[site.copy.siobhanBio3, site.copy.siobhanBio4].map((paragraph, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <p
                  className={`text-[17px] font-light leading-[1.8] text-umber/85 ${
                    i > 0 ? "mt-7" : ""
                  }`}
                >
                  {paragraph}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ————— her words ————— */}
      <section className="relative bg-navy text-bone">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-24 text-center md:px-10 md:py-36">
          <FadeUp>
            <img
              src="/images/logo.png"
              alt=""
              className="h-16 w-16 rounded-full shadow-[0_0_0_1px_rgba(247,243,235,0.45),0_10px_30px_rgba(0,0,0,0.25)]"
            />
          </FadeUp>
          <FadeUp delay={0.1}>
            <blockquote className="serif-body balance mt-10 max-w-4xl text-2xl italic leading-[1.5] text-bone md:text-[2.1rem]">
              “{site.principal.quote}”
            </blockquote>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p className="label mt-10 text-bone/70">— Siobhan</p>
          </FadeUp>
        </div>
      </section>

      {/* ————— the studio — deliberately quieter ————— */}
      <section className="bg-bone">
        <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-28">
          <FadeUp>
            <div className="flex items-center gap-6">
              <p className="label text-navy">The Studio</p>
              <div className="rule flex-1" />
            </div>
          </FadeUp>
          <FadeUp delay={0.06}>
            <p className="serif-body mt-8 max-w-2xl text-xl italic leading-relaxed text-umber/80">
              Behind Siobhan, a team that brings precision and expertise to
              every detail of the business — upholding Bluedoor's commitment to
              its highest standards of quality and&nbsp;integrity.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-10">
            {site.team.map((member, i) => (
              <FadeUp key={member.name} delay={i * 0.1}>
                <div className="grid grid-cols-[112px_1fr] items-start gap-6 md:grid-cols-[140px_1fr] md:gap-8">
                  <div className="img-frame aspect-square rounded-full">
                    <img src={member.photo} alt={member.name} loading="lazy" />
                  </div>
                  <div>
                    <h3 className="display text-2xl text-umber">{member.name}</h3>
                    <p className="label mt-2 text-taupe">{member.title}</p>
                    <p className="mt-5 text-[14.5px] font-light leading-[1.7] text-umber/70">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ————— from the studio wall ————— */}
      <section className="bg-linen">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:px-10 md:py-28">
          <FadeUp>
            <div className="w-[280px] rotate-[1.5deg] border border-umber/10 bg-white p-3.5 pb-12 shadow-[0_30px_65px_-30px_rgba(53,48,42,0.5)] transition-transform duration-700 ease-out hover:rotate-0 md:w-[420px]">
              <img
                src="/images/watercolor-3.jpg"
                alt="Watercolor of a Bluedoor residence, from the studio wall"
                loading="lazy"
                className="h-auto w-full"
              />
              <p className="serif-body mt-4 text-center text-[15px] italic text-taupe">
                From the studio wall — every home, painted before it is&nbsp;poured.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="serif-body balance mt-14 max-w-2xl text-2xl italic leading-[1.45] text-umber md:text-3xl">
              Precision, professionalism, and a collaborative approach — on
              every project, at every&nbsp;stage.
            </p>
          </FadeUp>
          <FadeUp delay={0.18}>
            <Link
              href="/process"
              className="label mt-10 inline-block border border-navy px-9 py-4 text-navy transition-colors duration-500 hover:bg-navy hover:text-bone"
            >
              See the Process
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
