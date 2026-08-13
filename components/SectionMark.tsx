"use client";

// The two devices that turn a stack of bands into one document.
//
// A page reads as "templated" when every section opens the same way, says its
// piece, and stops — modules you could shuffle without breaking anything.
// These fix that at both ends of a section:
//
//   SectionMark — a running index (I, II, III…) in the same gutter position
//     every time, so a section is visibly a CHAPTER of something rather than
//     a self-contained block. Interludes (the door, the reels) deliberately
//     carry no numeral: chapters and plates should not look alike.
//
//   HandOff — the last line of a section, naming what follows, with a hairline
//     that drops out of the text toward the next band. Sections stop being
//     interchangeable the moment each one hands off to a specific successor.

import { FadeUp } from "@/components/motion";

type Tone = "dark" | "light";

export function SectionMark({
  numeral,
  label,
  tone = "dark",
  className,
}: {
  numeral: string;
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div className={`flex items-baseline gap-5 ${className ?? ""}`}>
      <span
        className={`display text-[1.35rem] leading-none ${light ? "text-bone/45" : "text-clay"}`}
      >
        {numeral}
      </span>
      <span
        aria-hidden
        className={`h-px w-8 translate-y-[-0.35em] ${light ? "bg-bone/25" : "bg-umber/20"}`}
      />
      <span className={`label ${light ? "text-clay" : "text-navy"}`}>{label}</span>
    </div>
  );
}

export function HandOff({
  children,
  tone = "dark",
  align = "left",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  align?: "left" | "center";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <FadeUp
      className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start"} ${
        className ?? ""
      }`}
    >
      <p
        className={`serif-body text-lg italic leading-snug ${
          light ? "text-bone/60" : "text-taupe"
        }`}
      >
        {children}
      </p>
      {/* the thread down to the next band */}
      <span
        aria-hidden
        className={`mt-6 block w-px ${light ? "bg-bone/25" : "bg-umber/20"}`}
        style={{ height: 64 }}
      />
    </FadeUp>
  );
}
