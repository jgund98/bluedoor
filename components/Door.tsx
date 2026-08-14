"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";

type Turn = MotionValue<number> | number;

/* ------------------------------------------------------------------ *
 * A painted, panelled, arched double door.
 *
 * The arch belongs to the opening, not to the leaves. Two plain leaves
 * are clipped by one true arch, so the curve is continuous across the
 * pair and the meeting stiles close cleanly. Building the arch out of
 * two rounded leaves gives you a peak in the middle and a wedge of
 * daylight at the seam.
 *
 * Light falls from the upper left across the whole pair — each leaf
 * carries its share of one continuous ramp, so the seam does not show
 * as a change in the paint.
 * ------------------------------------------------------------------ */

/** A mitred bevel around a raised panel. Light upper-left, shadow lower-right. */
const BEVEL = {
  // px, not %: border-width does not take percentages, and CSS quietly
  // drops the declaration and falls back to `medium` if you try.
  borderWidth: 6,
  borderStyle: "solid",
  borderTopColor: "rgba(255,255,255,0.24)",
  borderLeftColor: "rgba(255,255,255,0.15)",
  borderRightColor: "rgba(0,0,0,0.26)",
  borderBottomColor: "rgba(0,0,0,0.34)",
} as const;

const FIELD =
  "linear-gradient(158deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 46%, rgba(0,0,0,0.055) 100%)";

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
  const inner = isLeft ? "right" : "left";

  return (
    <motion.div
      className={`absolute inset-y-0 ${isLeft ? "left-0" : "right-0"}`}
      style={{
        width,
        rotateY: turn,
        transformOrigin: `${pivot} center`,
        transformStyle: "preserve-3d",
        backgroundColor: "#224b82",
        // each leaf takes its half of one continuous fall of light
        backgroundImage: isLeft
          ? "linear-gradient(104deg, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0.055) 100%), linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.12) 100%)"
          : "linear-gradient(104deg, rgba(255,255,255,0.045) 0%, rgba(0,0,0,0.20) 100%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.14) 100%)",
        boxShadow: isLeft
          ? "inset -1px 0 0 rgba(9,20,38,0.62)"
          : "inset 1px 0 0 rgba(255,255,255,0.09)",
      }}
    >
      {/* the tooth of brushed paint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, rgba(0,0,0,0) 1px 3px)",
        }}
      />

      {/* upper raised panel — its head follows the arch overhead */}
      <div
        className={`absolute top-[6%] h-[46%] ${
          isLeft ? "left-[16%] right-[9%]" : "left-[9%] right-[16%]"
        }`}
        style={{
          borderTopLeftRadius: isLeft ? "92% 30%" : "6px",
          borderTopRightRadius: isLeft ? "6px" : "92% 30%",
          ...BEVEL,
          backgroundImage: FIELD,
        }}
      />

      {/* lower raised panel */}
      <div
        className={`absolute bottom-[7%] top-[58%] ${
          isLeft ? "left-[16%] right-[9%]" : "left-[9%] right-[16%]"
        }`}
        style={{ ...BEVEL, backgroundImage: FIELD }}
      />

      {/* the lock rail catches a line of light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[53.5%] h-px"
        style={{ background: "rgba(255,255,255,0.09)" }}
      />

      {/* a long pull in unlacquered brass, and the shadow it throws */}
      <div
        className={`absolute top-[37%] h-[26%] w-[2.2%] rounded-full ${
          inner === "right" ? "right-[6.5%]" : "left-[6.5%]"
        }`}
        style={{
          background:
            "linear-gradient(100deg, #7d6231 0%, #c9a961 26%, #f2e0b4 46%, #b1904f 68%, #6b5228 100%)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.45)",
        }}
      />
    </motion.div>
  );
}

/**
 * The opening the leaves hang in: one true arch, clipping the pair, with
 * the shadow of the reveal around its head and the medallion at its crown.
 * No casing — the door stands in the wall, not in a white picture frame.
 */
export function DoorCase({
  medallion = 44,
  children,
}: {
  medallion?: number;
  children?: React.ReactNode;
}) {
  return (
    <>
      {/* the ground shadow */}
      <div className="pointer-events-none absolute -bottom-4 left-1/2 h-7 w-[112%] -translate-x-1/2 rounded-[50%] bg-umber/25 blur-lg" />

      <div
        className="portal absolute inset-0 overflow-hidden"
        style={{ boxShadow: "0 26px 60px -28px rgba(20,41,74,0.5)" }}
      >
        {children}
        {/* the reveal: the wall throws a shadow onto the head and jambs */}
        <div
          className="portal pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              "inset 0 7px 16px rgba(9,20,38,0.34), inset 7px 0 14px rgba(9,20,38,0.2), inset -7px 0 14px rgba(9,20,38,0.2)",
          }}
        />
        {/* and a hairline where the paint meets the plaster */}
        <div
          className="portal pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1px rgba(9,20,38,0.22)" }}
        />
      </div>

      {medallion > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
          style={{ top: -(medallion * 0.62) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt=""
            className="rounded-full"
            style={{
              width: medallion,
              boxShadow: "0 3px 10px rgba(20,41,74,0.35)",
            }}
          />
        </div>
      )}
    </>
  );
}
