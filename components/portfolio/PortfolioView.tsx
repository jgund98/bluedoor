"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { FadeUp, ImageReveal, Lines } from "@/components/motion";
import PageHero from "@/components/PageHero";

type Piece = {
  src: string;
  alt: string;
  caption: string;
  // span controls editorial rhythm: wide pieces breathe, tall pieces anchor
  span?: "wide" | "tall";
  // watercolors are artworks — shown whole on paper, never cropped
  paper?: boolean;
};

type Chapter = {
  id: string;
  numeral: string;
  title: string;
  note: string;
  pieces: Piece[];
};

const CHAPTERS: Chapter[] = [
  {
    id: "luxury-residential",
    numeral: "I",
    title: "Luxury Residential",
    note: "New construction on the ocean and the Intracoastal — built from the ground up, finished to the finest tolerance.",
    pieces: [
      { src: "/images/aerial-oceanfront.jpg", alt: "Oceanfront estate from above, the Atlantic at its edge", caption: "Oceanfront estate — from the air", span: "wide" },
      { src: "/images/oceanfront-entry.jpg", alt: "Entry elevation of an oceanfront residence", caption: "The entry elevation" },
      { src: "/images/courtyard-modern.jpg", alt: "A private courtyard framed in glass and stone", caption: "A private courtyard" },
      { src: "/images/loggia-pool.jpg", alt: "Covered loggia beside the pool, ocean beyond", caption: "The loggia at midday", span: "wide" },
      { src: "/images/door-modern.jpg", alt: "A monumental entry door in coquina stone", caption: "The front door, monumental" },
      { src: "/images/estate-palms.jpg", alt: "A finished estate beneath the palms", caption: "Beneath the palms" },
      { src: "/images/poolhouse-modern.jpg", alt: "Pool pavilion and stepped lawn", caption: "Pavilion and pool" },
      { src: "/images/estate-colonial.jpg", alt: "A classical estate with sweeping entry stair", caption: "A classical composition" },
      { src: "/images/loggia-bar.jpg", alt: "Outdoor bar and dining beneath the loggia", caption: "Outdoor rooms, fully served" },
      { src: "/images/detail-stone-column.jpg", alt: "Coquina column detail in the garden", caption: "Stone, considered" },
    ],
  },
  {
    id: "historic-renovation",
    numeral: "II",
    title: "Historic Renovation",
    note: "The delicate art of landmark restoration — honoring what was, engineering what lasts.",
    pieces: [
      { src: "/images/estate-bougainvillea.jpg", alt: "A restored estate behind bougainvillea in bloom", caption: "A landmark, in bloom", span: "wide" },
      { src: "/images/gate-pineapple.jpg", alt: "Restored garden gate with pineapple finials", caption: "The garden gate" },
      { src: "/images/house-shingle.jpg", alt: "A restored shingle residence", caption: "A century home, renewed" },
      { src: "/images/house-stone.jpg", alt: "Stone residence with deep entry porch", caption: "Stone and shade" },
      { src: "/images/watercolor-2.jpg", alt: "Watercolor study of a historic residence", caption: "The watercolor study", paper: true },
      { src: "/images/watercolor-4.jpg", alt: "Watercolor rendering of a restored estate", caption: "Recorded in watercolor", paper: true },
    ],
  },
  {
    id: "quality-interiors",
    numeral: "III",
    title: "Quality Interiors",
    note: "Finely detailed interiors, executed with our collaborators — every reveal, every shadow line, resolved.",
    pieces: [
      { src: "/images/stairhall-2.jpg", alt: "A coquina stair hall flooded with natural light", caption: "The stair hall", span: "wide" },
      { src: "/images/kitchen-marble.jpg", alt: "Marble kitchen with sculptural lighting", caption: "The kitchen, in marble" },
      { src: "/images/entry-hall.jpg", alt: "Entry hall in warm stone and glass", caption: "The entry hall" },
      { src: "/images/living-ocean.jpg", alt: "Living room opening to the ocean horizon", caption: "The horizon room" },
      { src: "/images/kitchen-brass.jpg", alt: "Kitchen with brass stools and scalloped pendants", caption: "Brass and morning light" },
      { src: "/images/dining-modern.jpg", alt: "Dining room beneath a sculptural chandelier", caption: "The dining room" },
      { src: "/images/hallway-gallery.jpg", alt: "A gallery hallway in white oak and glass", caption: "The gallery hall", span: "wide" },
      { src: "/images/pantry-blue.jpg", alt: "A blue butler's pantry with rattan cabinetry", caption: "The butler's pantry" },
      { src: "/images/greatroom.jpg", alt: "Great room with soaring ceilings", caption: "The great room" },
      { src: "/images/living-coastal.jpg", alt: "A light-filled coastal living room", caption: "Layered, light-filled" },
      { src: "/images/bunkroom-green.jpg", alt: "A green bunk room with patterned tile", caption: "The bunk room" },
      { src: "/images/hall-door.jpg", alt: "Stair hall with towering black entry door", caption: "The tall door" },
      { src: "/images/kitchen-scallop.jpg", alt: "Kitchen with scalloped pendants and island seating", caption: "Scallops and stone" },
      { src: "/images/kitchen-living.jpg", alt: "Kitchen flowing into the living room, ocean beyond", caption: "One room to the sea" },
      { src: "/images/console-vases.jpg", alt: "Console with sculptural ceramics", caption: "The quiet moment" },
      { src: "/images/loggia-stone.jpg", alt: "A stone loggia at dusk", caption: "The stone loggia", span: "wide" },
    ],
  },
];

export default function PortfolioView() {
  return (
    <>
      <PageHero
        label="Our Portfolio"
        lines={["The work speaks", "in stone and light."]}
        intro={site.copy.portfolioIntro}
      />

      {CHAPTERS.map((chapter, ci) => (
        <section
          key={chapter.id}
          id={chapter.id}
          className={`scroll-mt-24 ${ci % 2 === 0 ? "bg-linen" : "bg-bone"}`}
        >
          <div className="mx-auto max-w-[1520px] px-5 py-20 md:px-10 md:py-32">
            <div className="mb-14 flex items-end justify-between gap-8 md:mb-20">
              <div>
                <FadeUp>
                  <p className="label mb-5 text-navy">Chapter {chapter.numeral}</p>
                </FadeUp>
                <Lines
                  as="h2"
                  className="display text-4xl text-umber md:text-6xl"
                  lines={[chapter.title]}
                />
                <FadeUp delay={0.1}>
                  <p className="mt-6 max-w-xl text-[16px] font-light leading-relaxed text-umber/75">
                    {chapter.note}
                  </p>
                </FadeUp>
              </div>
              <FadeUp className="hidden md:block">
                <span
                  aria-hidden
                  className="display select-none text-[11rem] leading-none text-sand/80"
                >
                  {chapter.numeral}
                </span>
              </FadeUp>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8">
              {chapter.pieces.map((piece, i) => (
                <figure
                  key={piece.src}
                  className={piece.span === "wide" ? "sm:col-span-2" : undefined}
                >
                  {piece.paper ? (
                    <FadeUp delay={(i % 2) * 0.08}>
                      <div className="flex aspect-[4/3] items-center justify-center">
                        <div className="w-[82%] border border-umber/10 bg-white p-3 shadow-[0_24px_55px_-28px_rgba(53,48,42,0.5)] transition-transform duration-700 ease-out hover:-translate-y-1.5 md:rotate-[-1deg] md:hover:rotate-0">
                          <img
                            src={piece.src}
                            alt={piece.alt}
                            loading="lazy"
                            className="h-auto w-full"
                          />
                        </div>
                      </div>
                    </FadeUp>
                  ) : (
                    <ImageReveal
                      src={piece.src}
                      alt={piece.alt}
                      className={`img-hover w-full ${
                        piece.span === "wide" ? "aspect-[16/8.5]" : "aspect-[4/3]"
                      }`}
                      delay={(i % 2) * 0.08}
                    />
                  )}
                  <figcaption className="mt-3.5 flex items-baseline justify-between gap-4">
                    <span className="serif-body text-[17px] italic text-umber/80">
                      {piece.caption}
                    </span>
                    <span className="label hidden text-taupe sm:block">
                      {chapter.title}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-espresso">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center px-5 py-24 text-center md:px-10 md:py-32">
          <FadeUp>
            <p className="serif-body balance max-w-2xl text-2xl italic leading-[1.45] text-bone/90 md:text-3xl">
              Witness the artistry that sets us apart — then let&nbsp;us build it
              for&nbsp;you.
            </p>
          </FadeUp>
          <FadeUp delay={0.12}>
            <Link
              href="/build-with-bluedoor"
              className="label mt-10 inline-block border border-bone/70 px-9 py-4 text-bone transition-colors duration-500 hover:bg-bone hover:text-navy"
            >
              Build with Bluedoor
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
