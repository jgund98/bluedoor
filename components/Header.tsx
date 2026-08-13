"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { EASE } from "./motion";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/process", label: "Process" },
  { href: "/culture", label: "Culture" },
  { href: "/media", label: "Publications" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // home opens on the navy doors — the header reads in bone until the first
  // scroll; every other page opens on bone and reads in umber
  const onDark = pathname === "/" && !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled && !open
            ? "border-b border-umber/10 bg-bone/92 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1520px] items-center justify-between px-5 md:h-[88px] md:px-10">
          <Link
            href="/"
            aria-label="Bluedoor Building — home"
            className="flex items-center gap-3.5"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src="/images/logo.png"
              alt="Bluedoor Building"
              className="h-12 w-12 md:h-14 md:w-14"
            />
            <span
              className={`label hidden tracking-[0.3em] transition-colors duration-500 sm:block ${
                onDark ? "text-bone" : "text-umber"
              }`}
            >
              Bluedoor&nbsp;Building
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`label relative pb-1 transition-colors duration-500 ${
                  onDark ? "text-bone/90 hover:text-bone" : "text-umber/80 hover:text-umber"
                }`}
              >
                {item.label}
                {pathname.startsWith(item.href) && (
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full ${
                      onDark ? "bg-bone/70" : "bg-navy/70"
                    }`}
                  />
                )}
              </Link>
            ))}
            <Link
              href="/build-with-bluedoor"
              className={`label border px-6 py-3 transition-all duration-500 ${
                onDark
                  ? "border-bone/80 bg-bone/10 text-bone backdrop-blur-sm hover:bg-bone hover:text-navy"
                  : "border-navy bg-navy text-bone hover:bg-navy-deep"
              }`}
            >
              Build with Bluedoor
            </Link>
          </nav>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="relative z-[70] flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span className="relative block h-3 w-7">
              <span
                className={`absolute left-0 top-0 h-px w-full transition-all duration-400 ${
                  open ? "top-1/2 rotate-45 bg-bone" : onDark ? "bg-bone" : "bg-umber"
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full transition-all duration-400 ${
                  open ? "bottom-auto top-1/2 -rotate-45 bg-bone" : onDark ? "bg-bone" : "bg-umber"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* full-screen menu — the doors close over the page */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-navy px-7 pb-10 pt-28"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <nav className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...NAV].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.7, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    className="display block py-2.5 text-[2.6rem] leading-none text-bone"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + 5 * 0.07, duration: 0.7, ease: EASE }}
              >
                <Link
                  href="/build-with-bluedoor"
                  className="serif-body mt-5 inline-block border border-bone/60 px-8 py-4 text-xl italic text-bone"
                >
                  Build with Bluedoor
                </Link>
              </motion.div>
            </nav>
            <motion.div
              className="flex items-end justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.7 }}
            >
              <p className="text-sm leading-relaxed text-bone/70">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state}
              </p>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="label text-bone/80"
              >
                Instagram
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
