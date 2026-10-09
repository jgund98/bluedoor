import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";

export const metadata: Metadata = {
  title: "Process — How a home is made",
  description:
    "Vision, priorities, and budget: how Bluedoor Building manages a luxury custom home from concept to completion, with daily site supervision and a full record of costs.",
};

const PILLARS = [
  {
    n: "I",
    name: "Vision",
    copy: "We start by understanding what you want the house to be — and why. The “what” and the “why” set every decision that follows.",
  },
  {
    n: "II",
    name: "Priorities",
    copy: "Knowing what matters most lets us redirect the build for cost-efficiency or time constraints without losing what the house is for.",
  },
  {
    n: "III",
    name: "Budget",
    copy: "We establish a number that aligns with the goals, then operate with transparency — no hidden agenda, no hidden fees, a full record of costs accrued.",
  },
];

export default function ProcessPage() {
  return (
    <>
      {/* masthead */}
      <section className="bg-porcelain pb-16 pt-[136px] grain lg:pb-24 lg:pt-[196px]">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <Reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-navy/30" />
                  <span className="label text-navy/75">The Process</span>
                </div>
                <h1 className="mt-7">
                  <span className="display block text-[clamp(32px,7.6vw,40px)] text-ink lg:text-[clamp(42px,3.4vw,60px)]">
                    How a home
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(34px,8vw,42px)] text-navy lg:mt-1 lg:text-[clamp(44px,3.6vw,64px)]">
                    is actually made.
                  </span>
                </h1>
                <p className="prose-lux mt-8 max-w-[520px]">{site.copy.processIntro}</p>
                <p className="prose-lux mt-5 max-w-[520px]">{site.copy.processBuilders}</p>

                <div className="mt-9 flex items-center gap-6">
                  <Link href="/build-with-bluedoor/" className="quiet-link shrink-0 text-navy">
                    Begin a conversation
                  </Link>
                  <span className="hair hidden h-px flex-1 lg:block" />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <RevealPlate className="portal aspect-[4/4.2] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/blueprint.jpg"
                  alt="Working drawings for a Bluedoor home"
                  style={{ objectPosition: "50% 42%" }}
                />
              </RevealPlate>
            </div>
          </div>
        </div>
      </section>

      {/* the three pillars */}
      <section className="bg-mist py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <Reveal>
            <p className="answer max-w-[860px] text-[21px] leading-[1.5] text-ink lg:text-[30px] lg:leading-[1.42]">
              {site.copy.bigThree}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-14">
            {PILLARS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className="h-full border-t border-navy/20 pt-7">
                  <div className="flex items-baseline gap-4">
                    <span className="display text-[22px] text-navy/40">{p.n}</span>
                    <span className="display text-[24px] text-ink lg:text-[28px]">{p.name}</span>
                  </div>
                  <p className="prose-lux mt-4 max-w-[380px] text-[16px] lg:text-[17px]">{p.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-14 grid grid-cols-1 gap-5 border-t border-navy/20 pt-8 lg:mt-20 lg:grid-cols-12 lg:gap-14 lg:pt-10">
              <span className="label text-navy/70 lg:col-span-3">In practice</span>
              <p className="prose-lux lg:col-span-8 lg:col-start-5">{site.copy.bigThreeDetail}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 01 — the funnel */}
      <section className="bg-porcelain py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Stage n="01" title="The builder as the funnel" />
              <Reveal delay={0.06}>
                <p className="prose-lux mt-7">{site.copy.funnel}</p>
                <p className="prose-lux mt-5">{site.copy.communication}</p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <RevealPlate className="portal-shallow aspect-[4/3] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/siobhan-drafting.jpg" alt="Reviewing drawings" loading="lazy" />
              </RevealPlate>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — supervision, as a chapter plate */}
      <section className="relative h-[86svh] min-h-[520px] w-full overflow-hidden plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/siobhan-site.jpg"
          alt="A stair under construction, mid-supervision"
          loading="lazy"
          style={{ objectPosition: "50% 52%" }}
        />
        <div className="veil-bl absolute inset-x-0 bottom-0 h-[68%]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1560px] px-5 pb-12 lg:px-12 lg:pb-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-14">
              <div className="lg:col-span-6">
                <span className="label on-photo text-ceramic">02 — {site.copy.supervisionLabel}</span>
                <h2 className="on-photo mt-5 text-porcelain">
                  <span className="display block text-[clamp(27px,6.4vw,34px)] lg:text-[clamp(34px,2.8vw,48px)]">
                    We do not leave
                  </span>
                  <span className="answer mt-0.5 block text-[clamp(29px,6.8vw,36px)] text-ceramic lg:mt-1 lg:text-[clamp(36px,3vw,52px)]">
                    projects unsupervised.
                  </span>
                </h2>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <p className="on-photo answer text-[16px] leading-[1.6] text-porcelain/90 lg:text-[17px]">
                  {site.copy.supervision}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — the hand-off */}
      <section className="bg-chalk py-16 grain lg:py-24">
        <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <RevealPlate className="portal aspect-[4/4.6] overflow-hidden plate ring-1 ring-navy/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/stairhall-2.jpg"
                  alt="A finished stair hall"
                  loading="lazy"
                  style={{ objectPosition: "50% 48%" }}
                />
              </RevealPlate>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Stage n="03" title="The hand-off" />
              <Reveal delay={0.06}>
                <p className="prose-lux mt-7">{site.copy.handOff}</p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="mt-9 flex items-center gap-6">
                  <Link href="/build-with-bluedoor/" className="quiet-link text-navy">
                    Begin a conversation
                  </Link>
                  <span className="hair hidden h-px flex-1 lg:block" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stage({ n, title }: { n: string; title: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span className="label text-navy/50">{n}</span>
        <span className="h-px w-10 bg-navy/25" />
      </div>
      <h2 className="display mt-5 text-[clamp(27px,6.4vw,34px)] text-ink lg:text-[clamp(32px,2.6vw,44px)]">
        {title}
      </h2>
    </Reveal>
  );
}
