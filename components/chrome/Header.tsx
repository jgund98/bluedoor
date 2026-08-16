"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { nav, site } from "@/lib/site";

const EASE = [0.76, 0, 0.24, 1] as const;

/** Routes whose masthead is a full-bleed photograph under a bone lintel. */
const PHOTO_MASTHEADS = ["/portfolio", "/portfolio/"];

/** Routes where the chrome sits directly on the photograph before scroll —
 *  the type goes porcelain with a soft settle, and returns to ink once the
 *  sheet arrives. */
const PHOTO_CHROME = ["/"];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  // the portal is a navy room — the chrome inverts to bone there
  const path = usePathname() ?? "/";
  const onDark = path.startsWith("/portal");
  const onPhoto = PHOTO_MASTHEADS.includes(path);
  const light = PHOTO_CHROME.includes(path) && !scrolled;

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

  // The portal is a room of its own — no chrome on the way in.
  if (onDark) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent transition-[height] duration-700">
        {/* the sheet the chrome rides on */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            onDark ? "vellum-chrome-dark" : "vellum-chrome"
          } ${scrolled ? "opacity-100" : "opacity-0"}`}
        />
        {/* Over a full-bleed photograph the chrome would vanish into the
            picture. Rather than a scrim, the nav gets its own bone lintel —
            the photograph begins beneath it, the way a view begins beneath
            a door head. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-full bg-porcelain transition-opacity duration-700 ${
            onPhoto && !scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{ boxShadow: "0 1px 0 rgba(34,75,130,0.16)" }}
        />
        <div
          className={`relative mx-auto flex max-w-[1560px] items-center px-5 transition-all duration-700 lg:px-12 ${
            scrolled ? "h-[64px]" : "h-[116px] lg:h-[138px]"
          }`}
        >
          {/* center — the doorplate, with the nav split symmetrically around it */}
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <nav className="pointer-events-auto hidden w-[320px] items-center justify-end gap-10 lg:flex">
              {nav.left.map((n) => (
                <NavLink key={n.href} {...n} onDark={onDark} light={light} />
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
                <NavLink key={n.href} {...n} onDark={onDark} light={light} />
              ))}
            </nav>
          </div>

          {/* far right — the ask on a desk, the way in on a phone */}
          {/* Over the hero the mark stands between two nav groups and nothing
              else, so it is balanced by what is around it rather than merely
              centred in the window — an "Inquire" alone at the far right, with
              four hundred empty pixels facing it, pulls the whole masthead
              over. The hero makes that invitation itself, and better. Once the
              hero is behind you the header takes the job back. */}
          <Link
            href="/build-with-bluedoor/"
            aria-hidden={light}
            tabIndex={light ? -1 : undefined}
            className={`label z-10 ml-auto hidden transition-all duration-700 lg:block ${
              light
                ? "pointer-events-none translate-x-1 opacity-0"
                : "text-navy opacity-100 hover:opacity-60"
            }`}
          >
            Inquire
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open the index"
            className="z-10 ml-auto flex h-6 w-[26px] flex-col justify-center gap-[6px] lg:hidden"
            style={light ? { filter: "drop-shadow(0 1px 3px rgba(14,29,52,0.55))" } : undefined}
          >
            <span className={`block h-px w-full ${light ? "bg-porcelain" : "bg-navy/70"}`} />
            <span className={`block h-px w-full ${light ? "bg-porcelain" : "bg-navy/70"}`} />
            <span className={`ml-auto block h-px w-2/3 ${light ? "bg-porcelain" : "bg-navy/70"}`} />
          </button>
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

function NavLink({
  label,
  href,
  onDark,
  light,
}: {
  label: string;
  href: string;
  onDark?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`label group relative transition-colors duration-500 ${
        light
          ? "hero-ink font-semibold text-porcelain"
          : onDark
            ? "text-porcelain/65 hover:text-porcelain"
            : "text-ink/62 hover:text-navy"
      }`}
    >
      {label}
      {/* a rule drawn under the word, from the left, the width of the word —
          the only thing that happens on hover, and it happens slowly */}
      <span
        className={`pointer-events-none absolute -bottom-[7px] left-0 h-px w-full origin-left scale-x-0 transition-transform duration-[650ms] ease-out group-hover:scale-x-100 ${
          light ? "bg-porcelain/70" : onDark ? "bg-porcelain/50" : "bg-navy/45"
        }`}
      />
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
          className="mb-9 w-[94px] rounded-full ring-1 ring-porcelain/25 lg:mb-12 lg:w-[108px]"
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
