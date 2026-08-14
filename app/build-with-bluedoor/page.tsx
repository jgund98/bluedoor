import type { Metadata } from "next";
import { site, written } from "@/lib/site";
import { Reveal, RevealPlate, Signature } from "@/components/motion";
import Enquiry from "@/components/build/Enquiry";

export const metadata: Metadata = {
  title: "Build with Bluedoor",
  description:
    "Begin a conversation with Bluedoor Building — a boutique custom home builder in Palm Beach, West Palm Beach and Manalapan, Florida.",
};

export default function BuildPage() {
  return (
    <section className="relative bg-chalk pb-20 pt-[124px] grain lg:pb-28 lg:pt-[168px]">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* the door, held open */}
          <div className="hidden lg:col-span-4 lg:block">
            <RevealPlate className="portal sticky top-[128px] aspect-[3/4.4] overflow-hidden plate ring-1 ring-navy/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/gate-pineapple.jpg"
                alt="A lattice gate at the entrance to a Palm Beach house"
                style={{ objectPosition: "50% 52%" }}
              />
            </RevealPlate>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-navy/30" />
                <span className="label text-navy/75">{written.inviteLabel}</span>
              </div>
              <h1 className="mt-7">
                <span className="display block text-[clamp(32px,7.6vw,40px)] text-ink lg:text-[clamp(40px,3.2vw,56px)]">
                  {written.inviteLine}
                </span>
                <span className="answer mt-0.5 block text-[clamp(34px,8vw,42px)] text-navy lg:mt-1 lg:text-[clamp(42px,3.4vw,60px)]">
                  {written.inviteAnswer}
                </span>
              </h1>
              <p className="prose-lux mt-8 max-w-[520px]">{written.inviteCopy}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-11 lg:mt-14">
              <Enquiry />
            </Reveal>

            {/* where we are */}
            <Reveal delay={0.16}>
              <div className="mt-12 grid grid-cols-1 gap-8 border-t border-navy/15 pt-9 sm:grid-cols-3 lg:mt-16">
                <div>
                  <span className="label block text-navy/70">The Office</span>
                  <p className="answer mt-4 text-[17px] leading-[1.6] text-ink/75">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.state}
                  </p>
                </div>
                <div>
                  <span className="label block text-navy/70">Finding us</span>
                  <p className="answer mt-4 text-[17px] leading-[1.6] text-ink/75">
                    {site.address.note}.
                  </p>
                </div>
                <div>
                  <span className="label block text-navy/70">Elsewhere</span>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="answer mt-4 block text-[17px] text-ink/75 transition-colors duration-500 hover:text-navy"
                  >
                    {site.instagramHandle}
                  </a>
                </div>
              </div>
            </Reveal>

            {/* signed */}
            <Reveal delay={0.2}>
              <div className="mt-12 lg:mt-16">
                <Signature className="script block whitespace-nowrap text-[clamp(48px,11vw,66px)] text-navy lg:text-[78px]">
                  Siobhan Zerilla
                </Signature>
                <span className="label mt-1 block text-ink/45">
                  {site.principal.title}, {site.name}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
