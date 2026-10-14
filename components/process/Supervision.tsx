"use client";

import { motion } from "framer-motion";
import { site } from "@/lib/site";
import { Reveal } from "@/components/motion";
import { srcSetFor } from "@/lib/img";

/**
 * 02 — Project management and site supervision.
 *
 * Rebuilt 10-14. The old plate set her paragraph in small italic white over
 * a pale stone stair, so it could barely be read, and the full-bleed crop cut
 * the top of the staircase she had already asked us not to cut.
 *
 * Now every word sits on paper, and the photograph shows whole at its own
 * 3:2. The motif is taken from the picture itself: the treads are edged in
 * blue painter's tape. The photograph opens from a single taped line as it
 * scrolls in, and the things Bluedoor monitors every day (her own list) are
 * set as treads, each one taped as it comes into view.
 */
const CHECKS = ["The site", "Subcontractors", "Field conditions", "Plans", "Communication", "Security", "Cleanliness"];

export default function Supervision() {
  return (
    <section className="bg-porcelain py-16 grain lg:py-24">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="label text-navy/50">02</span>
            <span className="h-px w-10 bg-navy/25" />
            <span className="label text-navy/70">{site.copy.supervisionLabel}</span>
          </div>
        </Reveal>

        {/* the photograph, whole: nothing written on it */}
        <div className="tape-open mt-8 aspect-[3/2] overflow-hidden plate ring-1 ring-navy/12 lg:mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/siobhan-site.jpg"
            srcSet={srcSetFor("/images/siobhan-site.jpg")}
            sizes="(min-width: 1024px) 94vw, 100vw"
            alt="A stone stair under construction, its treads papered and edged in blue tape"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <h2>
                <span className="display block text-[clamp(30px,7.4vw,40px)] text-ink lg:text-[clamp(40px,3.4vw,58px)]">
                  We do not leave
                </span>
                <span className="answer mt-0.5 block text-[clamp(32px,7.8vw,42px)] text-navy lg:mt-1 lg:text-[clamp(42px,3.6vw,62px)]">
                  projects unsupervised.
                </span>
              </h2>
              <p className="prose-lux mt-8 max-w-[560px]">{site.copy.supervision}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <span className="label block text-navy/70">Monitored daily, on every project</span>
            </Reveal>
            <ul className="mt-4">
              {CHECKS.map((c, i) => (
                <li key={c} className="relative py-[13px] lg:py-[15px]">
                  <span className="display text-[22px] leading-[1.2] text-ink lg:text-[27px]">{c}</span>
                  {/* the tread, and the tape laid along its edge */}
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-navy/15" />
                  <motion.span
                    aria-hidden
                    className="tape absolute -bottom-[2px] left-0 h-[5px] w-full origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ duration: 0.75, delay: 0.1 + i * 0.09, ease: [0.65, 0, 0.35, 1] }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
