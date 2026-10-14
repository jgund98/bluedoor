"use client";

/* Colour for the inquiry page, on a phone only.
 *
 * Desktop gets the sticky gate in the left column. On a phone that column is
 * hidden, so the page was type on chalk from the first pixel to the last:
 * eyebrow, headline, paragraph, form, three text blocks, a signature. Nothing
 * to look at, and nothing of hers.
 *
 * Two additions, both `lg:hidden`, both edge-to-edge so they read as printed
 * plates rather than boxed-in thumbnails:
 *
 *   Threshold — a door, opened, at the top of the page. It is the one image
 *     you see before you are asked for anything.
 *   Ribbon — her brightest work, swipeable, set after the form so it rewards
 *     the scroll without ever standing between someone and the ask.
 */

import { Reveal, RevealPlate } from "@/components/motion";

/** A door, held open, before the page asks for anything. */
export function Threshold() {
  return (
    <RevealPlate className="portal relative -mx-5 mb-11 h-[42svh] overflow-hidden plate lg:hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/entry-fanlight.jpg"
        alt="An entry stair rising to a fanlight door"
        // 10-14: the blue arched door already opens the phone hero
        style={{ objectPosition: "50% 58%" }}
      />
      {/* the chalk of the page, rising into the plate, so the eyebrow beneath
          it doesn't sit on a hard edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(to top, var(--color-chalk) 0%, color-mix(in srgb, var(--color-chalk) 70%, transparent) 40%, transparent 100%)",
        }}
      />
    </RevealPlate>
  );
}

// 10-14: five photographs seen nowhere else outside the portfolio (four of
// the old five repeated the hero).
const RIBBON = [
  { src: "/images/pool-court.jpg", label: "The pool court", pos: "50% 60%" },
  { src: "/images/dining-mural.jpg", label: "The dining room", pos: "50% 50%" },
  { src: "/images/garden-room.jpg", label: "The garden room", pos: "50% 50%" },
  { src: "/images/loggia-dining.jpg", label: "The loggia", pos: "50% 50%" },
  { src: "/images/wine-room.jpg", label: "The wine room", pos: "50% 50%" },
];

/** Her brightest work, swipeable, after the ask. */
export function Ribbon() {
  return (
    <Reveal delay={0.06} className="-mx-5 mt-14 lg:hidden">
      <div className="flex items-center gap-3 px-5">
        <span className="h-px w-7 bg-navy/30" />
        <span className="label text-navy/75">Lately</span>
      </div>

      <div
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {RIBBON.map((r) => (
          <figure key={r.src} className="w-[76vw] shrink-0 snap-start">
            <div className="h-[52vw] overflow-hidden plate ring-1 ring-navy/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.src} alt="" loading="lazy" style={{ objectPosition: r.pos }} />
            </div>
            <figcaption className="label mt-3 text-ink/40">{r.label}</figcaption>
          </figure>
        ))}
        {/* a hair of run-out so the last plate can sit clear of the edge */}
        <span aria-hidden className="w-1 shrink-0" />
      </div>
    </Reveal>
  );
}
