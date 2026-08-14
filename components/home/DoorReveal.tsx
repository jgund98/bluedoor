"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FadeUp } from "@/components/motion";

/**
 * The mid-page plate: an oceanfront room seen through a coquina arch that
 * blooms to full bleed as the visitor scrolls — the aperture language of
 * the site, without repeating the hero's doors. The composed scene holds
 * before the page moves on. Touch devices get the arch as a still plate.
 */
export default function DoorReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);
  const [vp, setVp] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const measure = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const sideRest = Math.max(vp.w * 0.3, (vp.w - 640) / 2);
  const topRest = vp.h * 0.16;
  const bottomRest = vp.h * 0.1;

  const clipPath = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.08) / 0.47));
    const e = 1 - Math.pow(1 - t, 3);
    const side = sideRest * (1 - e);
    const top = topRest * (1 - e);
    const bottom = bottomRest * (1 - e);
    const straighten = t >= 0.86 ? (t - 0.86) / 0.14 : 0;
    const radius = ((vp.w - side * 2) / 2) * (1 - straighten);
    return `inset(${top}px ${side}px ${bottom}px ${side}px round ${radius}px ${radius}px 0 0)`;
  });
  const imageScale = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.08) / 0.5));
    return 1.18 - 0.18 * (1 - Math.pow(1 - t, 2));
  });
  const plateLabelOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.06 ? 1 : v >= 0.2 ? 0 : 1 - (v - 0.06) / 0.14
  );
  const captionOpacity = useTransform(scrollYProgress, (v) =>
    v <= 0.52 ? 0 : v >= 0.66 ? 1 : (v - 0.52) / 0.14
  );
  const captionY = useTransform(scrollYProgress, (v) =>
    v <= 0.52 ? 26 : v >= 0.66 ? 0 : 26 * (1 - (v - 0.52) / 0.14)
  );
  const captionVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.48 ? "visible" : "hidden"
  );

  /* ————— touch + reduced motion: the arch as a still plate ————— */
  if (!isDesktop || reduce) {
    return (
      <section className="bg-linen">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-20 text-center md:py-28">
          {/* the arch blooms open once as it arrives — the desktop moment,
              in miniature, without touching the page's scroll */}
          <motion.div
            className="w-[86vw] max-w-[440px]"
            initial={reduce ? "open" : "closed"}
            whileInView="open"
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.div
              className="overflow-hidden rounded-t-full bg-sand/40"
              variants={{
                closed: { clipPath: "inset(18% 16% 0% 16% round 999px 999px 0 0)" },
                open: {
                  clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
                  transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <motion.img
                src="/images/loggia-ocean.jpg"
                alt="An oceanfront living room opening onto the Atlantic"
                loading="lazy"
                className="aspect-[9/12] w-full object-cover"
                variants={{
                  closed: { scale: 1.22 },
                  open: { scale: 1, transition: { duration: 1.9, ease: [0.22, 1, 0.36, 1] } },
                }}
              />
            </motion.div>
          </motion.div>
          <FadeUp delay={0.1}>
            <p className="display balance mt-10 max-w-md text-3xl text-umber">
              Every home begins at the blue&nbsp;door.
            </p>
          </FadeUp>
          <FadeUp delay={0.16}>
            <Link
              href="/portfolio"
              className="label mt-8 inline-block border border-navy px-8 py-4 text-navy transition-colors duration-500 hover:bg-navy hover:text-bone"
            >
              Explore the Portfolio
            </Link>
          </FadeUp>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[300vh] bg-linen">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the plate label, on linen, before the bloom */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex justify-center pt-24"
          style={{ opacity: plateLabelOpacity }}
        >
          <p className="label text-navy">The Blue Door</p>
        </motion.div>

        {/* the room, through the arch */}
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <motion.img
            src="/images/loggia-ocean.jpg"
            alt="An oceanfront living room opening onto the Atlantic"
            className="h-full w-full object-cover will-change-transform"
            style={{ scale: imageScale }}
            loading="lazy"
          />
        </motion.div>

        {/* the line that names the site */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-6 pb-[10vh] pt-32 text-center"
          style={{ opacity: captionOpacity, y: captionY, visibility: captionVisibility }}
        >
          {/* the image quiets only behind the words — the hero's veil, reused */}
          <div className="relative flex flex-col items-center">
            <div
              aria-hidden
              className="absolute -inset-x-40 -inset-y-14 bg-espresso/25 backdrop-blur-[7px]"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)',
                maskImage:
                  'radial-gradient(ellipse 68% 88% at center, black 30%, transparent 78%)',
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
        </motion.div>
      </div>
    </section>
  );
}
