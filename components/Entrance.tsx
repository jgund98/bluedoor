"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "./motion";

const KEY = "bd-entered";

/**
 * The arrival moment: the Bluedoor mark hangs on a navy field, then the
 * circle itself becomes the aperture — the site opens through the blue door.
 * Runs once per session; reduced-motion visitors get a quiet fade.
 */
export default function Entrance() {
  const [state, setState] = useState<"pending" | "playing" | "done">("pending");
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) {
        setState("done");
        return;
      }
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private browsing — just play */
    }
    setState("playing");
  }, []);

  if (state === "done") return null;

  const playing = state === "playing";

  if (reduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-navy"
        initial={{ opacity: 1 }}
        animate={playing ? { opacity: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
        onAnimationComplete={() => setState("done")}
        style={{ pointerEvents: "none" }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "none" }}>
      {/* navy field with a punched circular hole, GPU-scaled open */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        initial={{ scale: 1 }}
        animate={playing ? { scale: 34 } : {}}
        transition={{ duration: 1.25, delay: 0.75, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => setState("done")}
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <path
            d="M -4000 -4000 H 4000 V 4000 H -4000 Z M 50 50 m -4.1 0 a 4.1 4.1 0 1 0 8.2 0 a 4.1 4.1 0 1 0 -8.2 0 Z"
            fill="#224b82"
            fillRule="evenodd"
          />
        </svg>
      </motion.div>
      {/* the mark itself, resting exactly over the aperture */}
      <motion.img
        src="/images/logo.png"
        alt=""
        className="absolute left-1/2 top-1/2 w-[152px] max-w-[38vw] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={
          playing
            ? { opacity: [0, 1, 1, 0], scale: [0.94, 1, 1, 1.7] }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: 2.0,
          times: [0, 0.22, 0.42, 0.8],
          ease: EASE,
        }}
      />
    </div>
  );
}
