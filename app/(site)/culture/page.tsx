import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";

export const metadata: Metadata = {
  title: "Culture — the studio behind every Bluedoor home",
  description:
    "The boutique studio behind Bluedoor Building, how it runs a project, and the firms it builds with.",
};

const DISCIPLINES = [
  { name: "Architecture", firms: site.collaborators.architects },
  { name: "Interiors", firms: site.collaborators.interiors },
  { name: "Landscape", firms: site.collaborators.landscape },
];

export default function CulturePage() {
  return (
    <>
      {/* masthead — her name, then her work */}
      <section className="bg-porcelain pb-16 pt-[132px] grain lg:pb-24 lg:pt-[184px]">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <Reveal>
            <span className="label text-navy/75">Culture</span>
            <h1 className="mt-4 lg:mt-3">
              {/* her words (10-14): "boutique by design instead of a small studio",
                  and keep "built from the ground up". No name label: her name
                  is in the first line of the bio, once. */}
              <span className="display block text-[clamp(34px,8vw,44px)] text-ink lg:text-[clamp(48px,4vw,70px)]">
                Boutique by design.
              </span>
              <span className="answer mt-0.5 block text-[clamp(36px,8.4vw,46px)] text-navy lg:mt-1 lg:text-[clamp(50px,4.2vw,74px)]">
                Built from the ground up.
              </span>
            </h1>
          </Reveal>

          <div className="hair mt-6 h-px w-full lg:mt-8" />

          <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
            {/* the opening paragraph carries the width; the portrait answers it */}
            <div className="lg:col-span-6">
              <Reveal>
                <p className="answer text-[21px] leading-[1.48] text-ink lg:text-[27px] lg:leading-[1.42]">
                  {site.copy.siobhanBio1}
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="prose-lux mt-7">{site.copy.siobhanBio2}</p>
              </Reveal>

              {/* The stair under construction, shown whole at its own 3:2 so
                  the site reads before the person in it. (10-14: the drafting
                  portrait is gone; these two site photos carry the spread.) */}
              <RevealPlate delay={0.06} className="mt-9 aspect-[3/2] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/siobhan-site.jpg"
                  alt="A stair hall under construction"
                  loading="lazy"
                  style={{ objectPosition: "50% 50%" }}
                />
              </RevealPlate>

              <Reveal delay={0.16}>
                <p className="prose-lux mt-8 text-[16px] leading-[1.7]">{site.copy.siobhanBio4}</p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              {/* a true portrait in the arch: measuring out on the slab */}
              <RevealPlate className="portal aspect-[3/4.42] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/siobhan-measuring.jpg"
                  alt="Measuring on site"
                  style={{ objectPosition: "40% 50%" }}
                />
              </RevealPlate>

              <Reveal delay={0.1}>
                <p className="prose-lux mt-7 text-[16px] leading-[1.7]">{site.copy.siobhanBio3}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* her quote, given room */}
      <section className="bg-navy py-16 lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <Reveal>
            <div className="max-w-[980px]">
              <span className="label text-ceramic/70">From the principal</span>
              <p className="answer mt-6 text-[23px] leading-[1.42] text-porcelain lg:text-[38px] lg:leading-[1.32]">
                “{site.principal.quote}”
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* the studio — deliberately quieter */}
      <section className="bg-chalk py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="flex items-center gap-5">
            <span className="label shrink-0 text-navy/75">How Bluedoor runs a project</span>
            <span className="hair h-px flex-1" />
          </div>

          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Reveal>
                <h2>
                  <span className="display block text-[clamp(27px,6.4vw,32px)] text-ink lg:text-[clamp(30px,2.4vw,40px)]">
                    Daily on the site,
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(29px,6.8vw,34px)] text-navy lg:mt-1 lg:text-[clamp(32px,2.6vw,44px)]">
                    backed by the office.
                  </span>
                </h2>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="mt-9 border-t border-navy/20 pt-7">
                  <span className="label block text-navy/70">{site.copy.supervisionLabel}</span>
                  <p className="prose-lux mt-4 text-[16px] lg:text-[17px]">
                    {site.copy.supervision}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.11}>
                <div className="mt-8 border-t border-navy/20 pt-7">
                  <span className="label block text-navy/70">{site.copy.officeLabel}</span>
                  <p className="prose-lux mt-4 text-[16px] lg:text-[17px]">{site.copy.office}</p>
                </div>
              </Reveal>

              <Reveal delay={0.14}>
                <div className="mt-8 border-t border-navy/20 pt-7">
                  <span className="label block text-navy/70">The hand-off</span>
                  <p className="prose-lux mt-4 text-[16px] lg:text-[17px]">{site.copy.handOff}</p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <RevealPlate className="portal aspect-[4/5] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/loggia-arcade.jpg"
                  alt="A loggia arcade, finished and handed over"
                  loading="lazy"
                  style={{ objectPosition: "50% 50%" }}
                />
              </RevealPlate>
              <Reveal delay={0.1}>
                <p className="answer mt-4 text-[15px] leading-[1.45] text-ink/50">
                  Loggia arcade, finished and handed over.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* The team section was removed 2026-10-14 at her request (the team has
          changed). It returns once she sends group photos; site.team holds the
          old entries and nothing renders them. */}

      {/* who we build with */}
      <section className="bg-porcelain py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          {/* The three discipline lists run longer than the heading beside
              them, and their length is the client's, not ours. Centring the
              heading against them splits the difference top and bottom
              instead of stranding it all under the heading. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-4">
              <Reveal>
                <h2>
                  <span className="display block text-[clamp(27px,6.4vw,32px)] text-ink lg:text-[clamp(30px,2.4vw,40px)]">
                    We keep close
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(29px,6.8vw,34px)] text-navy lg:mt-1 lg:text-[clamp(32px,2.6vw,44px)]">
                    company.
                  </span>
                </h2>
                <p className="prose-lux mt-7 max-w-[380px]">{site.copy.collaborations}</p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
              {DISCIPLINES.map((d, i) => (
                <Reveal key={d.name} delay={i * 0.07}>
                  <span className="label block text-navy/70">{d.name}</span>
                  <span className="hair mt-4 block h-px w-full" />
                  <ul className="mt-5 space-y-3">
                    {d.firms.map((f) => (
                      <li key={f.name}>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="answer text-[17px] leading-[1.4] text-ink/72 transition-colors duration-500 hover:text-navy"
                        >
                          {f.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* the commitment */}
      <section className="bg-mist py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="label text-navy/75">{site.copy.commitmentLabel}</span>
                <p className="answer mt-6 text-[20px] leading-[1.5] text-ink lg:text-[27px] lg:leading-[1.44]">
                  {site.copy.commitment}
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.08}>
                <p className="prose-lux">{site.copy.why}</p>
                <Link href="/build-with-bluedoor/" className="quiet-link mt-8 inline-block text-navy">
                  Build with Bluedoor
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
