import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Reveal } from "@/components/motion";
import Reels from "@/components/media/Reels";

export const metadata: Metadata = {
  title: "Press — Features and recognition",
  description:
    "Bluedoor Building in House Beautiful, Modern Luxury Palm Beach, Luxury Home Magazine and Tailormade — features, press mentions, and collaborative projects.",
};

export default function MediaPage() {
  return (
    <>
      {/* masthead */}
      <section className="bg-mist pb-16 pt-[132px] grain lg:pb-24 lg:pt-[184px]">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="grid grid-cols-1 items-end gap-9 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-navy/30" />
                  <span className="label text-navy/75">Press</span>
                </div>
                <h1 className="mt-7">
                  <span className="display block text-[clamp(32px,7.6vw,40px)] text-ink lg:text-[clamp(42px,3.4vw,60px)]">
                    The work, as
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(34px,8vw,42px)] text-navy lg:mt-1 lg:text-[clamp(44px,3.6vw,64px)]">
                    others have seen it.
                  </span>
                </h1>
              </Reveal>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.08}>
                <p className="prose-lux">{site.copy.publicationsIntro}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* the features */}
      <section className="bg-porcelain py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="flex flex-col gap-16 lg:gap-24">
            {site.publications.map((pub, i) => {
              const flip = i % 2 === 1;
              return (
                <Reveal key={pub.title}>
                  <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
                    <div
                      className={`flex justify-start lg:col-span-5 ${
                        flip ? "lg:order-2 lg:col-start-8 lg:justify-end" : ""
                      }`}
                    >
                      <a href={pub.url} target="_blank" rel="noreferrer" className="group block">
                        <div className="w-fit bg-porcelain p-[8px] shadow-[0_26px_54px_-34px_rgba(20,41,74,0.6)] ring-1 ring-navy/12 transition-all duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_44px_70px_-36px_rgba(20,41,74,0.6)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pub.image}
                            alt={pub.title}
                            loading="lazy"
                            className="h-[clamp(240px,26vw,400px)] w-auto"
                          />
                        </div>
                      </a>
                    </div>

                    <div className={`lg:col-span-6 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
                      <span className="label text-navy/75">{pub.name}</span>
                      <h2 className="display mt-5 text-[clamp(24px,5.8vw,30px)] leading-[1.14] text-ink lg:text-[clamp(28px,2.3vw,38px)]">
                        {pub.title}
                      </h2>
                      <p className="prose-lux mt-6 max-w-[470px]">{pub.blurb}</p>
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="quiet-link mt-8 inline-block text-navy"
                      >
                        Read the feature
                      </a>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Reels />
    </>
  );
}
