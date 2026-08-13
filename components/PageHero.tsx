"use client";

import { FadeUp, Lines } from "@/components/motion";

export default function PageHero({
  label,
  lines,
  intro,
}: {
  label: string;
  lines: string[];
  intro?: string;
}) {
  return (
    <header className="grain relative bg-bone">
      <div className="mx-auto max-w-[1520px] px-5 pb-16 pt-36 md:px-10 md:pb-24 md:pt-52">
        <FadeUp>
          <p className="label mb-7 text-navy">{label}</p>
        </FadeUp>
        <Lines
          as="h1"
          className="display balance max-w-4xl text-[2.05rem] leading-[1.08] text-umber sm:text-[2.6rem] sm:leading-[1.05] md:text-7xl"
          lines={lines}
        />
        {intro && (
          <FadeUp delay={0.15}>
            <p className="serif-body mt-10 max-w-3xl text-xl leading-[1.5] text-umber/85 md:text-[1.45rem]">
              {intro}
            </p>
          </FadeUp>
        )}
      </div>
    </header>
  );
}
