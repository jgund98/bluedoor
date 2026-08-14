"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { nav, site } from "@/lib/site";

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  // the portal is a navy room — the chrome inverts to bone there
  const onDark = usePathname()?.startsWith("/portal") ?? false;

  // Two hairline segments that grow outward from the medallion as you read.
  const fill = useTransform(scrollYProgress, (v) => v);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", open);
    return () => document.documentElement.classList.remove("no-scroll");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,height] duration-700 ${
          scrolled ? (onDark ? "bg-ink/85 backdrop-blur-[10px]" : "bg-porcelain/88 backdrop-blur-[10px]") : "bg-transparent"
        }`}
      >
        <div
          className={`relative mx-auto flex max-w-[1560px] items-center px-5 transition-all duration-700 lg:px-12 ${
            scrolled ? "h-[64px]" : "h-[116px] lg:h-[138px]"
          }`}
        >
          {/* far left — the way in. On a phone it opens the door; on a desk it
              is where clients already under construction let themselves in. */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open the index"
            className={`label z-10 transition-colors duration-500 lg:hidden ${onDark ? "text-porcelain/65 hover:text-porcelain" : "text-ink/55 hover:text-navy"}`}
          >
            Index
          </button>
          <Link
            href="/portal/"
            className={`label z-10 hidden transition-colors duration-500 lg:block ${onDark ? "text-porcelain/65 hover:text-porcelain" : "text-ink/55 hover:text-navy"}`}
          >
            Client Login
          </Link>

          {/* centre — the doorplate, with the nav split symmetrically around it */}
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <nav className="pointer-events-auto hidden w-[320px] items-center justify-end gap-10 lg:flex">
              {nav.left.map((n) => (
                <NavLink key={n.href} {...n} onDark={onDark} />
              ))}
            </nav>

            <Link
              href="/"
              className="pointer-events-auto flex shrink-0 items-center lg:mx-10"
              aria-label="Bluedoor Building — home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt=""
                className={`transition-all duration-700 ${scrolled ? "w-[34px]" : "w-[78px] lg:w-[98px]"}`}
              />
            </Link>

            <nav className="pointer-events-auto hidden w-[320px] items-center justify-start gap-10 lg:flex">
              {nav.right.map((n) => (
                <NavLink key={n.href} {...n} onDark={onDark} />
              ))}
            </nav>
          </div>

          {/* far right — the ask */}
          <Link
            href="/build-with-bluedoor/"
            className={`label z-10 ml-auto transition-opacity duration-500 hover:opacity-60 ${onDark ? "text-ceramic" : "text-navy"}`}
          >
            Enquire
          </Link>
        </div>

        {/* the rule that breaks around the plate, and reads back your progress */}
        <div
          className={`relative h-px w-full transition-opacity duration-700 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            maskImage:
              "linear-gradient(90deg,#000 0,#000 calc(50% - 34px),transparent calc(50% - 34px),transparent calc(50% + 34px),#000 calc(50% + 34px))",
            WebkitMaskImage:
              "linear-gradient(90deg,#000 0,#000 calc(50% - 34px),transparent calc(50% - 34px),transparent calc(50% + 34px),#000 calc(50% + 34px))",
          }}
        >
          <div className="hair absolute inset-0" />
          <motion.div
            className="absolute left-0 top-0 h-px w-1/2 origin-right bg-delft"
            style={{ scaleX: fill }}
          />
          <motion.div
            className="absolute right-0 top-0 h-px w-1/2 origin-left bg-delft"
            style={{ scaleX: fill }}
          />
        </div>
      </header>

      <AnimatePresence>{open && <DoorIndex onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function NavLink({ label, href, onDark }: { label: string; href: string; onDark?: boolean }) {
  return (
    <Link
      href={href}
      className={`label transition-colors duration-500 ${onDark ? "text-porcelain/65 hover:text-porcelain" : "text-ink/62 hover:text-navy"}`}
    >
      {label}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * The index arrives as the blue door: two navy leaves close over the
 * page, the index is engraved on them, and they part again to let you
 * back through.
 * ------------------------------------------------------------------ */

function DoorIndex({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60]"
      initial="shut"
      animate="closed"
      exit="shut"
      variants={{}}
    >
      {/* left leaf */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-navy"
        variants={{ shut: { x: "-100%" }, closed: { x: 0 } }}
        transition={{ duration: 0.92, ease: EASE }}
      >
        <div className="pointer-events-none absolute inset-y-[13%] left-[14%] right-[7%] rounded-[3px] border border-porcelain/10" />
        <div className="pointer-events-none absolute inset-y-[19%] left-[20%] right-[13%] rounded-[3px] border border-porcelain/[0.07]" />
      </motion.div>

      {/* right leaf */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-navy"
        variants={{ shut: { x: "100%" }, closed: { x: 0 } }}
        transition={{ duration: 0.92, ease: EASE }}
      >
        <div className="pointer-events-none absolute inset-y-[13%] right-[14%] left-[7%] rounded-[3px] border border-porcelain/10" />
        <div className="pointer-events-none absolute inset-y-[19%] right-[20%] left-[13%] rounded-[3px] border border-porcelain/[0.07]" />
      </motion.div>

      {/* the seam */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-abyss/45"
        variants={{ shut: { opacity: 0 }, closed: { opacity: 1 } }}
        transition={{ duration: 0.4, delay: 0.62 }}
      />

      {/* engraved index */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        variants={{
          shut: { opacity: 0, transition: { duration: 0.22 } },
          closed: { opacity: 1, transition: { duration: 0.6, delay: 0.68 } },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          className="mb-9 w-[46px] rounded-full ring-1 ring-porcelain/25 lg:mb-12 lg:w-[54px]"
        />

        <nav className="w-full max-w-[520px]">
          {nav.full.map((n, i) => (
            <motion.div
              key={n.href}
              variants={{
                shut: { opacity: 0, y: 6 },
                closed: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.74 + i * 0.055 } },
              }}
            >
              <Link
                href={n.href}
                onClick={onClose}
                className="group flex items-baseline justify-between border-b border-porcelain/12 py-4 lg:py-[18px]"
              >
                <span className="display text-[26px] text-porcelain transition-opacity duration-500 group-hover:opacity-60 lg:text-[32px]">
                  {n.label}
                </span>
                <span className="answer hidden text-[15px] text-porcelain/45 lg:block">
                  {n.line}
                </span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 lg:mt-12"
          variants={{
            shut: { opacity: 0 },
            closed: { opacity: 1, transition: { duration: 0.6, delay: 1.15 } },
          }}
        >
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="label text-porcelain/45 transition-colors duration-500 hover:text-porcelain"
          >
            {site.instagramHandle}
          </a>
          <button onClick={onClose} className="quiet-link text-porcelain/70">
            Close
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
