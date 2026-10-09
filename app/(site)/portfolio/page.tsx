import type { Metadata } from "next";
import Link from "next/link";
import { gallery, site, type Plate } from "@/lib/site";
import { Reveal, RevealPlate } from "@/components/motion";

export const metadata: Metadata = {
  title: "Portfolio — Selected Work",
  description:
    "Selected work from Bluedoor Building: luxury custom homes, historic renovations, and finely detailed interiors across Palm Beach, West Palm Beach, and Manalapan.",
};

/** A hang, not a grid — the rhythm repeats every five plates. */
/* The hang is built from the photographs, not imposed on them: a portrait
   only ever gets a portrait frame, a landscape a landscape frame, and a
   wide shot the full width at its own proportion. Nothing is cropped into
   a ceiling. Portraits alternate sides so the rhythm staggers. */
type Slot = { plate: Plate; span: string; ratio: string; lift: string };
function hang(plates: readonly Plate[]): Slot[][] {
  const left = [...plates];
  const rows: Slot[][] = [];
  let side = 0;
  while (left.length) {
    const a = left.shift()!;
    if (a.shape === "wide") {
      rows.push([{ plate: a, span: "lg:col-span-12", ratio: "aspect-[16/9]", lift: "lg:mt-6" }]);
      continue;
    }
    const want = a.shape === "portrait" ? "landscape" : "portrait";
    let j = left.findIndex((x) => x.shape === want);
    if (j < 0) j = left.findIndex((x) => x.shape !== "wide");
    if (j < 0) {
      rows.push([
        {
          plate: a,
          span: a.shape === "portrait" ? "lg:col-span-5 lg:col-start-4" : "lg:col-span-8 lg:col-start-3",
          ratio: a.shape === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]",
          lift: "lg:mt-6",
        },
      ]);
      continue;
    }
    const b = left.splice(j, 1)[0];
    const slot = (x: Plate, big: boolean): Slot => ({
      plate: x,
      span: big ? "lg:col-span-7" : "lg:col-span-5",
      ratio: x.shape === "portrait" ? "aspect-[4/5]" : big ? "aspect-[3/2]" : "aspect-[4/3]",
      lift: "",
    });
    // the portrait takes the narrow column; two landscapes split 7 and 5
    const pair =
      a.shape === "portrait" ? [slot(a, false), slot(b, true)] : b.shape === "portrait" ? [slot(b, false), slot(a, true)] : [slot(a, true), slot(b, false)];
    if (side % 2) pair.reverse();
    pair[1].lift = "lg:mt-20";
    rows.push(pair);
    side++;
  }
  return rows;
}


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
          {hang(gallery)
            .flat()
            .map((s) => (
              <div key={s.plate.src} className={`${s.span} ${s.lift}`}>
                <RevealPlate>
                  <div className={`portal-shallow overflow-hidden plate ${s.ratio}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.plate.src} alt={s.plate.caption} loading="lazy" style={s.plate.pos ? { objectPosition: s.plate.pos } : undefined} />
                  </div>
                  <p className="answer mt-4 text-[15px] leading-[1.4] text-ink/55">{s.plate.caption}</p>
                </RevealPlate>
              </div>
            ))}
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
