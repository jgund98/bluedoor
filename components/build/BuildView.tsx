"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { site } from "@/lib/site";
import { FadeUp, Lines, EASE } from "@/components/motion";

const FIELD =
  "w-full border-0 border-b border-umber/25 bg-transparent px-0 py-2.5 font-light text-umber outline-none transition-colors placeholder:text-umber/35 focus:border-navy";

/**
 * The most important funnel on the site, set like an engraved invitation:
 * a bone stationery page, the essentials above the fold, flanked by two
 * slim architectural pilasters — the doors a client walks toward.
 */
export default function BuildView() {
  const [sent, setSent] = useState(false);

  return (
    <section className="grain relative min-h-svh bg-bone">
      {/* pilasters — slim slices of the doors themselves */}
      <motion.div
        className="absolute bottom-0 left-0 top-0 hidden w-[13vw] max-w-[240px] overflow-hidden xl:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.3 }}
      >
        <img
          src="/images/door-arched.jpg"
          alt=""
          className="h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bone/25" />
      </motion.div>
      <motion.div
        className="absolute bottom-0 right-0 top-0 hidden w-[13vw] max-w-[240px] overflow-hidden xl:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.45 }}
      >
        <img
          src="/images/gate-pineapple.jpg"
          alt=""
          className="h-full w-full object-cover object-[38%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-bone/25" />
      </motion.div>

      {/* the invitation */}
      <div className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-5 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="text-center">
          <FadeUp>
            <img
              src="/images/logo.png"
              alt=""
              className="mx-auto h-14 w-14 md:h-16 md:w-16"
            />
          </FadeUp>
          <FadeUp delay={0.06}>
            <p className="label mt-6 text-navy">Build with Bluedoor</p>
          </FadeUp>
          <Lines
            as="h1"
            className="display balance mt-5 text-[2rem] leading-[1.08] text-umber sm:text-4xl md:text-5xl"
            lines={["Tell us about the home you see."]}
            delay={0.1}
          />
          <FadeUp delay={0.2}>
            <p className="serif-body mt-4 text-lg italic text-umber/70">
              Every project begins with a conversation — and every
              conversation stays&nbsp;private.
            </p>
          </FadeUp>
        </div>

        <div className="mt-10 md:mt-12">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="border border-navy/25 bg-linen px-8 py-12 text-center"
              >
                <p className="display text-3xl text-umber">Thank you.</p>
                <p className="serif-body mt-4 text-lg italic leading-relaxed text-umber/75">
                  Your inquiry has been received, and a member of our team will
                  be in touch&nbsp;shortly.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: EASE }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                  <FadeUp delay={0.24}>
                    <label className="block">
                      <span className="label text-taupe">First Name</span>
                      <input required name="firstName" autoComplete="given-name" className={FIELD} />
                    </label>
                  </FadeUp>
                  <FadeUp delay={0.28}>
                    <label className="block">
                      <span className="label text-taupe">Last Name</span>
                      <input required name="lastName" autoComplete="family-name" className={FIELD} />
                    </label>
                  </FadeUp>
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                  <FadeUp delay={0.32}>
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
                  </FadeUp>
                  <FadeUp delay={0.36}>
                    <label className="block">
                      <span className="label text-taupe">Message</span>
                      <input
                        required
                        name="message"
                        placeholder="The property, the vision, the timeline."
                        className={FIELD}
                      />
                    </label>
                  </FadeUp>
                </div>
                <FadeUp delay={0.4}>
                  <button
                    type="submit"
                    className="label mt-9 w-full bg-navy px-10 py-4.5 py-[18px] text-bone transition-colors duration-500 hover:bg-navy-deep"
                  >
                    Submit Inquiry
                  </button>
                </FadeUp>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* the baseboard — everything a caller needs, one engraved line at a time */}
        <FadeUp delay={0.45}>
          <div className="mt-10 border-t border-umber/15 pt-7 md:mt-12">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
              <div>
                <p className="label mb-2.5 text-taupe">Visit the Studio</p>
                <p className="text-[14.5px] font-light leading-relaxed text-umber/80">
                  {site.address.street}, {site.address.city}, {site.address.state}
                </p>
                <p className="serif-body mt-1 text-[15px] italic text-taupe">
                  Across from the Norton Museum of&nbsp;Art
                </p>
              </div>
              <div className="sm:text-right">
                <p className="label mb-2.5 text-taupe">Elsewhere</p>
                <div className="flex flex-col items-center gap-2 sm:items-end">
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label inline-block border-b border-navy/40 pb-0.5 text-navy transition-colors hover:border-navy"
                  >
                    {site.instagramHandle}
                  </a>
                  <Link
                    href="/portal"
                    className="label inline-block border-b border-navy/40 pb-0.5 text-navy transition-colors hover:border-navy"
                  >
                    Client Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
