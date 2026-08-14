"use client";

import { site, written } from "@/lib/site";

const ALL = [
  ...site.collaborators.architects,
  ...site.collaborators.interiors,
  ...site.collaborators.landscape,
];

export default function Collaborators() {
  const run = [...ALL, ...ALL];

  return (
    <section className="relative overflow-hidden bg-porcelain py-14 lg:py-16">
      <div className="mx-auto mb-9 flex max-w-[1560px] items-center gap-5 px-5 lg:mb-11 lg:px-12">
        <span className="label shrink-0 text-navy/70">{written.collabLabel}</span>
        <span className="hair h-px flex-1" />
        <p className="answer hidden max-w-[430px] text-[15px] leading-[1.5] text-ink/55 lg:block">
          {written.collabCopy}
        </p>
      </div>

      <div className="relative">
        <div className="drift flex w-max items-center gap-10 lg:gap-14">
          {run.map((c, i) => (
            <a
              key={`${c.name}-${i}`}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="display shrink-0 whitespace-nowrap text-[19px] text-ink/45 transition-colors duration-500 hover:text-navy lg:text-[24px]"
            >
              {c.name}
              <span className="ml-10 text-navy/25 lg:ml-14" aria-hidden>
                ◆
              </span>
            </a>
          ))}
        </div>

        {/* the run fades into the paper at both edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-porcelain to-transparent lg:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-porcelain to-transparent lg:w-40" />
      </div>
    </section>
  );
}
