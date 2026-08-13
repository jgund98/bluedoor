"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { site } from "@/lib/site";
import { FadeUp, Lines, EASE } from "@/components/motion";

const FIELD =
  "w-full border-0 border-b border-umber/25 bg-transparent px-0 py-3.5 font-light text-umber outline-none transition-colors placeholder:text-umber/35 focus:border-navy";

export default function BuildView() {
  const [sent, setSent] = useState(false);

  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* the door you knock on — the whole page stands at it */}
      <motion.img
        src="/images/door-arched.jpg"
        alt="An arched entry door framed in bougainvillea"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.6, ease: EASE }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/30 via-transparent to-espresso/25" />
      <div className="absolute bottom-0 left-0 hidden p-10 lg:block">
        <p className="serif-body max-w-sm text-2xl italic leading-snug text-bone drop-shadow-[0_2px_12px_rgba(34,30,24,0.6)]">
          The first step is a&nbsp;conversation.
        </p>
      </div>

      {/* the conversation — a panel resting on the scene */}
      <div className="relative mx-auto flex max-w-[1520px] justify-center px-0 pb-0 pt-24 sm:px-6 sm:pb-14 sm:pt-32 md:justify-end md:px-10 md:pt-36">
        <div className="grain relative w-full bg-bone/[0.97] px-5 pb-16 pt-12 shadow-[0_40px_90px_-40px_rgba(34,30,24,0.7)] sm:max-w-xl sm:px-10 sm:pb-14 md:max-w-2xl md:px-14">
        <FadeUp>
          <p className="label mb-7 text-navy">Build with Bluedoor</p>
        </FadeUp>
        <Lines
          as="h1"
          className="display text-[2.7rem] leading-[1.04] text-umber md:text-6xl"
          lines={["Tell us about", "the home you see."]}
        />

        <div className="mt-12 max-w-xl">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="border border-navy/25 bg-linen px-8 py-12 text-center"
              >
                <img src="/images/logo.png" alt="" className="mx-auto h-16 w-16" />
                <p className="display mt-7 text-3xl text-umber">Thank you.</p>
                <p className="serif-body mt-4 text-lg italic leading-relaxed text-umber/75">
                  Your inquiry is in our hands. Someone from the studio — not an
                  autoresponder — will be in touch&nbsp;shortly.
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
                <div className="grid gap-8 sm:grid-cols-2">
                  <FadeUp delay={0.1}>
                    <label className="block">
                      <span className="label text-taupe">First Name</span>
                      <input required name="firstName" autoComplete="given-name" className={FIELD} />
                    </label>
                  </FadeUp>
                  <FadeUp delay={0.14}>
                    <label className="block">
                      <span className="label text-taupe">Last Name</span>
                      <input required name="lastName" autoComplete="family-name" className={FIELD} />
                    </label>
                  </FadeUp>
                </div>
                <FadeUp delay={0.18}>
                  <label className="mt-8 block">
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
                <FadeUp delay={0.22}>
                  <label className="mt-8 block">
                    <span className="label text-taupe">Message</span>
                    <textarea
                      required
                      name="message"
                      rows={4}
                      placeholder="The property, the vision, the timeline — as much or as little as you like."
                      className={`${FIELD} resize-none`}
                    />
                  </label>
                </FadeUp>
                <FadeUp delay={0.26}>
                  <button
                    type="submit"
                    className="label mt-10 w-full bg-navy px-10 py-5 text-bone transition-colors duration-500 hover:bg-navy-deep sm:w-auto"
                  >
                    Submit Inquiry
                  </button>
                </FadeUp>
              </motion.form>
            )}
          </AnimatePresence>

          <FadeUp delay={0.3}>
            <div className="mt-14 border-t border-umber/15 pt-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
                <div>
                  <p className="label mb-3 text-taupe">Visit the Studio</p>
                  <p className="text-[15px] font-light leading-relaxed text-umber/80">
                    {site.legalName}
                    <br />
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.state}
                  </p>
                  <p className="serif-body mt-2 text-[16px] italic text-taupe">
                    Across from the Norton Museum of&nbsp;Art
                  </p>
                </div>
                <div>
                  <p className="label mb-3 text-taupe">Follow the Work</p>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label inline-block border-b border-navy/40 pb-1 text-navy transition-colors hover:border-navy"
                  >
                    {site.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
        </div>
      </div>
    </section>
  );
}
