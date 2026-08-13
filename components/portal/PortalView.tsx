"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { EASE } from "@/components/motion";

const FIELD =
  "w-full border-0 border-b border-umber/25 bg-transparent px-0 py-2.5 font-light text-umber outline-none transition-colors placeholder:text-umber/35 focus:border-navy";

/**
 * The client's own door, after hours: a navy field carrying the door's
 * paneling, and a key in the form of an engraved bone card. Access is by
 * invitation — arriving here should feel like being handed the key.
 */
export default function PortalView() {
  const [sent, setSent] = useState(false);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-navy px-5 py-24">
      {/* the door's paneling, at rest behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-[4%] border border-bone/10" />
        <div className="absolute inset-x-[9%] inset-y-[10%] border border-bone/[0.07]" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* the medallion, resting on the card's top edge */}
        <img
          src="/images/logo.png"
          alt="Bluedoor Building"
          className="absolute left-1/2 top-0 z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_1px_rgba(251,249,244,0.4),0_18px_50px_rgba(0,0,0,0.35)]"
        />
        <div className="grain relative border border-bone/20 bg-bone px-7 pb-9 pt-16 text-center shadow-[0_50px_110px_-45px_rgba(0,0,0,0.6)] sm:px-10">
          <p className="label text-navy">Client Portal</p>
          <h1 className="display mt-4 text-4xl text-umber">Welcome home.</h1>
          <p className="serif-body mt-4 text-[17px] italic leading-relaxed text-umber/70">
            Your project, its progress, and its papers — kept in one
            private&nbsp;place.
          </p>

          <div className="mt-9 text-left">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="border border-navy/25 bg-linen px-6 py-8 text-center"
                >
                  <p className="display text-2xl text-umber">Thank you.</p>
                  <p className="serif-body mt-3 text-[16px] italic leading-relaxed text-umber/75">
                    If these details match an active project, a secure link is
                    on its way to your&nbsp;inbox.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <label className="block">
                    <span className="label text-taupe">Email</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className={FIELD}
                    />
                  </label>
                  <label className="mt-6 block">
                    <span className="label text-taupe">Access Code</span>
                    <input
                      required
                      type="password"
                      name="code"
                      autoComplete="current-password"
                      className={FIELD}
                    />
                  </label>
                  <button
                    type="submit"
                    className="label mt-8 w-full bg-navy px-8 py-4 text-bone transition-colors duration-500 hover:bg-navy-deep"
                  >
                    Enter the Portal
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 border-t border-umber/15 pt-6">
            <p className="serif-body text-[15px] italic leading-relaxed text-umber/65">
              Access is by invitation — your project team sends your&nbsp;key.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <Link
                href="/build-with-bluedoor"
                className="label border-b border-navy/40 pb-0.5 text-navy transition-colors hover:border-navy"
              >
                Build with Bluedoor
              </Link>
              <Link
                href="/"
                className="label border-b border-transparent pb-0.5 text-umber/60 transition-colors hover:text-umber"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
