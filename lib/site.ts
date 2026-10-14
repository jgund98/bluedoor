// Every business fact for Bluedoor Building lives here.
// Copy is sourced verbatim from bluedoorbuilding.com — do not embellish.

export const site = {
  name: "Bluedoor Building",
  legalName: "Bluedoor Building, Inc.",
  tagline: "Luxury Custom Home Builder — Palm Beach, Florida",
  url: "https://www.bluedoorbuilding.com",
  /** Where this build is actually served. Link previews resolve against it. */
  deployUrl: "https://bluedoor-beta.vercel.app",
  address: {
    street: "501 Palm Street, C-2",
    city: "West Palm Beach",
    state: "FL",
    note: "Located across the street from the Norton Museum of Art",
  },
  geo: { lat: 26.7093, lng: -80.0563 },
  instagram: "https://www.instagram.com/bluedoorbuilding",
  instagramHandle: "@bluedoorbuilding",
  areas: ["Palm Beach", "West Palm Beach", "Manalapan", "The Palm Beaches"],
  principal: {
    name: "Siobhan Zerilla",
    title: "The Principal",
    quote:
      "Construction is gratifying in its transformation, but the most rewarding part of a project is finishing with satisfied clients, a quality-built home, and vendors who are proud of their workmanship.",
  },
  // Hidden 2026-10-14: the team has changed. Nothing renders site.team until she sends group photos.
  team: [
    {
      name: "Lisa Palmisciano",
      // her face sits lower and smaller in the frame than Majic; zoom and lift it level
      pos: "50% 50%",
      zoom: "translateY(-9%) scale(1.22)",
      title: "Chief Financial Officer",
      photo: "/images/team-lisa.jpg",
      short:
        "Lisa brings precision to financial management, client contracts and budgets, and plays a pivotal role in administrative project management. She collaborated with Siobhan long before Bluedoor’s creation.",
      bio: "Lisa brings precision and expertise to all aspects of financial management, human resources, client contracts, budgets, and plays a pivotal role in providing administrative project management for Bluedoor Building. With 15 years of experience in IT within the banking and healthcare sectors, her background includes systems analysis, project planning, team management, and financial reporting. Lisa's passion for home renovations led her to collaborate with Siobhan long before Bluedoor's creation, and she has been a part of the team from its inception. Her meticulous attention to detail ensures accuracy and transparency in tracking and reporting project costs, upholding Bluedoor's commitment to its highest standards of quality and integrity.",
    },
    {
      name: "Majic Noone",
      pos: "50% 50%",
      zoom: "none",
      title: "Director of Operations",
      photo: "/images/team-majic.jpg",
      short:
        "After two decades in healthcare administration, Majic brought her expertise to high end construction. She keeps procurement, permits and vendor agreements running smoothly.",
      bio: "With over two decades of experience in healthcare, including 10 years in administrative roles, Majic Noone seamlessly transitioned her expertise to high end construction. Leveraging her LEAN Six Sigma and SWOT analysis training, she excels at optimizing operations for Bluedoor Building. Majic's strong background in managing people, processes, and data brings unmatched efficiency to the team. From streamlining procurement and client bid comparisons to managing permits and vendor agreements, Majic ensures Bluedoor's operations run smoothly, allowing the company to focus on delivering exceptional results for clients.",
    },
  ],
  collaborators: {
    architects: [
      { name: "Dailey Janssen Architects", url: "https://www.daileyjanssen.com" },
      { name: "FGS Design", url: "https://fgs-a.com" },
      { name: "Northworks", url: "https://www.northworks.com" },
      { name: "Smith and Moore Architects", url: "https://www.smithmoorearchitects.com" },
      { name: "SKA Architect", url: "https://www.skaarchitect.com" },
      { name: "Tralongo and Taylor Architects", url: "https://www.tralongoandtaylor.com" },
    ],
    interiors: [
      { name: "CeCe Bowman Interiors", url: "https://www.cecebowmaninteriors.com" },
      { name: "Elizabeth Gray Homes", url: "https://www.elizabethgrayhomes.com" },
      { name: "Kemble Interiors", url: "https://www.kembleinteriors.com" },
      { name: "McCann Design Group", url: "https://mccanndesigngroup.com" },
      { name: "Studio SFW", url: "https://www.studiosfw.com" },
    ],
    landscape: [
      { name: "Environmental Design Group", url: "https://www.environmentdesigngroup.com" },
      { name: "KWD Landscape Architecture", url: "https://www.kwdlandscapearchitecture.com" },
      { name: "Nievera Williams Design", url: "https://www.nieverawilliams.com" },
      // added at her request 2026-10-14 (she said it aloud; the transcripts heard "Vertex").
      // Brian and Molly Vertesch, Palm Beach practice since 1995, FL Lic 6666691.
      { name: "Vertesch Landscape Architecture", url: "https://verteschla.com" },
    ],
  },
  publications: [
    {
      name: "House Beautiful",
      title: "The Color Issue — A West Palm Beach House Tour",
      blurb:
        "A private Kemble Interiors collaboration in West Palm Beach, featured in House Beautiful's Color Issue.",
      url: "https://www.housebeautiful.com/design-inspiration/house-tours/a60599156/kemble-interiors-west-palm-beach-house-tour/",
      image: "/images/press-housebeautiful.jpg",
    },
    {
      name: "Luxury Home Magazine",
      title: "Builders to Know — The Palm Beaches",
      blurb:
        "Luxury Home Magazine names Siobhan Zerilla among the builders to know in the Palm Beaches.",
      url: "https://www.luxuryhomemagazine.com/thepalmbeaches/thepalmbeachesonline.html",
      image: "/images/press-builders.jpg",
    },
    {
      name: "Modern Luxury Palm Beach",
      title: "An Extraordinary Oceanfront Estate, Manalapan",
      blurb:
        "A newly completed waterfront estate spanning the Atlantic and the Intracoastal — “so rare, it is a retreat, a work of art, a once-in-a-lifetime opportunity.”",
      url: "https://www.modernluxury.com/discover-1160-south-ocean-boulevard-manalapan/",
      image: "/images/press-modernluxury.jpg",
    },
    {
      name: "Luxury Home Magazine",
      title: "Coastal Collection — Cover Feature",
      blurb:
        "Bluedoor work on the cover of Luxury Home Magazine, the Palm Beaches & surrounding areas.",
      url: "https://www.luxuryhomemagazine.com/thepalmbeaches/thepalmbeachesonline.html",
      image: "/images/press-lhm.jpg",
    },
  ],
  bio: "A boutique custom home builder specializing in new construction and renovation of luxury homes.",
  reels: [
    {
      src: "/reels/arch-stairs.mp4",
      poster: "/reels/arch-stairs-poster.jpg",
      label: "The stair hall, taking shape",
    },
    {
      src: "/reels/interior-ocean.mp4",
      poster: "/reels/interior-ocean-poster.jpg",
      label: "Finished, to the horizon",
    },
    {
      src: "/reels/coast-aerial.mp4",
      poster: "/reels/coast-aerial-poster.jpg",
      label: "The Palm Beaches, from above",
    },
    {
      src: "/reels/cabana.mp4",
      poster: "/reels/cabana-poster.jpg",
      label: "Oceanfront cabana, nearly complete",
    },
    {
      src: "/reels/soso-progress.mp4",
      poster: "/reels/soso-progress-poster.jpg",
      label: "Progress at the SoSo house",
    },
    {
      src: "/reels/stone-facade.mp4",
      poster: "/reels/stone-facade-poster.jpg",
      label: "Natural stone, intertwined",
    },
  ],
  services: [
    {
      slug: "luxury-residential",
      name: "Luxury Residential",
      copy: "From concept to completion, we build and renovate luxurious custom homes tailored to your unique lifestyle and preferences.",
      image: "/images/aerial-oceanfront.jpg",
    },
    {
      slug: "historic-renovation",
      name: "Historic Renovation",
      copy: "Exceeding the boundaries of building only new and modern, our team has demonstrated proficiency in the delicate art of historic and landmark renovation.",
      image: "/images/estate-bougainvillea.jpg",
    },
    {
      slug: "quality-interiors",
      name: "Quality Interiors",
      copy: "Our expertise encompasses providing both architecturally exquisite exteriors and finely detailed interiors, showcasing comprehensive artistry designed specifically for our client.",
      image: "/images/kitchen-marble.jpg",
    },
  ],
  copy: {
    commitmentLabel: "Our Commitment",
    commitment:
      "Bluedoor is dedicated to redefining excellence in high-end construction, with precision, sophistication, and outstanding craftsmanship. Renowned for our meticulous attention to detail and masterful planning, our projects align with the highest standards of luxury and quality.",
    whyLabel: "Why Bluedoor",
    whyHeadline: "Uncompromising Quality, Unparalleled Expertise",
    why: "Bluedoor takes a distinct approach, harnessing a wealth of experience and innovative techniques to ensure the highest standards of craftsmanship and client satisfaction.",
    collaborations:
      "Partnering closely with industry-leading professionals enables us to provide exceptional results that meet or exceed our clients' expectations, and uphold our commitment to excellence.",
    portfolioIntro:
      "Welcome to our showcase of refined craftsmanship and peerless attention to detail. We take pride in bringing architectural visions to life with sophisticated finishes and thoughtful design. From exquisite estates to elegant renovations, each project is a testimonial to our commitment to our collaborative partnerships. Explore our work, creating homes of lasting beauty and distinction, and witness the artistry that sets us apart.",
    processIntro:
      "Our projects reflect our ability to satisfy the needs and wants of diverse clients across a variety of contexts and conditions.",
    processBuilders:
      "Understanding the “what” and the “why” of our client's needs enables us to identify priorities, and to redirect the build for cost-efficiency or time-constraints.",
    bigThree:
      "Our approach to creating exceptional homes revolves around three foundational pillars: vision, priorities, and budget.",
    bigThreeDetail:
      "We work closely with clients to identify their unique vision, define their priorities, and establish a budget that aligns with their goals to ensure a seamless process from concept to completion. We operate with transparency to gain trust — no hidden agenda, no hidden fees, and a full record keeping of costs accrued throughout the project.",
    funnel:
      "As the builder, we act as a funnel for correspondence from the owner, designer, architect, engineer, vendors, city officials, and more. We filter and share this information appropriately to provide seamless communication across the project.",
    communication:
      "We use clear communication to keep teams on track and in the loop on job site conditions, updates and modifications.",
    handOff:
      "When it comes time to hand off your completed home, we strive for a seamless transition. To extend our support on your journey into your new space, we provide a comprehensive guidebook tailored to your specific property. It contains notes and insights from the initial phases of construction all the way through to the final touches, and includes plans and manuals for key details about your new home, offering a reliable reference for any questions that may arise as you settle in.",
    supervisionLabel: "Project Management and Site Supervision",
    supervision:
      "Project management and site supervision are key factors in our ability to deliver successful projects. We take these components seriously and do not leave projects unsupervised. Daily monitoring of the site, subcontractors, field conditions, plans, communication, security, and cleanliness are included in every project we execute. Attention to detail is a top priority. We typically have 3–4 project managers on staff at all times to effectively manage, monitor and execute the day to day activities on site.",
    siobhanBio1:
      "Bluedoor is led by Siobhan Zerilla, who came to construction after graduate school and learned the industry from the foundation up. That grounding still shapes how the company works: a comprehensive understanding of construction operations, an eye for efficiency, and a habit of fixing what others leave alone.",
    siobhanBio2:
      "Decades of experience inform how Bluedoor runs: business management, project organization, and clear communication with every client and trade. The same attention to detail shows in the finished home and throughout the build, starting with a clean and organized job site that keeps every team clear and efficient.",
    siobhanBio3:
      "The portfolio spans large-scale builds and intricate renovations, each shaped around the client it was built for. Creative problem-solving on complex challenges has earned the firm a reputation for excellence in execution and client satisfaction.",
    siobhanBio4:
      "The firm prioritizes precision, professionalism, and a collaborative approach, ensuring each project is completed with unmatched craftsmanship and care.",
    officeLabel: "The Office",
    office:
      "Bluedoor is fully staffed in the field and behind the scenes. While project managers are on site every day, the office carries the rest of the build: contracts and budgets, procurement and bid comparisons, permits and vendor agreements, scheduling, cost reporting, and client correspondence. Nothing waits on a job site for an answer, and nothing on a job site is left to chance.",
    teamLabel: "The Team",
    teamIntro:
      "Everyone here has been on the inside of a build, and everyone answers the phone.",
    publicationsIntro:
      "At Bluedoor Building, our commitment to craftsmanship, innovation, and excellence has earned recognition in some of the most respected design publications. Here we highlight our recent features, press mentions, and collaborative projects that showcase the artistry behind every home we build.",
  },
} as const;

export type Publication = (typeof site.publications)[number];

/* ------------------------------------------------------------------ *
 * Site composition. Facts live above; how the site is arranged lives
 * here. New copy follows her register: plain, exact, unembellished.
 * ------------------------------------------------------------------ */

export const nav = {
  left: [
    { label: "Portfolio", href: "/portfolio/" },
    { label: "Process", href: "/process/" },
  ],
  right: [
    { label: "Culture", href: "/culture/" },
    { label: "Press", href: "/media/" },
  ],
  full: [
    { label: "Portfolio", href: "/portfolio/", line: "Selected work" },
    { label: "Process", href: "/process/", line: "How a home is made" },
    { label: "Culture", href: "/culture/", line: "The studio, and how it works" },
    { label: "Press", href: "/media/", line: "Features and recognition" },
    { label: "Build with Bluedoor", href: "/build-with-bluedoor/", line: "Begin a conversation" },
  ],
  /** The way in for clients. Far right of the header, and in the footer. */
  clientLogin: { label: "Client Login", href: "/login/" },
} as const;

/** The procession behind the hero arch — tall, bright, blue-and-white. */
export const heroRail = [
  // The door and the bougainvillea lead: on a phone one plate fills the
  // frame, and the first one should have some color in it.
  { src: "/images/rail/door-arched.jpg", pos: "52% 50%" },
  { src: "/images/rail/estate-palms.jpg", pos: "50% 58%" },
  { src: "/images/rail/greatroom.jpg", pos: "50% 50%" },
  { src: "/images/rail/aerial-oceanfront.jpg", pos: "50% 52%" },
  { src: "/images/rail/estate-colonial.jpg", pos: "50% 56%" },
  { src: "/images/rail/kitchen-brass.jpg", pos: "50% 50%" },
  { src: "/images/rail/gate-pineapple.jpg", pos: "50% 50%" },
  { src: "/images/rail/loggia-pool.jpg", pos: "50% 50%" },
] as const;

/** Smaller plates for phones — half the decode cost, same procession. */
export const heroRailMobile = heroRail.map((r) => ({
  ...r,
  src: r.src.replace("/images/rail/", "/images/rail/m/"),
}));

/** Three portals — her three disciplines, in her words. */
export const portals = [
  {
    index: "I",
    label: "Luxury Residential",
    line: "From concept",
    answer: "to completion.",
    copy: site.services[0].copy,
    // 10-14: was the bougainvillea court, which is also a hero plate
    image: "/images/elevation-twin-palms.jpg",
    pos: "50% 55%",
    href: "/portfolio/",
    ground: "porcelain",
  },
  {
    index: "II",
    label: "Historic Renovation",
    line: "Historic homes,",
    answer: "carefully renewed.",
    copy: site.services[1].copy,
    // her request: the small historic shingled house (Root Trail)
    image: "/images/house-shingle.jpg",
    // the gabled front, centred; at 27% the bin at the far left of the
    // driveway stays out of the arch on both desk and phone
    pos: "27% 50%",
    href: "",
    ground: "mist",
  },
  {
    index: "III",
    label: "Quality Interiors",
    line: "Exquisite exteriors,",
    answer: "detailed interiors.",
    copy: site.services[2].copy,
    image: "/images/pantry-blue.jpg",
    pos: "50% 50%",
    href: "",
    ground: "porcelain",
  },
] as const;

/** Portfolio plates. Captions stay descriptive — no names, no addresses. */
export type Plate = { src: string; caption: string; shape: "portrait" | "landscape" | "wide"; pos?: string };
export const gallery: readonly Plate[] = [
  { src: "/images/greatroom.jpg", caption: "Great room, framed to the Atlantic", shape: "landscape", pos: "50% 55%" },
  { src: "/images/estate-palms.jpg", caption: "Mediterranean elevation, oceanfront", shape: "landscape" },
  { src: "/images/door-arched.jpg", caption: "Arched entry, bougainvillea in season", shape: "portrait" },
  { src: "/images/kitchen-brass.jpg", caption: "Kitchen in blue and unlacquered brass", shape: "landscape" },
  { src: "/images/aerial-estate.jpg", caption: "Oceanfront estate, from above", shape: "wide", pos: "50% 58%" },
  { src: "/images/foyer-arched.jpg", caption: "Arched foyer to the front door", shape: "portrait" },
  { src: "/images/dining-mural.jpg", caption: "Dining room in hand-painted paper", shape: "landscape" },
  { src: "/images/loggia-ocean.jpg", caption: "Loggia under a cypress ceiling", shape: "landscape" },
  { src: "/images/stair-palm-mural.jpg", caption: "Stair hall in hand-painted palms", shape: "portrait" },
  { src: "/images/garden-elevation.jpg", caption: "Garden elevation over the pool", shape: "landscape" },
  { src: "/images/hall-door.jpg", caption: "Stair to the garden door", shape: "portrait", pos: "50% 45%" },
  { src: "/images/living-coastal.jpg", caption: "Living room, natural light held all day", shape: "landscape" },
  { src: "/images/estate-bougainvillea.jpg", caption: "Entry court in bougainvillea", shape: "wide" },
  { src: "/images/entry-fanlight.jpg", caption: "Entry stair to a fanlight door", shape: "portrait" },
  { src: "/images/garden-room.jpg", caption: "Garden room in rattan and blush", shape: "landscape" },
  { src: "/images/kitchen-cream.jpg", caption: "Kitchen in cream lacquer", shape: "landscape" },
  { src: "/images/study-octagon.jpg", caption: "Octagonal study to the ocean", shape: "portrait" },
  { src: "/images/pool-loggia.jpg", caption: "Pool and loggia, oceanfront", shape: "landscape" },
  { src: "/images/entry-hall.jpg", caption: "Entry hall in stone and glass", shape: "portrait", pos: "50% 45%" },
  { src: "/images/library-den.jpg", caption: "Library den in garden chintz", shape: "landscape" },
  { src: "/images/house-shingle.jpg", caption: "Historic house, carefully renewed", shape: "landscape" },
  { src: "/images/powder-coral.jpg", caption: "Powder room in coral pattern", shape: "portrait" },
  { src: "/images/loggia-pool.jpg", caption: "Pool terrace and cabana", shape: "landscape" },
  { src: "/images/pool-court.jpg", caption: "Pool court and garden loggia", shape: "wide" },
  { src: "/images/pantry-blue.jpg", caption: "Scullery in painted cabinetry", shape: "portrait" },
  { src: "/images/kitchen-walnut.jpg", caption: "Kitchen with a walnut island", shape: "landscape" },
  { src: "/images/primary-bedroom.jpg", caption: "Primary bedroom with a hearth", shape: "landscape" },
  { src: "/images/stair-fanlight.jpg", caption: "Curved stair under a fanlight", shape: "portrait" },
  { src: "/images/estate-colonial.jpg", caption: "Colonial elevation with louvered shutters", shape: "landscape" },
  { src: "/images/loggia-dining.jpg", caption: "Loggia dining to the pool", shape: "landscape" },
  { src: "/images/banquette-green.jpg", caption: "Banquette in green leather", shape: "portrait" },
  { src: "/images/bar-herringbone.jpg", caption: "Bar in herringbone oak", shape: "landscape" },
  { src: "/images/kitchen-living.jpg", caption: "Kitchen open to the ocean room", shape: "landscape" },
  { src: "/images/loggia-arcade.jpg", caption: "Loggia arcade", shape: "portrait" },
  { src: "/images/hallway-gallery.jpg", caption: "Gallery corridor, oceanside", shape: "landscape" },
  { src: "/images/oceanfront-entry.jpg", caption: "Motor court and entry", shape: "wide" },
  { src: "/images/pool-pavilion.jpg", caption: "Pool pavilion under the palms", shape: "portrait" },
  { src: "/images/family-room-water.jpg", caption: "Family room to the water", shape: "landscape" },
  { src: "/images/guest-room-green.jpg", caption: "Guest room in green and white", shape: "landscape" },
  { src: "/images/mudroom-sage.jpg", caption: "Mudroom in sage and encaustic tile", shape: "portrait" },
  { src: "/images/loggia-bar.jpg", caption: "Loggia bar, open to the surf", shape: "landscape" },
  { src: "/images/wine-room.jpg", caption: "Wine room in warm cypress", shape: "landscape" },
  { src: "/images/console-vases.jpg", caption: "Entry console in pale oak", shape: "portrait", pos: "50% 68%" },
  { src: "/images/condo-living.jpg", caption: "Living room above the water", shape: "landscape" },
  { src: "/images/condo-kitchen.jpg", caption: "Kitchen in white oak", shape: "landscape" },
  { src: "/images/porch-sage.jpg", caption: "Porch in sage linen", shape: "portrait" },
  { src: "/images/hero-stairhall.jpg", caption: "Double stair hall in cut travertine", shape: "landscape", pos: "50% 60%" },
  { src: "/images/poolhouse-modern.jpg", caption: "Pool house and lawn to the water", shape: "wide" },
  { src: "/images/hearth-white.jpg", caption: "Hearth in white millwork", shape: "portrait" },
  { src: "/images/dining-modern.jpg", caption: "Dining room, lit for evening", shape: "landscape" },
  { src: "/images/sitting-room-blue.jpg", caption: "Sitting room in blue", shape: "landscape" },
  { src: "/images/door-modern.jpg", caption: "Modern entry in coral stone", shape: "portrait" },
  { src: "/images/loggia-stone.jpg", caption: "Coral stone loggia at dusk", shape: "landscape" },
  { src: "/images/courtyard-modern.jpg", caption: "Courtyard, planted for shade", shape: "landscape" },
  { src: "/images/pantry-sage.jpg", caption: "Pantry passage to a porthole window", shape: "portrait" },
  { src: "/images/condo-hall.jpg", caption: "Dressing hall in white lacquer", shape: "landscape" },
  { src: "/images/laundry-blue.jpg", caption: "Laundry in blue and white", shape: "landscape" },
  { src: "/images/entry-steel.jpg", caption: "Front doors in black steel", shape: "portrait" },
  { src: "/images/house-stone.jpg", caption: "Stone elevation, in town", shape: "landscape" },
  { src: "/images/stair-oval.jpg", caption: "Oval stair, from above", shape: "landscape" },
  { src: "/images/estate-lawn.jpg", caption: "Estate front lawn and gates", shape: "wide" },
  { src: "/images/bunkroom-green.jpg", caption: "Bunk room, painted millwork", shape: "portrait", pos: "50% 45%" },
  { src: "/images/living-hearth.jpg", caption: "Living room hearth", shape: "landscape" },
  { src: "/images/kitchen-ink.jpg", caption: "Kitchen with an ink-blue island", shape: "landscape" },
  { src: "/images/front-porch.jpg", caption: "Front porch and gallery", shape: "portrait" },
  { src: "/images/elevation-twin-palms.jpg", caption: "Front elevation between twin palms", shape: "landscape" },
  { src: "/images/billiard-room.jpg", caption: "Billiard room", shape: "landscape" },
  { src: "/images/bath-crystal.jpg", caption: "Bath under a crystal light", shape: "portrait" },
  { src: "/images/dining-print.jpg", caption: "Dining room in printed paper", shape: "landscape" },
  { src: "/images/library-gray.jpg", caption: "Library in gray paneling", shape: "landscape" },
  { src: "/images/gate-pineapple.jpg", caption: "Lattice gate and pineapple finials", shape: "portrait", pos: "50% 40%" },
  { src: "/images/living-ocean.jpg", caption: "Seating room open to the terrace", shape: "landscape" },
  { src: "/images/bath-garden.jpg", caption: "Bath opening to a walled garden", shape: "landscape" },
  { src: "/images/powder-damask.jpg", caption: "Powder room in blue damask", shape: "portrait" },
  { src: "/images/family-billiards.jpg", caption: "Family room and billiards", shape: "landscape" },
  { src: "/images/condo-laundry.jpg", caption: "Laundry in white and brass", shape: "landscape" },
  { src: "/images/detail-stone-column.jpg", caption: "Cast column, hand-finished", shape: "portrait" },
  { src: "/images/gatehouse.jpg", caption: "Gatehouse arch", shape: "landscape" },
  { src: "/images/aerial-oceanfront.jpg", caption: "Oceanfront, from above", shape: "wide" },
];

/** Copy written for this site. Her register: plain, exact, no flourish. */
export const written = {
  heroEyebrow: "A boutique custom home builder",
  heroPlace: "Palm Beach, Florida",
  heroLine: "Uncompromising quality.",
  heroAnswer: "Unparalleled expertise.",
  heroFoot: "Palm Beach, Florida",
  scrollCue: "Scroll to enter",

  portalsLabel: "What we build",
  portalsLine: "Three disciplines,",
  portalsAnswer: "one standard.",

  // The homepage snapshot (10-14). Replaces her Principal section on home;
  // her story lives on Culture only. Written in her own vocabulary from her
  // original site ("to the final touches", "a clean and organized job site"),
  // and so that none repeats the three stacked sections above it.
  whatLabel: "What we do",
  whatLine: "Building, renovating,",
  whatAnswer: "and caring for homes.",
  whatWeDo: [
    {
      n: "I",
      name: "New Construction",
      copy: "Custom homes built new, managed from the first drawings to the final touches.",
    },
    {
      n: "II",
      name: "Renovation",
      copy: "Renovations and additions held to the standard of a new build, on a clean and organized job site.",
    },
    {
      n: "III",
      name: "Condominiums",
      copy: "Condominium residences renovated and finished, coordinated with the building and its management from the first day.",
    },
    {
      n: "IV",
      name: "Historic Renovation",
      copy: "Historic and landmark homes brought up to today's standard without losing their character.",
    },
    {
      n: "V",
      name: "Estate Management",
      copy: "Once a home is finished, our estate management division looks after it: scheduled care, trusted vendors, and one point of contact.",
    },
  ],

  principalLabel: "The Principal",
  principalLine: "Built from the ground up.",
  principalAnswer: "On every site, every day.",

  atelierLabel: "Watercolor studies",
  atelierLine: "Every home, painted",
  atelierAnswer: "once it is finished.",
  atelierCopy:
    "Each completed home is recorded as a watercolor — a study of proportion, light, and setting, painted once the last trade has left and the house is at rest.",

  pressLabel: "Recognition",
  pressLine: "Featured in",
  pressAnswer: "the most respected pages.",

  collabLabel: "In collaboration with",
  collabCopy: site.copy.collaborations,

  inviteLabel: "Build with Bluedoor",
  // 10-14: "by design" now belongs to the Culture masthead; this pair is
  // drawn from her own sentence below it.
  inviteLine: "A select few homes,",
  inviteAnswer: "each given its full attention.",
  inviteCopy:
    "We take on a limited number of homes at a time so that each one has the attention it was promised. If you are considering a build or a renovation in the Palm Beaches, write to us.",
  inviteCta: "Begin a conversation",

  /* The closer — the last thing said, after the door opens. Her language. */
  closerLine: "Elevating your vision",
  closerAnswer: "with our expertise.",
  closerCopy:
    "We take on a limited number of homes at a time, and we do not leave projects unsupervised. If you are considering a build or a renovation in the Palm Beaches, the door is open.",
  closerCta: "Begin a conversation",
} as const;

