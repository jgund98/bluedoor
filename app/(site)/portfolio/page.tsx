import type { Metadata } from "next";
import Link from "next/link";
import { gallery, site } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";

export const metadata: Metadata = {
  title: "Portfolio — Selected Work",
  description:
    "Selected work from Bluedoor Building: luxury custom homes, historic renovations, and finely detailed interiors across Palm Beach, West Palm Beach, and Manalapan.",
};

/** A hang, not a grid — the rhythm repeats every five plates. */
const SHAPE = [
  { span: "lg:col-span-5", ratio: "aspect-[3/4]", lift: "lg:mt-0" },
  { span: "lg:col-span-7", ratio: "aspect-[4/3]", lift: "lg:mt-24" },
  { span: "lg:col-span-7", ratio: "aspect-[16/10]", lift: "lg:mt-0" },
  { span: "lg:col-span-5", ratio: "aspect-[3/4]", lift: "lg:mt-20" },
  { span: "lg:col-span-12", ratio: "aspect-[21/9]", lift: "lg:mt-6" },
];

export default function PortfolioPage() {
  return (
    <>
      {/* masthead — the work speaks first */}
      <section className="relative h-[78svh] min-h-[520px] w-full overflow-hidden plate lg:h-[86svh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/greatroom.jpg"
          alt="A great room framed to the Atlantic"
          style={{ objectPosition: "50% 54%" }}
        />
        <div className="veil-bl absolute inset-x-0 bottom-0 h-[62%]" />
        <div className="absolute inset-0 flex items-end">
          <div className="px-5 pb-12 lg:px-12 lg:pb-14">
            <span className="label on-photo text-porcelain/75">Selected Work</span>
            <h1 className="on-photo mt-5 text-porcelain">
              <span className="display block text-[clamp(34px,8vw,42px)] lg:text-[clamp(46px,4vw,68px)]">
                Homes of lasting
              </span>
              <span className="answer mt-0.5 block text-[clamp(36px,8.4vw,44px)] lg:mt-1 lg:text-[clamp(48px,4.2vw,72px)]">
                beauty and distinction.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* her words about the work */}
      <section className="bg-porcelain py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="lg:ml-[38%] lg:max-w-[620px]">
            <Reveal>
              <p className="prose-lux">{site.copy.portfolioIntro}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* the hang */}
      <section className="bg-porcelain pb-24 lg:pb-32">
        <div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-10 px-5 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-4 lg:px-12">
          {gallery.map((g, i) => {
            const s = SHAPE[i % SHAPE.length];
            return (
              <div key={g.src} className={`${s.span} ${s.lift}`}>
                <RevealPlate>
                  <div className={`portal-shallow overflow-hidden plate ${s.ratio}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt={g.caption} loading="lazy" />
                  </div>
                  <p className="answer mt-4 text-[15px] leading-[1.4] text-ink/55">{g.caption}</p>
                </RevealPlate>
              </div>
            );
          })}
        </div>
      </section>

      {/* a way onward */}
      <section className="bg-mist py-20 lg:py-24">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-8 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          <Reveal className="max-w-[560px]">
            <h2>
              <span className="display block text-[clamp(28px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
                Every project begins
              </span>
              <span className="answer mt-0.5 block text-[clamp(30px,6.8vw,36px)] text-navy lg:mt-1 lg:text-[clamp(34px,2.8vw,48px)]">
                with a conversation.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Link href="/build-with-bluedoor/" className="quiet-link inline-block text-navy">
              Build with Bluedoor
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
