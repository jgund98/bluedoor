"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";

type Turn = MotionValue<number> | number;

/* ------------------------------------------------------------------ *
 * A painted, panelled, arched double door — built the way a door is
 * built. Stiles and rails frame raised panels; every panel carries a
 * mitred bevel that takes the light from the upper left and throws a
 * shadow to the lower right. Without those bevels the thing reads as a
 * blue rectangle with lines on it.
 * ------------------------------------------------------------------ */

/** A mitred bevel around a raised panel. Light upper-left, shadow lower-right. */
const BEVEL = {
  // px, not %: border-width does not take percentages, and CSS quietly
  // drops the declaration and falls back to `medium` if you try.
  borderWidth: 6,
  borderStyle: "solid",
  borderTopColor: "rgba(255,255,255,0.26)",
  borderLeftColor: "rgba(255,255,255,0.17)",
  borderRightColor: "rgba(0,0,0,0.28)",
  borderBottomColor: "rgba(0,0,0,0.36)",
} as const;

/** The field of a raised panel stands a little proud of the frame. */
const FIELD =
  "linear-gradient(158deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 46%, rgba(0,0,0,0.06) 100%)";

export function DoorLeaf({
  side,
  turn,
  width = "50%",
  hinge,
}: {
  side: "left" | "right";
  turn: Turn;
  /** Leaf width relative to the opening. 50% = a closed pair. */
  width?: string;
  /** Which edge the leaf pivots on. Defaults to its own outer edge. */
  hinge?: "left" | "right";
}) {
  const isLeft = side === "left";
  const pivot = hinge ?? (isLeft ? "left" : "right");
  const arch = isLeft
    ? { borderTopLeftRadius: "100% 32%" }
    : { borderTopRightRadius: "100% 32%" };
  const archInner = isLeft
    ? { borderTopLeftRadius: "100% 30%" }
    : { borderTopRightRadius: "100% 30%" };

  // the meeting stile is the inner edge; the hanging stile the outer
  const inner = isLeft ? "right" : "left";

  return (
    <motion.div
      className={`absolute inset-y-0 ${isLeft ? "left-0" : "right-0"}`}
      style={{
        width,
        rotateY: turn,
        transformOrigin: `${pivot} center`,
        transformStyle: "preserve-3d",
        ...arch,
        // the paint, and the light lying across it
        backgroundColor: "#224b82",
        backgroundImage:
          "linear-gradient(112deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 30%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0.24) 100%), linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.14) 100%)",
        boxShadow: isLeft
          ? "inset -1px 0 0 rgba(9,20,38,0.6), inset 1px 0 0 rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.16)"
          : "inset 1px 0 0 rgba(9,20,38,0.35), inset -1px 0 0 rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.16)",
      }}
    >
      {/* the tooth of brushed paint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          ...arch,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, rgba(0,0,0,0) 1px 3px)",
        }}
      />

      {/* upper raised panel, following the arch */}
      <div
        className={`absolute top-[5.5%] h-[47%] ${
          isLeft ? "left-[15%] right-[8%]" : "left-[8%] right-[15%]"
        }`}
        style={{
          ...archInner,
          ...BEVEL,
          backgroundImage: FIELD,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      />

      {/* lower raised panel */}
      <div
        className={`absolute bottom-[6.5%] top-[58.5%] ${
          isLeft ? "left-[15%] right-[8%]" : "left-[8%] right-[15%]"
        }`}
        style={{
          ...BEVEL,
          backgroundImage: FIELD,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      />

      {/* the lock rail, caught by the light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[53.5%] h-px"
        style={{ background: "rgba(255,255,255,0.10)" }}
      />

      {/* a long pull in unlacquered brass, standing off the meeting stile */}
      <div
        className={`absolute top-[37%] h-[26%] w-[2.4%] rounded-full ${
          inner === "right" ? "right-[6.5%]" : "left-[6.5%]"
        }`}
        style={{
          background:
            "linear-gradient(100deg, #7d6231 0%, #c9a961 26%, #f2e0b4 46%, #b1904f 68%, #6b5228 100%)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.45)",
        }}
      />
      {/* and the shadow it throws on the paint */}
      <div
        className={`absolute top-[37%] h-[26%] w-[2.4%] rounded-full blur-[2px] ${
          inner === "right" ? "right-[5.4%]" : "left-[5.4%]"
        }`}
        style={{ background: "rgba(9,20,38,0.32)", zIndex: -1 }}
      />
    </motion.div>
  );
}

/** The bone casing, keystone medallion and threshold that surround an opening. */
export function DoorCase({ medallion = 44 }: { medallion?: number }) {
  const showMark = medallion > 0;
  return (
    <>
      {/* the reveal — the door sits inside the opening, not on top of it */}
      <div
        className="portal pointer-events-none absolute inset-0 z-10"
        style={{
          boxShadow:
            "inset 0 3px 8px rgba(9,20,38,0.5), inset 3px 0 7px rgba(9,20,38,0.32), inset -3px 0 7px rgba(9,20,38,0.32)",
        }}
      />
      {/* the casing, with its own light and shade */}
      <div
        className="portal pointer-events-none absolute -inset-[10px] border-[9px] shadow-[0_34px_84px_-34px_rgba(20,41,74,0.55)]"
        style={{ borderColor: "#fdfcfa", borderTopColor: "#ffffff", borderBottomColor: "#eee9e0" }}
      />
      <div className="portal pointer-events-none absolute -inset-[2px] border border-navy/22" />
      {/* the threshold, and the shadow the door throws onto it */}
      <div className="pointer-events-none absolute -bottom-[10px] left-1/2 h-[9px] w-[calc(100%+34px)] -translate-x-1/2 rounded-[2px] bg-porcelain shadow-[inset_0_2px_3px_rgba(9,20,38,0.28)]" />
      {showMark && (
        <div
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
          style={{ top: -(medallion * 0.72) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt=""
            className="rounded-full ring-[3px] ring-porcelain"
            style={{ width: medallion }}
          />
        </div>
      )}
    </>
  );
}
