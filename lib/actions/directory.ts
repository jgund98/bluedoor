"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema as s } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notify, baseUrl as getBaseUrl } from "@/lib/notify";
import { notifyVendor } from "@/lib/vendor-notify";
import { str, strOrNull } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
import type { ChecklistItem } from "@/lib/db/schema";

async function log(orgId: string, estateId: string | null, kind: string, message: string, actor = "office") {
  const db = await getDb();
  await db.insert(s.activity).values({ orgId, estateId, kind, message, actor });
}

/* ---------------- Estates ---------------- */

export async function createEstate(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const name = str(formData.get("name"));
  if (!name) redirect("/estates/new?error=name");

  const [estate] = await db
    .insert(s.estates)
    .values({
      orgId: user.orgId,
      name,
      address1: strOrNull(formData.get("address1")),
      city: strOrNull(formData.get("city")),
      state: strOrNull(formData.get("state")) ?? "FL",
      zip: strOrNull(formData.get("zip")),
      gateCode: strOrNull(formData.get("gateCode")),
      accessNotes: strOrNull(formData.get("accessNotes")),
      notes: strOrNull(formData.get("notes")),
      coverImage: strOrNull(formData.get("coverImage")) ?? "/estates/estate-colonial.jpg",
    })
    .returning();

  // People
  type P = { name: string; role: string; email: string; phone: string; sms: boolean; emailOk: boolean };
  let people: P[] = [];
  try {
    people = JSON.parse(str(formData.get("people")) || "[]");
  } catch {}
  const valid = people.filter((p) => p.name?.trim());
  if (valid.length) {
    await db.insert(s.contacts).values(
      valid.map((p, n) => ({ orgId: user.orgId, estateId: estate.id, name: p.name.trim(), role: p.role || "homeowner", email: p.email?.trim() || null, phone: p.phone?.trim() || null, smsOptIn: p.sms !== false, emailOptIn: p.emailOk !== false, isPrimary: n === 0 })),
    );
  }

  // Vendor assignments: fields named vendor[Trade]
  const assignments: { trade: string; vendorId: string }[] = [];
  for (const [k, v] of formData.entries()) {
    const m = /^vendor\[(.+)\]$/.exec(k);
    if (m && typeof v === "string" && v) assignments.push({ trade: m[1], vendorId: v });
  }
  if (assignments.length) await db.insert(s.estateVendors).values(assignments.map((a) => ({ orgId: user.orgId, estateId: estate.id, vendorId: a.vendorId, trade: a.trade })));

  // Recurring services: fields named recurring[serviceTypeId]=cadence
  const recurring: { serviceTypeId: string; cadence: string }[] = [];
  for (const [k, v] of formData.entries()) {
    const m = /^recurring\[(.+)\]$/.exec(k);
    if (m && typeof v === "string" && v && v !== "none") recurring.push({ serviceTypeId: m[1], cadence: v });
  }
  if (recurring.length) {
    const services = await db.select().from(s.serviceTypes).where(eq(s.serviceTypes.orgId, user.orgId));
    const rows = recurring
      .map((r) => {
        const svc = services.find((t) => t.id === r.serviceTypeId);
        const vendorId = assignments.find((a) => a.trade === svc?.trade)?.vendorId;
        if (!svc || !vendorId) return null;
        return { orgId: user.orgId, estateId: estate.id, vendorId, serviceTypeId: svc.id, cadence: r.cadence, weekday: 2, window: "morning", nextAt: new Date(Date.now() + 7 * 86400000) };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
    if (rows.length) await db.insert(s.recurringSchedules).values(rows);
  }

  await log(user.orgId, estate.id, "estate_added", `${user.name} onboarded ${estate.name}`);

  // Welcome message to the primary contact
  const primary = valid[0];
  if (primary && formData.get("sendWelcome") === "on") {
    const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, user.orgId));
    const [contact] = await db.select().from(s.contacts).where(and(eq(s.contacts.estateId, estate.id), eq(s.contacts.isPrimary, true)));
    const base = await getBaseUrl();
    const text = `${org.name}: ${primary.name.split(" ")[0]}, your home at ${estate.name} is now under our estate management. You will receive a short note after each service visit. Your private page: ${base}/home/${contact.portalToken}`;
    if (primary.phone && primary.sms !== false) await notify({ orgId: user.orgId, audience: "owner", channel: "sms", to: primary.phone, toName: primary.name, body: text, estateId: estate.id, ruleKey: "welcome" });
    if (primary.email && primary.emailOk !== false) await notify({ orgId: user.orgId, audience: "owner", channel: "email", to: primary.email, toName: primary.name, subject: `Welcome to estate management at ${estate.name}`, body: text, estateId: estate.id, ruleKey: "welcome" });
  }

  revalidatePath("/", "layout");
  redirect(`/estates/${estate.id}?welcome=1`);
}

export async function updateEstate(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = str(formData.get("estateId"));
  await db
    .update(s.estates)
    .set({
      name: str(formData.get("name")) || undefined,
      address1: strOrNull(formData.get("address1")),
      city: strOrNull(formData.get("city")),
      state: strOrNull(formData.get("state")),
      zip: strOrNull(formData.get("zip")),
      gateCode: strOrNull(formData.get("gateCode")),
      accessNotes: strOrNull(formData.get("accessNotes")),
      notes: strOrNull(formData.get("notes")),
      status: str(formData.get("status")) || "active",
      coverImage: strOrNull(formData.get("coverImage")),
    })
    .where(and(eq(s.estates.id, id), eq(s.estates.orgId, user.orgId)));
  revalidatePath("/", "layout");
  redirect(`/estates/${id}`);
}

export async function saveContact(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  const contactId = strOrNull(formData.get("contactId"));
  const values = {
    name: str(formData.get("name")),
    role: str(formData.get("role")) || "homeowner",
    email: strOrNull(formData.get("email")),
    phone: strOrNull(formData.get("phone")),
    smsOptIn: formData.get("smsOptIn") === "on",
    emailOptIn: formData.get("emailOptIn") === "on",
    isPrimary: formData.get("isPrimary") === "on",
  };
  if (!values.name) redirect(`/estates/${estateId}`);
  if (values.isPrimary) await db.update(s.contacts).set({ isPrimary: false }).where(eq(s.contacts.estateId, estateId));
  if (contactId) await db.update(s.contacts).set(values).where(eq(s.contacts.id, contactId));
  else await db.insert(s.contacts).values({ orgId: user.orgId, estateId, ...values });
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=people`);
}

export async function removeContact(formData: FormData) {
  await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  await db.delete(s.contacts).where(eq(s.contacts.id, str(formData.get("contactId"))));
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=people`);
}

export async function setAssignment(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  const trade = str(formData.get("trade"));
  const vendorId = str(formData.get("vendorId"));
  await db.delete(s.estateVendors).where(and(eq(s.estateVendors.estateId, estateId), eq(s.estateVendors.trade, trade)));
  if (vendorId) {
    await db.insert(s.estateVendors).values({ orgId: user.orgId, estateId, vendorId, trade });
    const [v] = await db.select().from(s.vendors).where(eq(s.vendors.id, vendorId));
    await log(user.orgId, estateId, "vendor_assigned", `${v?.name} assigned for ${trade.toLowerCase()}`);
  }
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=vendors`);
}

export async function saveRecurring(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  const serviceTypeId = str(formData.get("serviceTypeId"));
  const vendorId = str(formData.get("vendorId"));
  const cadence = str(formData.get("cadence")) || "weekly";
  const weekday = Number(str(formData.get("weekday")) || 2);
  const window = str(formData.get("window")) || "morning";
  if (serviceTypeId && vendorId) {
    const next = new Date();
    const delta = (weekday - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + delta);
    next.setHours(window === "afternoon" ? 13 : 9, 0, 0, 0);
    await db.insert(s.recurringSchedules).values({ orgId: user.orgId, estateId, serviceTypeId, vendorId, cadence, weekday, window, nextAt: next });
  }
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=services`);
}

export async function toggleRecurring(formData: FormData) {
  await requireUser();
  const db = await getDb();
  const id = str(formData.get("recurringId"));
  const estateId = str(formData.get("estateId"));
  const [r] = await db.select().from(s.recurringSchedules).where(eq(s.recurringSchedules.id, id));
  if (r) await db.update(s.recurringSchedules).set({ active: !r.active }).where(eq(s.recurringSchedules.id, id));
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=services`);
}

export async function removeRecurring(formData: FormData) {
  await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  await db.delete(s.recurringSchedules).where(eq(s.recurringSchedules.id, str(formData.get("recurringId"))));
  revalidatePath("/", "layout");
  redirect(`/estates/${estateId}?tab=services`);
}

/* ---------------- Vendors ---------------- */

export async function createVendor(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const name = str(formData.get("name"));
  const trade = str(formData.get("trade"));
  if (!name || !trade) redirect("/vendors/new?error=missing");
  const [vendor] = await db
    .insert(s.vendors)
    .values({
      orgId: user.orgId,
      name,
      trade,
      contactName: strOrNull(formData.get("contactName")),
      phone: strOrNull(formData.get("phone")),
      email: strOrNull(formData.get("email")),
      notes: strOrNull(formData.get("notes")),
      rating: Number(str(formData.get("rating"))) || null,
      notifySms: formData.get("notifySms") !== "off",
      notifyEmail: formData.get("notifyEmail") !== "off",
    })
    .returning();
  const estateIds = formData.getAll("estates").map(String).filter(Boolean);
  for (const estateId of estateIds) {
    await db.delete(s.estateVendors).where(and(eq(s.estateVendors.estateId, estateId), eq(s.estateVendors.trade, trade)));
    await db.insert(s.estateVendors).values({ orgId: user.orgId, estateId, vendorId: vendor.id, trade });
  }
  await log(user.orgId, null, "vendor_added", `${user.name} added ${vendor.name} (${trade})`);
  if (formData.get("sendInvite") === "on") {
    const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, user.orgId));
    const base = await getBaseUrl();
    await notifyVendor({
      orgId: user.orgId,
      vendor,
      subject: `You are set up with ${org.name}`,
      text: `${org.name}: ${vendor.contactName?.split(" ")[0] ?? "Hello"}, you are set up as our ${trade.toLowerCase()} vendor. Each visit will come to you with a link. Your schedule: ${base}/vendor/${vendor.token}`,
      ruleKey: "vendor_invite",
    });
  }
  revalidatePath("/", "layout");
  redirect(`/vendors/${vendor.id}?welcome=1`);
}

export async function updateVendor(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = str(formData.get("vendorId"));
  await db
    .update(s.vendors)
    .set({
      name: str(formData.get("name")) || undefined,
      trade: str(formData.get("trade")) || undefined,
      contactName: strOrNull(formData.get("contactName")),
      phone: strOrNull(formData.get("phone")),
      email: strOrNull(formData.get("email")),
      notes: strOrNull(formData.get("notes")),
      rating: Number(str(formData.get("rating"))) || null,
      status: str(formData.get("status")) || "active",
      notifySms: formData.get("notifySms") === "on",
      notifyEmail: formData.get("notifyEmail") === "on",
    })
    .where(and(eq(s.vendors.id, id), eq(s.vendors.orgId, user.orgId)));
  revalidatePath("/", "layout");
  redirect(`/vendors/${id}`);
}

/* ---------------- Service types ---------------- */

export async function saveServiceType(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = strOrNull(formData.get("serviceTypeId"));
  let checklist: ChecklistItem[] = [];
  try {
    checklist = JSON.parse(str(formData.get("checklist")) || "[]");
  } catch {}
  checklist = checklist
    .filter((c) => c.label?.trim())
    .map((c, n) => ({ key: c.key || `step_${n + 1}`, label: c.label.trim(), photo: Boolean(c.photo) }));
  const values = {
    name: str(formData.get("name")),
    trade: str(formData.get("trade")),
    instructions: strOrNull(formData.get("instructions")),
    checklist,
    minPhotos: Number(str(formData.get("minPhotos"))) || 1,
    durationMin: Number(str(formData.get("durationMin"))) || 60,
  };
  if (!values.name || !values.trade) redirect("/services");
  let targetId = id;
  if (id) await db.update(s.serviceTypes).set(values).where(eq(s.serviceTypes.id, id));
  else {
    const [row] = await db.insert(s.serviceTypes).values({ orgId: user.orgId, ...values }).returning();
    targetId = row.id;
  }
  revalidatePath("/", "layout");
  redirect(`/services/${targetId}`);
}

export async function deleteServiceType(formData: FormData) {
  await requireUser();
  const db = await getDb();
  await db.delete(s.serviceTypes).where(eq(s.serviceTypes.id, str(formData.get("serviceTypeId"))));
  revalidatePath("/", "layout");
  redirect("/services");
}

/* ---------------- Automations ---------------- */

export async function toggleRule(formData: FormData) {
  await requireUser();
  const db = await getDb();
  const id = str(formData.get("ruleId"));
  const [r] = await db.select().from(s.automationRules).where(eq(s.automationRules.id, id));
  if (r) await db.update(s.automationRules).set({ enabled: !r.enabled }).where(eq(s.automationRules.id, id));
  revalidatePath("/automations");
  redirect("/automations");
}

export async function updateRule(formData: FormData) {
  await requireUser();
  const db = await getDb();
  const id = str(formData.get("ruleId"));
  const [r] = await db.select().from(s.automationRules).where(eq(s.automationRules.id, id));
  if (!r) redirect("/automations");
  const config = { ...r.config };
  for (const k of ["hours", "minutes", "days"] as const) {
    const v = str(formData.get(k));
    if (v) config[k] = Number(v);
  }
  const recipient = str(formData.get("recipient"));
  if (recipient) config.recipient = recipient as typeof config.recipient;
  const channel = str(formData.get("channel"));
  if (channel) config.channel = channel as typeof config.channel;
  await db.update(s.automationRules).set({ config, enabled: formData.get("enabled") === "on" }).where(eq(s.automationRules.id, id));
  revalidatePath("/automations");
  redirect("/automations");
}

/* ---------------- Settings ---------------- */

export async function updateOrg(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  await db
    .update(s.organizations)
    .set({
      name: str(formData.get("name")) || undefined,
      phone: strOrNull(formData.get("phone")),
      email: strOrNull(formData.get("email")),
      replyTo: strOrNull(formData.get("replyTo")),
      address: strOrNull(formData.get("address")),
      quietStart: Number(str(formData.get("quietStart"))) || 20,
      quietEnd: Number(str(formData.get("quietEnd"))) || 7,
    })
    .where(eq(s.organizations.id, user.orgId));
  revalidatePath("/", "layout");
  redirect("/settings?saved=1");
}

export async function saveUser(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = strOrNull(formData.get("userId"));
  const values = {
    name: str(formData.get("name")),
    email: str(formData.get("email")).toLowerCase(),
    role: str(formData.get("role")) || "staff",
    phone: strOrNull(formData.get("phone")),
    notifySms: formData.get("notifySms") === "on",
  };
  if (!values.name || !values.email) redirect("/settings?tab=staff");
  if (id) await db.update(s.users).set(values).where(and(eq(s.users.id, id), eq(s.users.orgId, user.orgId)));
  else {
    const code = str(formData.get("code")) || process.env.ADMIN_ACCESS_CODE || "jordan123";
    await db.insert(s.users).values({ orgId: user.orgId, ...values, passwordHash: hashPassword(code) });
  }
  revalidatePath("/", "layout");
  redirect("/settings?tab=staff");
}

export async function removeUser(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const id = str(formData.get("userId"));
  if (id !== user.id) await db.delete(s.users).where(and(eq(s.users.id, id), eq(s.users.orgId, user.orgId)));
  revalidatePath("/", "layout");
  redirect("/settings?tab=staff");
}
