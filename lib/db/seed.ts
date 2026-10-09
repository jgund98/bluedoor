import type { DB } from "./index";
import * as s from "./schema";
import { hashPassword } from "../password";
import { composeRecap, defaultDecision } from "../recap";
import { ownerSms, ownerEmailHtml, ownerEmailSubject, vendorDispatchSms } from "../templates";
import { sql } from "drizzle-orm";

/** Build an Eastern-time date relative to today. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  // "Today" is today in Florida, whatever the server clock says.
  const todayNy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const d = new Date(`${todayNy}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  const ymd = d.toISOString().slice(0, 10);
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  // October in Florida is Eastern Daylight Time.
  return new Date(`${ymd}T${hh}:${mm}:00-04:00`);
}

export async function ensureSeed(db: DB) {
  const existing = await db.select({ n: sql<number>`count(*)` }).from(s.organizations);
  if (Number(existing[0]?.n ?? 0) > 0) return;
  await seed(db);
}

/** Wipe every table and rebuild the demo. Runs on every login so the demo can be played with freely. */
export async function resetDemo(db: DB) {
  for (const table of s.ALL_TABLES) await db.delete(table);
  await seed(db);
}

export async function seed(db: DB) {
  const accessCode = process.env.ADMIN_ACCESS_CODE || "jordan123";
  const baseUrl = process.env.APP_URL || "http://localhost:3485";

  const [org] = await db
    .insert(s.organizations)
    .values({
      name: "Bluedoor Building",
      phone: "(561) 555-0140",
      email: "office@bluedoorbuilding.com",
      replyTo: "office@bluedoorbuilding.com",
      address: "Palm Beach, Florida",
    })
    .returning();
  const orgId = org.id;

  const hash = hashPassword(accessCode);
  const [siobhan, lauren] = await db
    .insert(s.users)
    .values([
      { orgId, name: "Siobhan Zerilla", email: "jordan@epicdevsolutions.com", passwordHash: hash, role: "owner", phone: "(561) 555-0102", notifySms: true },
      { orgId, name: "Lauren Pike", email: "lauren@bluedoorbuilding.com", passwordHash: hash, role: "admin", phone: "(561) 555-0103", notifySms: true },
      { orgId, name: "Marcus Hale", email: "marcus@bluedoorbuilding.com", passwordHash: hash, role: "staff", phone: "(561) 555-0104", notifySms: false },
    ])
    .returning();

  const estateRows = await db
    .insert(s.estates)
    .values([
      { orgId, name: "Casa Palma", address1: "1410 S Ocean Blvd", city: "Manalapan", state: "FL", zip: "33462", gateCode: "4471", accessNotes: "Service entrance on the north side. Dogs are friendly but keep the pool gate closed.", coverImage: "/estates/estate-palms.jpg", notes: "Owners in New York June through October. Daniel is on site most weekdays." },
      { orgId, name: "Seabreeze House", address1: "240 Seabreeze Ave", city: "Palm Beach", state: "FL", zip: "33480", gateCode: "2210", accessNotes: "Park on the street. Keypad by the garden door.", coverImage: "/estates/estate-colonial.jpg", notes: "Mrs. Marsh prefers email over text." },
      { orgId, name: "Bougainvillea House", address1: "9 Via Bellaria", city: "Palm Beach", state: "FL", zip: "33480", gateCode: "8832", accessNotes: "Marisol lets vendors in. Call her from the gate.", coverImage: "/estates/estate-bougainvillea.jpg", notes: null },
      { orgId, name: "Clarke Avenue", address1: "130 Clarke Ave", city: "Palm Beach", state: "FL", zip: "33480", gateCode: null, accessNotes: "Lockbox on the pool equipment gate.", coverImage: "/estates/house-shingle.jpg", notes: "No vendors before 9 am. Neighbors have complained about noise." },
      { orgId, name: "Lake Way", address1: "1801 N Lake Way", city: "Palm Beach", state: "FL", zip: "33480", gateCode: "0917", accessNotes: null, coverImage: "/estates/house-stone.jpg", notes: "Generator is the owner's biggest concern after last season." },
      { orgId, name: "The Loggia", address1: "3220 S Ocean Blvd", city: "Manalapan", state: "FL", zip: "33462", gateCode: "5150", accessNotes: "Ocean side gate sticks. Lift and push.", coverImage: "/estates/loggia-ocean.jpg", notes: "Owner travels constantly. Text only, never call." },
    ])
    .returning();
  const [casa, seabreeze, bougainvillea, clarke, lakeway, loggia] = estateRows;

  const contactRows = await db
    .insert(s.contacts)
    .values([
      { orgId, estateId: casa.id, name: "Catherine Whitlock", role: "homeowner", email: "catherine.whitlock@example.com", phone: "(917) 555-0171", isPrimary: true },
      { orgId, estateId: casa.id, name: "Daniel Reyes", role: "home_manager", email: "daniel.reyes@example.com", phone: "(561) 555-0172" },
      { orgId, estateId: seabreeze.id, name: "Elaine Marsh", role: "homeowner", email: "elaine.marsh@example.com", phone: "(203) 555-0144", isPrimary: true, smsOptIn: false },
      { orgId, estateId: seabreeze.id, name: "Priya Natarajan", role: "assistant", email: "priya.n@example.com", phone: "(203) 555-0145" },
      { orgId, estateId: bougainvillea.id, name: "Jonathan Keller", role: "homeowner", email: "jkeller@example.com", phone: "(312) 555-0188", isPrimary: true },
      { orgId, estateId: bougainvillea.id, name: "Marisol Ortega", role: "home_manager", email: "marisol.ortega@example.com", phone: "(561) 555-0189" },
      { orgId, estateId: clarke.id, name: "Anne-Marie Dupont", role: "homeowner", email: "am.dupont@example.com", phone: "(646) 555-0120", isPrimary: true },
      { orgId, estateId: lakeway.id, name: "William Hartigan", role: "homeowner", email: "w.hartigan@example.com", phone: "(617) 555-0133", isPrimary: true },
      { orgId, estateId: lakeway.id, name: "Tom Beckett", role: "home_manager", email: "tom.beckett@example.com", phone: "(561) 555-0134" },
      { orgId, estateId: loggia.id, name: "Sofia Lindqvist", role: "homeowner", email: "sofia.l@example.com", phone: "(415) 555-0199", isPrimary: true, emailOptIn: false },
    ])
    .returning();
  const primary = (estateId: string) => contactRows.find((c) => c.estateId === estateId && c.isPrimary)!;

  const vendorRows = await db
    .insert(s.vendors)
    .values([
      { orgId, name: "Pristine Pools", trade: "Pool", contactName: "Marco Santini", phone: "(561) 555-0201", email: "marco@example.com", rating: 5, notes: "Best in the county. Marco texts back within minutes." },
      { orgId, name: "Coastal Greenscapes", trade: "Landscape", contactName: "Luis Herrera", phone: "(561) 555-0202", email: "luis@example.com", rating: 4, notes: "Crew of four on Tuesdays. Ask for Luis on anything with the palms." },
      { orgId, name: "Island Air", trade: "HVAC", contactName: "Kevin Doyle", phone: "(561) 555-0203", email: "kevin@example.com", rating: 4 },
      { orgId, name: "Palm Electric", trade: "Electrical", contactName: "Ray Castellano", phone: "(561) 555-0204", email: "ray@example.com", rating: 5, notes: "Did the original build at Casa Palma and Seabreeze." },
      { orgId, name: "ClearView Window Care", trade: "Windows", contactName: "Dana Whitfield", phone: "(561) 555-0205", email: "dana@example.com", rating: 3, notes: "Missed two scheduled dates in August. Watch closely. Dana does not read texts; email only.", notifySms: false },
      { orgId, name: "Harbor Pest Control", trade: "Pest", contactName: "Sam Okafor", phone: "(561) 555-0206", email: "sam@example.com", rating: 4 },
      { orgId, name: "Atlantic Generator Service", trade: "Generator", contactName: "Pete Lindgren", phone: "(561) 555-0207", email: "pete@example.com", rating: 5 },
      { orgId, name: "SmartHome Integrations", trade: "Smart home", contactName: "Alex Chen", phone: "(561) 555-0208", email: "alex@example.com", rating: 4 },
      { orgId, name: "Royal Palm Housekeeping", trade: "Housekeeping", contactName: "Gloria Mendes", phone: "(561) 555-0209", email: "gloria@example.com", rating: 5 },
      { orgId, name: "Sunstate Roofing", trade: "Roof", contactName: "Bill Harmon", phone: null, email: "bill@example.com", rating: 4, notes: "Office line only. Dispatch goes to Bill by email." },
    ])
    .returning();
  const V = Object.fromEntries(vendorRows.map((v) => [v.trade, v]));

  const serviceRows = await db
    .insert(s.serviceTypes)
    .values([
      { orgId, name: "Weekly pool service", trade: "Pool", durationMin: 45, minPhotos: 2, instructions: "Photograph the equipment pad and the pool surface before you leave. Note the water level every visit.", checklist: [
        { key: "skim", label: "Skimmed and brushed" }, { key: "vacuum", label: "Vacuumed" }, { key: "chem", label: "Chemistry tested and balanced" }, { key: "filter", label: "Filter cleaned or backwashed" }, { key: "equip", label: "Pump and heater checked", photo: true }, { key: "level", label: "Water level checked" } ] },
      { orgId, name: "Landscape maintenance", trade: "Landscape", durationMin: 120, minPhotos: 2, instructions: "Blow off the driveway and pool deck last. Photograph the front elevation and the pool garden.", checklist: [
        { key: "mow", label: "Mowed and edged" }, { key: "hedge", label: "Hedges trimmed" }, { key: "beds", label: "Beds weeded" }, { key: "irrig", label: "Irrigation checked" }, { key: "debris", label: "Debris removed" }, { key: "palms", label: "Palms inspected" } ] },
      { orgId, name: "HVAC quarterly service", trade: "HVAC", durationMin: 90, minPhotos: 2, instructions: "Photograph each air handler closet and the condensate line after clearing.", checklist: [
        { key: "filters", label: "Filters replaced" }, { key: "coils", label: "Coils cleaned" }, { key: "refrig", label: "Refrigerant checked" }, { key: "cond", label: "Condensate lines cleared", photo: true }, { key: "stat", label: "Thermostats tested" } ] },
      { orgId, name: "Generator monthly test", trade: "Generator", durationMin: 40, minPhotos: 1, instructions: "Run the exercise cycle for 20 minutes under load. Photograph the control panel readout.", checklist: [
        { key: "run", label: "Exercise run completed" }, { key: "oil", label: "Oil and coolant checked" }, { key: "batt", label: "Battery tested" }, { key: "switch", label: "Transfer switch verified" }, { key: "fuel", label: "Fuel level recorded", photo: true } ] },
      { orgId, name: "Window and facade cleaning", trade: "Windows", durationMin: 240, minPhotos: 3, instructions: "Interior windows only with the house manager present.", checklist: [
        { key: "ext", label: "Exterior windows" }, { key: "int", label: "Interior windows" }, { key: "screens", label: "Screens" }, { key: "tracks", label: "Tracks and sills" }, { key: "glass", label: "Balcony glass" } ] },
      { orgId, name: "Pest control quarterly", trade: "Pest", durationMin: 60, minPhotos: 1, checklist: [
        { key: "perim", label: "Exterior perimeter treated" }, { key: "int", label: "Interior inspection" }, { key: "bait", label: "Bait stations checked" }, { key: "seal", label: "Entry points sealed" }, { key: "termite", label: "Termite monitors checked" } ] },
      { orgId, name: "Electrical service call", trade: "Electrical", durationMin: 90, minPhotos: 2, instructions: "Before and after photos of anything you open.", checklist: [
        { key: "diag", label: "Issue diagnosed" }, { key: "repair", label: "Repair completed", photo: true }, { key: "panel", label: "Panel inspected" }, { key: "gfci", label: "GFCI outlets tested" } ] },
      { orgId, name: "Smart home check", trade: "Smart home", durationMin: 60, minPhotos: 1, checklist: [
        { key: "net", label: "Network tested" }, { key: "cams", label: "Cameras verified" }, { key: "scenes", label: "Lighting and shade scenes" }, { key: "rack", label: "AV rack checked" }, { key: "updates", label: "Software updated" } ] },
      { orgId, name: "Housekeeping deep clean", trade: "Housekeeping", durationMin: 300, minPhotos: 2, checklist: [
        { key: "kitchen", label: "Kitchen" }, { key: "baths", label: "Bathrooms" }, { key: "floors", label: "Floors" }, { key: "linens", label: "Linens changed" }, { key: "supplies", label: "Supplies inventoried" } ] },
      { orgId, name: "Storm preparation", trade: "Landscape", durationMin: 180, minPhotos: 4, instructions: "Photograph every elevation when finished.", checklist: [
        { key: "shutters", label: "Shutters deployed" }, { key: "loose", label: "Loose items secured" }, { key: "fuel", label: "Generator fuel topped" }, { key: "pool", label: "Pool equipment secured" }, { key: "elev", label: "All elevations photographed", photo: true } ] },
    ])
    .returning();
  const S = Object.fromEntries(serviceRows.map((t) => [t.name, t]));

  // Preferred vendor per trade at each estate
  const assignments: { estate: s.Estate; trades: string[] }[] = [
    { estate: casa, trades: ["Pool", "Landscape", "HVAC", "Electrical", "Generator", "Pest", "Smart home", "Housekeeping"] },
    { estate: seabreeze, trades: ["Pool", "Landscape", "HVAC", "Electrical", "Housekeeping", "Windows"] },
    { estate: bougainvillea, trades: ["Pool", "Landscape", "HVAC", "Housekeeping", "Pest"] },
    { estate: clarke, trades: ["Pool", "Landscape", "Electrical", "Pest"] },
    { estate: lakeway, trades: ["Pool", "Landscape", "HVAC", "Generator", "Roof"] },
    { estate: loggia, trades: ["Pool", "Landscape", "Windows", "Smart home"] },
  ];
  await db.insert(s.estateVendors).values(
    assignments.flatMap((a) => a.trades.map((trade) => ({ orgId, estateId: a.estate.id, vendorId: V[trade].id, trade }))),
  );

  // Recurring schedules
  await db.insert(s.recurringSchedules).values([
    ...estateRows.map((e, n) => ({ orgId, estateId: e.id, vendorId: V["Pool"].id, serviceTypeId: S["Weekly pool service"].id, cadence: "weekly", weekday: (n % 5) + 1, window: "morning", nextAt: at(((n % 5) + 1), 9) })),
    ...estateRows.map((e, n) => ({ orgId, estateId: e.id, vendorId: V["Landscape"].id, serviceTypeId: S["Landscape maintenance"].id, cadence: "weekly", weekday: ((n + 1) % 5) + 1, window: "morning", nextAt: at(((n + 1) % 5) + 1, 8) })),
    { orgId, estateId: lakeway.id, vendorId: V["Generator"].id, serviceTypeId: S["Generator monthly test"].id, cadence: "monthly", weekday: 2, window: "afternoon", nextAt: at(12, 14) },
    { orgId, estateId: casa.id, vendorId: V["Generator"].id, serviceTypeId: S["Generator monthly test"].id, cadence: "monthly", weekday: 3, window: "afternoon", nextAt: at(18, 14) },
    { orgId, estateId: casa.id, vendorId: V["Pest"].id, serviceTypeId: S["Pest control quarterly"].id, cadence: "monthly", weekday: 4, window: "afternoon", nextAt: at(25, 13) },
  ]);

  type VisitSeed = {
    estate: s.Estate;
    vendorTrade: string;
    service: string;
    day: number;
    hour: number;
    window?: string;
    status: s.Visit["status"] | string;
    items?: string[];
    note?: string | null;
    attention?: string;
    attentionNote?: string | null;
    ownerAction?: "fyi" | "decision" | "call";
    photos?: { url: string; caption: string }[];
    response?: { choice: string; message?: string };
    requestedBy?: string;
    requestNote?: string;
    durationMin?: number;
  };

  const photoSets = {
    pool: [
      { url: "/estates/loggia-ocean.jpg", caption: "Pool surface after service" },
      { url: "/estates/courtyard-modern.jpg", caption: "Equipment pad" },
    ],
    landscape: [
      { url: "/estates/estate-bougainvillea.jpg", caption: "Front elevation" },
      { url: "/estates/aerial-oceanfront.jpg", caption: "Pool garden" },
    ],
    interior: [
      { url: "/estates/kitchen-marble.jpg", caption: "Kitchen" },
      { url: "/estates/living-ocean.jpg", caption: "Living room" },
    ],
  };

  const visitSeeds: VisitSeed[] = [
    // Past, completed and sent
    { estate: casa, vendorTrade: "Pool", service: "Weekly pool service", day: -14, hour: 9, status: "sent", items: ["skim", "vacuum", "chem", "filter", "equip", "level"], note: null, attention: "none", photos: photoSets.pool },
    { estate: casa, vendorTrade: "Landscape", service: "Landscape maintenance", day: -13, hour: 8, status: "sent", items: ["mow", "hedge", "beds", "irrig", "debris", "palms"], note: "Two irrigation heads replaced in the front beds.", attention: "none", photos: photoSets.landscape },
    { estate: casa, vendorTrade: "Pool", service: "Weekly pool service", day: -7, hour: 9, status: "sent", items: ["skim", "vacuum", "chem", "filter", "equip", "level"], attention: "note", attentionNote: "The pool heater is running a little loud. We will keep an eye on it.", photos: photoSets.pool },
    { estate: seabreeze, vendorTrade: "Housekeeping", service: "Housekeeping deep clean", day: -10, hour: 9, status: "sent", items: ["kitchen", "baths", "floors", "linens", "supplies"], note: "Guest linens are low. Two sets left.", attention: "decision", attentionNote: "Guest bath linens are down to two sets. We can order a replacement set from the usual supplier for about $640.", ownerAction: "decision", photos: photoSets.interior, response: { choice: "Go ahead and handle it" } },
    { estate: seabreeze, vendorTrade: "Landscape", service: "Landscape maintenance", day: -6, hour: 8, status: "sent", items: ["mow", "hedge", "beds", "irrig", "debris", "palms"], attention: "none", photos: photoSets.landscape },
    { estate: bougainvillea, vendorTrade: "HVAC", service: "HVAC quarterly service", day: -9, hour: 13, status: "sent", items: ["filters", "coils", "refrig", "cond", "stat"], attention: "none", photos: photoSets.interior },
    { estate: bougainvillea, vendorTrade: "Pool", service: "Weekly pool service", day: -3, hour: 9, status: "sent", items: ["skim", "vacuum", "chem", "filter", "equip", "level"], attention: "none", photos: photoSets.pool },
    { estate: clarke, vendorTrade: "Pest", service: "Pest control quarterly", day: -12, hour: 14, status: "sent", items: ["perim", "int", "bait", "seal", "termite"], note: "Ant activity at the kitchen slider. Treated and sealed.", attention: "none", photos: photoSets.interior },
    { estate: lakeway, vendorTrade: "Generator", service: "Generator monthly test", day: -18, hour: 14, status: "sent", items: ["run", "oil", "batt", "switch", "fuel"], attention: "none", photos: photoSets.landscape },
    { estate: lakeway, vendorTrade: "Pool", service: "Weekly pool service", day: -4, hour: 10, status: "sent", items: ["skim", "vacuum", "chem", "filter", "equip", "level"], attention: "none", photos: photoSets.pool },
    { estate: loggia, vendorTrade: "Windows", service: "Window and facade cleaning", day: -8, hour: 9, status: "sent", items: ["ext", "screens", "tracks", "glass"], note: "Interior not done, nobody home to let us in.", attention: "note", attentionNote: "Interior windows were not done because no one was home. We will schedule them with you.", photos: photoSets.landscape },
    { estate: loggia, vendorTrade: "Smart home", service: "Smart home check", day: -2, hour: 15, status: "sent", items: ["net", "cams", "scenes", "rack", "updates"], attention: "none", photos: photoSets.interior },
    { estate: clarke, vendorTrade: "Pool", service: "Weekly pool service", day: -1, hour: 9, status: "sent", items: ["skim", "vacuum", "chem", "filter", "equip", "level"], attention: "none", photos: photoSets.pool },

    // Awaiting approval (the queue)
    { estate: casa, vendorTrade: "Pool", service: "Weekly pool service", day: 0, hour: 9, status: "submitted", items: ["skim", "vacuum", "chem", "filter", "equip"], note: "water low again, about 2 inches under the tile line. pump seal weeping a bit", attention: "decision", attentionNote: "The pump seal is starting to weep. Marco can replace it on the next visit for $380, or we can watch it another week.", photos: photoSets.pool, durationMin: 50 },
    { estate: lakeway, vendorTrade: "HVAC", service: "HVAC quarterly service", day: 0, hour: 8, status: "submitted", items: ["filters", "coils", "cond", "stat"], note: "condensate pan in the attic unit was overflowing. cleared it, drywall below is wet", attention: "urgent", attentionNote: "The attic air handler condensate pan overflowed and the ceiling drywall below is wet. The line is cleared but the drywall needs to dry out and be checked.", photos: photoSets.interior, durationMin: 95 },
    { estate: seabreeze, vendorTrade: "Landscape", service: "Landscape maintenance", day: 0, hour: 8, status: "submitted", items: ["mow", "hedge", "beds", "irrig", "debris", "palms"], note: null, attention: "none", photos: photoSets.landscape, durationMin: 110 },

    // On site right now
    { estate: bougainvillea, vendorTrade: "Housekeeping", service: "Housekeeping deep clean", day: 0, hour: 9, status: "in_progress" },

    // Later today
    { estate: loggia, vendorTrade: "Pool", service: "Weekly pool service", day: 0, hour: 14, window: "afternoon", status: "scheduled" },
    { estate: clarke, vendorTrade: "Electrical", service: "Electrical service call", day: 0, hour: 15, window: "afternoon", status: "scheduled", requestedBy: "owner", requestNote: "Outdoor outlets by the pool bar keep tripping." },

    // Tomorrow and this week
    { estate: casa, vendorTrade: "Landscape", service: "Landscape maintenance", day: 1, hour: 8, status: "scheduled" },
    { estate: seabreeze, vendorTrade: "Pool", service: "Weekly pool service", day: 1, hour: 9, status: "scheduled" },
    { estate: lakeway, vendorTrade: "Generator", service: "Generator monthly test", day: 1, hour: 14, window: "afternoon", status: "scheduled" },
    { estate: bougainvillea, vendorTrade: "Landscape", service: "Landscape maintenance", day: 2, hour: 8, status: "scheduled" },
    { estate: loggia, vendorTrade: "Windows", service: "Window and facade cleaning", day: 2, hour: 9, status: "scheduled", requestedBy: "owner", requestNote: "Interior windows, I will be home Thursday." },
    { estate: clarke, vendorTrade: "Landscape", service: "Landscape maintenance", day: 3, hour: 8, status: "scheduled" },
    { estate: casa, vendorTrade: "Smart home", service: "Smart home check", day: 4, hour: 13, window: "afternoon", status: "scheduled" },

    // Requested, not yet scheduled
    { estate: lakeway, vendorTrade: "Roof", service: "Storm preparation", day: 5, hour: 9, status: "requested", requestedBy: "office", requestNote: "Tom asked for a roof look before the next front comes through." },
  ];

  // Everything below is buffered and written in one statement per table.
  // The reset runs on every sign-in, so round trips are the whole cost.
  type Ins<T extends { $inferInsert: unknown }> = T["$inferInsert"];
  const bufActivity: Ins<typeof s.activity>[] = [];
  const bufNotes: Ins<typeof s.notifications>[] = [];
  const bufReports: Ins<typeof s.reports>[] = [];
  const bufPhotos: Ins<typeof s.photos>[] = [];
  const bufResponses: Ins<typeof s.responses>[] = [];
  const bufTasks: Ins<typeof s.tasks>[] = [];

  const prepared = visitSeeds.map((vs) => {
    const vendor = V[vs.vendorTrade];
    const service = S[vs.service];
    const scheduledFor = at(vs.day, vs.hour);
    const duration = vs.durationMin ?? service.durationMin;
    const done = ["sent", "approved", "submitted", "closed"].includes(vs.status);
    const seq = visitSeeds.indexOf(vs);
    const lateMin = vs.vendorTrade === "Windows" ? 48 : vs.vendorTrade === "Landscape" && seq % 2 ? 24 : [3, 7, 11, 2, 15, 6, 9][seq % 7];
    const lagMin = vs.vendorTrade === "Pool" ? [2, 3, 5][seq % 3] : vs.vendorTrade === "HVAC" ? 12 : [4, 8, 6, 18, 5][seq % 5];
    const arrivedAt = done || vs.status === "in_progress" ? new Date(scheduledFor.getTime() + lateMin * 60000) : null;
    const completedAt = done ? new Date(arrivedAt!.getTime() + duration * 60000) : null;
    const submittedAt = done ? new Date(completedAt!.getTime() + lagMin * 60000) : null;
    const approvedAt = vs.status === "sent" ? new Date(submittedAt!.getTime() + [38, 12, 55, 21][seq % 4] * 60000) : null;
    return { vs, vendor, service, scheduledFor, done, arrivedAt, completedAt, submittedAt, approvedAt };
  });

  const visitRows = await db
    .insert(s.visits)
    .values(
      prepared.map(({ vs, vendor, service, scheduledFor, arrivedAt, completedAt, submittedAt, approvedAt }) => ({
        orgId,
        estateId: vs.estate.id,
        vendorId: vendor.id,
        serviceTypeId: service.id,
        status: vs.status,
        scheduledFor,
        window: vs.window ?? "morning",
        requestedBy: vs.requestedBy ?? "office",
        requestNote: vs.requestNote ?? null,
        vendorOpenedAt: arrivedAt ? new Date(arrivedAt.getTime() - 20 * 60000) : null,
        arrivedAt,
        completedAt,
        submittedAt,
        approvedAt,
        sentAt: approvedAt,
      })),
    )
    .returning();

  prepared.forEach((pr, idx) => {
    const { vs, vendor, service, scheduledFor, done, arrivedAt, completedAt, submittedAt, approvedAt } = pr;
    const visit = visitRows[idx];
    bufActivity.push({ orgId, estateId: vs.estate.id, visitId: visit.id, kind: "scheduled", message: `${service.name} scheduled with ${vendor.name}`, actor: vs.requestedBy === "owner" ? "owner" : "office", createdAt: new Date(scheduledFor.getTime() - 3 * 86400000) });

    if (vs.status !== "requested") {
      const body = vendorDispatchSms({ orgName: org.name, vendorContact: vendor.contactName ?? vendor.name, estateName: vs.estate.name, address: `${vs.estate.address1}, ${vs.estate.city}`, scheduledFor, window: vs.window ?? "morning", serviceName: service.name, baseUrl, vendorToken: visit.vendorToken });
      const when = new Date(scheduledFor.getTime() - 15 * 3600000);
      if (vendor.notifySms && vendor.phone) bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "vendor", channel: "sms", to: vendor.phone, toName: vendor.contactName, body, status: "sent", ruleKey: "vendor_dispatch", createdAt: when });
      if (vendor.notifyEmail && vendor.email) bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "vendor", channel: "email", to: vendor.email, toName: vendor.contactName, subject: `${service.name} at ${vs.estate.name}`, body, status: "sent", ruleKey: "vendor_dispatch", createdAt: when });
    }

    if (arrivedAt) bufActivity.push({ orgId, estateId: vs.estate.id, visitId: visit.id, kind: "arrived", message: `${vendor.name} checked in on site`, actor: "vendor", createdAt: arrivedAt });

    if (done) {
      const attention = vs.attention ?? "none";
      const ownerAction = vs.ownerAction ?? (attention === "decision" ? "decision" : attention === "urgent" ? "call" : "fyi");
      const recap = composeRecap({
        estateName: vs.estate.name, serviceName: service.name, vendorName: vendor.name, arrivedAt, completedAt,
        checklist: service.checklist, items: vs.items ?? [], vendorNote: vs.note ?? null, attention, attentionNote: vs.attentionNote ?? null,
      });
      const decision = defaultDecision(attention, vs.attentionNote ?? null);
      bufReports.push({
        visitId: visit.id, items: vs.items ?? [], vendorNote: vs.note ?? null, attention, attentionNote: vs.attentionNote ?? null,
        recapDraft: recap, recapFinal: vs.status === "sent" ? recap : null, ownerAction,
        decisionPrompt: decision.prompt || null, decisionOptions: decision.options, approvedBy: vs.status === "sent" ? lauren.name : null,
        createdAt: submittedAt!, updatedAt: approvedAt ?? submittedAt!,
      });
      (vs.photos ?? []).forEach((ph, n) => bufPhotos.push({ visitId: visit.id, url: ph.url, caption: ph.caption, sort: n, createdAt: completedAt! }));
      bufActivity.push({ orgId, estateId: vs.estate.id, visitId: visit.id, kind: "filed", message: `${vendor.name} filed the report${attention === "urgent" ? " and flagged it urgent" : attention === "decision" ? " with a decision for the owner" : ""}`, actor: "vendor", createdAt: submittedAt! });
      if (attention === "urgent") {
        bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "office", channel: "sms", to: siobhan.phone!, toName: siobhan.name, body: `${org.name}: URGENT at ${vs.estate.name}. ${vendor.name} flagged: ${vs.attentionNote} ${baseUrl}/visits/${visit.id}`, status: "sent", ruleKey: "urgent_to_principal", createdAt: submittedAt! });
      }
      bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "office", channel: "email", to: lauren.email, toName: lauren.name, subject: `Report filed: ${service.name} at ${vs.estate.name}`, body: `${vendor.name} filed a report for ${vs.estate.name}. Review it: ${baseUrl}/visits/${visit.id}`, status: "sent", ruleKey: "report_filed_office", createdAt: submittedAt! });

      if (vs.status === "sent") {
        const contact = primary(vs.estate.id);
        const input = {
          baseUrl, orgName: org.name, orgPhone: org.phone, estateName: vs.estate.name, serviceName: service.name, vendorName: vendor.name,
          completedAt, recap, ownerAction, decisionPrompt: decision.prompt, decisionOptions: decision.options, photos: vs.photos ?? [], ownerToken: visit.ownerToken, contactName: contact.name,
        };
        bufActivity.push({ orgId, estateId: vs.estate.id, visitId: visit.id, kind: "approved", message: `${lauren.name} approved the report and it was sent to ${contact.name}`, actor: "office", createdAt: approvedAt! });
        if (contact.smsOptIn && contact.phone) bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "owner", channel: "sms", to: contact.phone, toName: contact.name, body: ownerSms(input), status: "sent", ruleKey: "approved_send_owner", createdAt: approvedAt! });
        if (contact.emailOptIn && contact.email) bufNotes.push({ orgId, visitId: visit.id, estateId: vs.estate.id, audience: "owner", channel: "email", to: contact.email, toName: contact.name, subject: ownerEmailSubject(input), body: recap, html: ownerEmailHtml(input), status: "sent", ruleKey: "approved_send_owner", createdAt: approvedAt! });
        if (vs.response) {
          const respondedAt = new Date(approvedAt!.getTime() + 52 * 60000);
          bufResponses.push({ visitId: visit.id, contactId: contact.id, channel: "sms", choice: vs.response.choice, message: vs.response.message ?? null, createdAt: respondedAt });
          bufActivity.push({ orgId, estateId: vs.estate.id, visitId: visit.id, kind: "replied", message: `${contact.name} replied: ${vs.response.choice}`, actor: "owner", createdAt: respondedAt });
          bufTasks.push({ orgId, estateId: vs.estate.id, visitId: visit.id, title: `Order guest bath linens for ${vs.estate.name}`, detail: `${contact.name} approved the replacement set (about $640). Order from the usual supplier and schedule delivery with Priya.`, status: "done", source: "owner_reply", createdAt: respondedAt, doneAt: new Date(respondedAt.getTime() + 3 * 3600000) });
        }
      }
    }
  });

  if (bufReports.length) await db.insert(s.reports).values(bufReports);
  if (bufPhotos.length) await db.insert(s.photos).values(bufPhotos);
  if (bufResponses.length) await db.insert(s.responses).values(bufResponses);
  if (bufNotes.length) await db.insert(s.notifications).values(bufNotes);
  if (bufActivity.length) await db.insert(s.activity).values(bufActivity);
  if (bufTasks.length) await db.insert(s.tasks).values(bufTasks);

  // Open tasks
  await db.insert(s.tasks).values([
    { orgId, estateId: casa.id, title: "Confirm Catherine's arrival date for November", detail: "Daniel thinks the 14th. Housekeeping and pool need to be scheduled around it.", status: "open", source: "office", dueAt: at(2, 17) },
    { orgId, estateId: loggia.id, title: "Schedule interior windows with Sofia", detail: "She is home Thursday. ClearView can do the interior that morning.", status: "open", source: "automation", dueAt: at(1, 12) },
    { orgId, estateId: clarke.id, title: "Follow up on the pool bar outlets", detail: "Ray is out this afternoon. Let Anne-Marie know what he found.", status: "open", source: "office", dueAt: at(0, 18) },
  ]);

  // An owner request that came in by text
  const sofia = primary(loggia.id);
  await db.insert(s.ownerRequests).values([
    { orgId, estateId: loggia.id, contactId: sofia.id, channel: "sms", message: "The ocean side gate is sticking badly now. Can someone look at it this week?", status: "new", createdAt: at(0, 7, 42) },
    { orgId, estateId: casa.id, contactId: primary(casa.id).id, channel: "email", message: "We will have twelve guests the weekend of the 24th. Please have the house ready and the pool heated.", status: "new", createdAt: at(-1, 21, 10) },
  ]);
  await db.insert(s.activity).values([
    { orgId, estateId: loggia.id, kind: "request", message: `${sofia.name} texted a request about the ocean side gate`, actor: "owner", createdAt: at(0, 7, 42) },
  ]);

  // Automation rules
  await db.insert(s.automationRules).values([
    { orgId, key: "vendor_dispatch", name: "Dispatch the vendor", description: "Text the vendor the visit link the evening before, and again one hour before the window opens.", trigger: "schedule", config: { hours: 1, recipient: "vendor", channel: "sms" } },
    { orgId, key: "vendor_no_show", name: "No-show watch", description: "If the vendor has not opened the link 30 minutes into the window, text the vendor and alert the office.", trigger: "schedule", config: { minutes: 30, recipient: "office", channel: "sms" } },
    { orgId, key: "report_filed_office", name: "Report filed", description: "Tell the office the moment a vendor files a report.", trigger: "event", config: { recipient: "office", channel: "email" } },
    { orgId, key: "urgent_to_principal", name: "Urgent goes to Siobhan", description: "Anything a vendor flags as urgent texts Siobhan immediately, day or night.", trigger: "event", config: { recipient: "owner_user", channel: "sms" } },
    { orgId, key: "unapproved_report", name: "Waiting too long", description: "A report sitting unapproved for more than 2 hours pings the office again.", trigger: "schedule", config: { hours: 2, recipient: "office", channel: "sms" } },
    { orgId, key: "approved_send_owner", name: "Send to the homeowner", description: "When the office approves a report, the homeowner gets the text and the email with photos.", trigger: "event", config: { recipient: "homeowner", channel: "both" } },
    { orgId, key: "owner_reply_task", name: "Homeowner replied", description: "A homeowner reply becomes a task for the office and the office is notified.", trigger: "event", config: { recipient: "office", channel: "sms" } },
    { orgId, key: "owner_request_intake", name: "Requests by text", description: "A text or email from a homeowner that is not a reply becomes a request in the inbox.", trigger: "event", config: { recipient: "office", channel: "email" } },
    { orgId, key: "unfiled_report", name: "Unfiled by evening", description: "If a visit ends with no report by 6 pm, remind the vendor and flag the office.", trigger: "schedule", config: { hours: 18, recipient: "vendor", channel: "sms" } },
    { orgId, key: "unanswered_decision", name: "Unanswered decision", description: "A decision with no reply after 3 days gets one gentle follow-up text.", trigger: "schedule", config: { days: 3, recipient: "homeowner", channel: "sms" } },
    { orgId, key: "quiet_hours", name: "Quiet hours", description: "Routine homeowner messages are held between 8 pm and 7 am and released in the morning. Urgent messages are never held.", trigger: "schedule", config: {} },
    { orgId, key: "overdue_recurring", name: "Missed recurring service", description: "A recurring service overdue by 2 days flags the office. At 5 days it goes to Siobhan.", trigger: "schedule", config: { days: 2, recipient: "office", channel: "sms" } },
    { orgId, key: "monthly_summary", name: "Monthly summary", description: "On the first of the month, each homeowner gets a one-page summary of every visit.", trigger: "schedule", config: { recipient: "homeowner", channel: "email" } },
  ]);
}
