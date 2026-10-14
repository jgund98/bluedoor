"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";

type Turn = MotionValue<number> | number;

/* ------------------------------------------------------------------ *
 * A painted, panelled, arched double door, drawn to real geometry.
 *
 * Rebuilt 2026-10-14 from Siobhan's note: "The frame of the door should
 * all be symmetrical. This dimension should be the same at the corner.
 * You can kind of see how you're losing the profile... in the world of
 * construction that's a pretty big no-no."
 *
 * So everything here is laid out from one centre and one radius:
 *  - the opening is a TRUE semicircle (radius = half the width) on two
 *    straight jambs, sized in px so it never squashes into an ellipse;
 *  - the casing is a band of constant width concentric with the opening,
 *    so the profile holds through the spring line and over the head;
 *  - every stile and rail is the same width, and each upper panel's head
 *    is an arc concentric with the opening, so the margin between the
 *    edge of the door and the panel never thins at the shoulder;
 *  - the two leaves are exact mirror images.
 * Strokes, not box-shadows, draw the mouldings: a stroke is the same
 * width everywhere along its path, which is the whole point.
 * ------------------------------------------------------------------ */

export const DOOR_RATIO = 1.85; // height / width: 6 ft pair, 8 ft jambs, 3 ft head

export type DoorGeom = { W: number; H: number };

const geom = ({ W, H }: DoorGeom) => {
  const R = W / 2; // arch radius; centre of the arch at (R, R)
  const s = Math.max(8, W * 0.085); // stile = rail width, every side
  const m = Math.max(3, s * 0.32); // moulding band around each panel
  const lock = H * 0.57; // centre line of the lock rail
  return { R, s, m, lock };
};

/** y on the circle centred (R, R) with radius r, at x (top half). */
const arcY = (R: number, r: number, x: number) => R - Math.sqrt(Math.max(0, r * r - (x - R) * (x - R)));

/**
 * One panel in door coordinates, inset by d. `arched` panels take an arc
 * concentric with the opening for a head; the rest are rectangles.
 */
function panelPath(R: number, x0: number, x1: number, y1: number, d: number, arched: boolean, yTop = 0) {
  const a = x0 + d;
  const b = x1 - d;
  const bottom = y1 - d;
  if (!arched) {
    const top = yTop + d;
    return `M${a},${top} L${b},${top} L${b},${bottom} L${a},${bottom} Z`;
  }
  // Concentric with the opening: the panel's outer edge sits one stile in
  // from the jamb (x0 on the left leaf, 2R - x1 on the right), so its head
  // is the opening's arc shrunk by that stile plus the inset d.
  const rad = R - Math.min(x0, 2 * R - x1) - d;
  const ya = arcY(R, rad, a);
  const yb = arcY(R, rad, b);
  return `M${a},${ya} A${rad},${rad} 0 0 1 ${b},${yb} L${b},${bottom} L${a},${bottom} Z`;
}

export function DoorLeaf({
  side,
  turn,
  shade,
  g,
}: {
  side: "left" | "right";
  turn: Turn;
  /** How far the face has turned out of the light, 0–1. */
  shade?: MotionValue<number>;
  g: DoorGeom;
}) {
  const isLeft = side === "left";
  const { R, s, m, lock } = geom(g);
  const w = g.W / 2;
  // the leaf's span in door coordinates
  const X0 = isLeft ? 0 : w;
  const px0 = X0 + s; // panel inner edges: a stile in from each edge of the leaf
  const px1 = X0 + w - s;
  const upperBottom = lock - s / 2;
  const lowerTop = lock + s / 2;
  const lowerBottom = g.H - s;

  const panels = [
    { arched: true, y0: 0, y1: upperBottom },
    { arched: false, y0: lowerTop, y1: lowerBottom },
  ];

  // the pull sits on the meeting stile, the same distance from the seam on both leaves
  const pullW = Math.max(3, s * 0.26);
  const pullH = g.H * 0.2;
  const pullX = isLeft ? w - s / 2 - pullW / 2 : s / 2 - pullW / 2;

  return (
    <motion.div
      className={`absolute inset-y-0 ${isLeft ? "left-0" : "right-0"}`}
      style={{
        width: w,
        rotateY: turn,
        transformOrigin: `${isLeft ? "left" : "right"} center`,
        transformStyle: "preserve-3d",
        backgroundColor: "#224b82",
        // one continuous fall of light across the pair, from the upper left
        backgroundImage: isLeft
          ? "linear-gradient(104deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.12) 100%)"
          : "linear-gradient(104deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.16) 100%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.13) 100%)",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`${X0} 0 ${w} ${g.H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          {/* the bevel catches light top-left and falls to shadow bottom-right,
              the same on both leaves */}
          <linearGradient id={`bevel-${side}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={g.W} y2={g.H}>
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.26" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {panels.map((p, i) => {
          const edge = panelPath(R, px0, px1, p.y1, 0, p.arched, p.y0);
          const band = panelPath(R, px0, px1, p.y1, m / 2, p.arched, p.y0);
          const field = panelPath(R, px0, px1, p.y1, m, p.arched, p.y0);
          return (
            <g key={i}>
              {/* the recess the panel sits in */}
              <path d={edge} fill="rgba(9,20,38,0.16)" />
              {/* the moulding: one stroke, one width, all the way round */}
              <path d={band} fill="none" stroke={`url(#bevel-${side})`} strokeWidth={m} strokeLinejoin="miter" />
              {/* the raised field */}
              <path d={field} fill="rgba(255,255,255,0.035)" stroke="rgba(9,20,38,0.28)" strokeWidth={0.75} />
              <path d={edge} fill="none" stroke="rgba(9,20,38,0.32)" strokeWidth={0.75} />
            </g>
          );
        })}
        {/* the lock rail catches a line of light */}
        <line x1={X0} x2={X0 + w} y1={lock - s / 2} y2={lock - s / 2} stroke="rgba(255,255,255,0.1)" strokeWidth={0.75} />
      </svg>

      {/* a long pull in unlacquered brass */}
      <div
        className="absolute rounded-full"
        style={{
          left: pullX,
          top: lock - pullH * 0.62,
          width: pullW,
          height: pullH,
          background: "linear-gradient(100deg, #7d6231 0%, #c9a961 26%, #f2e0b4 46%, #b1904f 68%, #6b5228 100%)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.45)",
        }}
      />

      {/* the meeting edge: a fine astragal on the left leaf only */}
      {isLeft && <div className="absolute inset-y-0 right-0 w-px" style={{ background: "rgba(9,20,38,0.6)" }} />}

      {/* as the leaf swings into the room its face turns out of the light */}
      {shade && <motion.div className="pointer-events-none absolute inset-0 bg-abyss" style={{ opacity: shade }} />}
    </motion.div>
  );
}

/**
 * The opening and its casing. The leaves hang inside a true semicircular
 * head and are clipped by it, so the curve runs unbroken across the pair.
 * The casing is drawn as concentric strokes around that same centre, so
 * its width is identical on the jambs, through the spring line, and over
 * the crown.
 */
export function DoorCase({ g, children }: { g: DoorGeom; children?: React.ReactNode }) {
  const { R } = geom(g);
  const c = Math.max(10, g.W * 0.07); // casing width
  const o = c; // casing sits outside the opening by its own width
  const VW = g.W + 2 * o;
  const VH = g.H + o;
  // the casing's centre line, then its two edges, all around one centre
  const ring = (r: number) => {
    const cx = o + R;
    const cy = o + R;
    return `M${cx - r},${VH} L${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} L${cx + r},${VH}`;
  };

  return (
    <>
      {/* the ground shadow */}
      <div className="pointer-events-none absolute -bottom-4 left-1/2 h-7 w-[118%] -translate-x-1/2 rounded-[50%] bg-umber/25 blur-lg" />

      {/* the casing: plaster-white moulding of one constant width */}
      <svg
        className="pointer-events-none absolute"
        style={{ left: -o, top: -o, width: VW, height: VH, overflow: "visible" }}
        viewBox={`0 0 ${VW} ${VH}`}
        aria-hidden
      >
        <path d={ring(R + c / 2)} fill="none" stroke="#efe9de" strokeWidth={c} />
        {/* outer fillet, a bead a third of the way in, and the reveal edge */}
        <path d={ring(R + c - 0.5)} fill="none" stroke="rgba(91,83,70,0.38)" strokeWidth={1} />
        <path d={ring(R + c * 0.62)} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.2} />
        <path d={ring(R + c * 0.56)} fill="none" stroke="rgba(91,83,70,0.22)" strokeWidth={1} />
        <path d={ring(R + 0.5)} fill="none" stroke="rgba(9,20,38,0.35)" strokeWidth={1} />
      </svg>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: `${R}px ${R}px 0 0 / ${R}px ${R}px 0 0`,
          boxShadow: "0 26px 60px -28px rgba(20,41,74,0.5)",
        }}
      >
        {children}
        {/* the reveal: an even shadow all round the opening, no offset, so it
            reads the same depth on the jambs as over the head */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: `${R}px ${R}px 0 0 / ${R}px ${R}px 0 0`,
            boxShadow: "inset 0 0 12px rgba(9,20,38,0.32)",
          }}
        />
      </div>
    </>
  );
}
