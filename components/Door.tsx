"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";

type Turn = MotionValue<number> | number;

/** One leaf of a painted, panelled, arched double door. */
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
  return (
    <motion.div
      className={`absolute inset-y-0 bg-navy ${isLeft ? "left-0" : "right-0"}`}
      style={{
        width,
        rotateY: turn,
        transformOrigin: `${pivot} center`,
        transformStyle: "preserve-3d",
        borderTopLeftRadius: isLeft ? "100% 32%" : undefined,
        borderTopRightRadius: isLeft ? undefined : "100% 32%",
        boxShadow: isLeft
          ? "inset -1px 0 0 rgba(14,29,52,0.55), inset 0 1px 0 rgba(255,255,255,0.10)"
          : "inset 1px 0 0 rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}
    >
      {/* the light falling across the paint */}
      <div
        className="absolute inset-0"
        style={{
          borderTopLeftRadius: isLeft ? "100% 32%" : undefined,
          borderTopRightRadius: isLeft ? undefined : "100% 32%",
          background: isLeft
            ? "linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.18) 100%)"
            : "linear-gradient(255deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      {/* the arched upper panel */}
      <div
        className={`absolute top-[6%] h-[47%] border border-porcelain/[0.14] ${
          isLeft ? "left-[16%] right-[9%]" : "left-[9%] right-[16%]"
        }`}
        style={{
          borderTopLeftRadius: isLeft ? "100% 34%" : "0",
          borderTopRightRadius: isLeft ? "0" : "100% 34%",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />

      {/* the lower panel */}
      <div
        className={`absolute bottom-[7%] top-[58%] border border-porcelain/[0.14] ${
          isLeft ? "left-[16%] right-[9%]" : "left-[9%] right-[16%]"
        }`}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />

      {/* the handle */}
      <div
        className={`absolute top-[53%] h-[10px] w-[10px] rounded-full bg-linen shadow-[0_1px_3px_rgba(0,0,0,0.45)] ${
          isLeft ? "right-[7%]" : "left-[7%]"
        }`}
      />
    </motion.div>
  );
}

/** The bone casing, keystone medallion and threshold that surround an opening. */
export function DoorCase({ medallion = 44 }: { medallion?: number }) {
  const showMark = medallion > 0;
  return (
    <>
      <div className="portal pointer-events-none absolute -inset-[10px] border-[9px] border-porcelain shadow-[0_34px_84px_-34px_rgba(20,41,74,0.55)]" />
      <div className="portal pointer-events-none absolute -inset-[2px] border border-navy/22" />
      <div className="pointer-events-none absolute -bottom-[10px] left-1/2 h-[9px] w-[calc(100%+34px)] -translate-x-1/2 rounded-[2px] bg-porcelain" />
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
