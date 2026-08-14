"use client";

import Link from "next/link";
import { FadeUp } from "@/components/motion";

/**
 * The namesake line over an open oceanfront room — a still, cinematic
 * plate. The doors themselves belong to the hero now; here the house
 * simply stands open.
 */
export default function DoorReveal() {
  return (
    <section className="relative overflow-hidden bg-espresso">
      <img
        src="/images/loggia-ocean.jpg"
        alt="An oceanfront living room opening onto the Atlantic"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="relative mx-auto flex min-h-[86vh] max-w-[1520px] flex-col items-center justify-end px-6 pb-[10vh] pt-32 text-center">
        <FadeUp>
          <div className="relative flex flex-col items-center">
            <div
              aria-hidden
              className="absolute -inset-x-40 -inset-y-14 bg-espresso/25 backdrop-blur-[7px]"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)",
                maskImage:
                  "radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)",
              }}
            />
            <div className="relative flex flex-col items-center">
              <p className="label-wide on-photo mb-5 text-bone">Bluedoor Building</p>
              <p className="display on-photo balance text-[2rem] text-bone sm:text-4xl md:text-6xl">
                Every home begins at the blue&nbsp;door.
              </p>
              <Link
                href="/portfolio"
                className="on-photo mt-9 text-[11px] font-medium uppercase tracking-[0.34em] text-bone underline decoration-bone/40 underline-offset-8 transition-colors hover:decoration-bone"
              >
                Explore the Portfolio
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
