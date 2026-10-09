"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema as s } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getVisit, getVisitByOwnerToken, getVisitByVendorToken, getContactByToken } from "@/lib/queries";
import { composeRecap, defaultDecision } from "@/lib/recap";
import { notify, baseUrl as getBaseUrl } from "@/lib/notify";
import { ownerEmailHtml, ownerEmailSubject, ownerSms, vendorDispatchSms, officeSms } from "@/lib/templates";
import { inQuietHours, runAutomations } from "@/lib/automations";
import { notifyVendor as notifyVendorChannels } from "@/lib/vendor-notify";
import { str, strOrNull } from "@/lib/utils";
import { fmtLongDate } from "@/lib/format";

const WINDOW_HOUR: Record<string, number> = { morning: 9, afternoon: 13, anytime: 10 };

function dateAt(date: string, window: string, time?: string) {
  const hour = time && /^\d{2}:\d{2}$/.test(time) ? Number(time.slice(0, 2)) : WINDOW_HOUR[window] ?? 9;
  const minute = time && /^\d{2}:\d{2}$/.test(time) ? Number(time.slice(3)) : 0;
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-04:00`);
}

async function log(orgId: string, estateId: string | null, visitId: string | null, kind: string, message: string, actor: string) {
  const db = await getDb();
  await db.insert(s.activity).values({ orgId, estateId, visitId, kind, message, actor });
}

/* ---------------- Office: scheduling ---------------- */

export async function scheduleVisit(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const estateId = str(formData.get("estateId"));
  const serviceTypeId = str(formData.get("serviceTypeId"));
  const vendorId = str(formData.get("vendorId"));
  const date = str(formData.get("date"));
  const window = str(formData.get("window")) || "morning";
  const time = str(formData.get("time"));
  const note = strOrNull(formData.get("note"));
  const requestId = strOrNull(formData.get("requestId"));
  const notifyVendor = formData.get("notifyVendor") === "on";
  if (!estateId || !serviceTypeId || !vendorId || !date) redirect("/schedule?error=missing");

  const [estate] = await db.select().from(s.estates).where(eq(s.estates.id, estateId));
  const [vendor] = await db.select().from(s.vendors).where(eq(s.vendors.id, vendorId));
  const [service] = await db.select().from(s.serviceTypes).where(eq(s.serviceTypes.id, serviceTypeId));
  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, user.orgId));

  const [visit] = await db
    .insert(s.visits)
    .values({
      orgId: user.orgId,
      estateId,
      vendorId,
      serviceTypeId,
      status: "scheduled",
      scheduledFor: dateAt(date, window, time),
      window,
      requestedBy: requestId ? "owner" : "office",
      requestNote: note,
    })
    .returning();

  await log(user.orgId, estateId, visit.id, "scheduled", `${user.name} scheduled ${service.name} with ${vendor.name}`, "office");

  if (requestId) {
    await db.update(s.ownerRequests).set({ status: "scheduled", visitId: visit.id }).where(eq(s.ownerRequests.id, requestId));
  }

  if (notifyVendor) {
    const base = await getBaseUrl();
    const sent = await notifyVendorChannels({
      orgId: user.orgId,
      vendor,
      subject: `${service.name} at ${estate.name}, ${fmtLongDate(visit.scheduledFor)}`,
      text: vendorDispatchSms({
        orgName: org.name,
        vendorContact: vendor.contactName ?? vendor.name,
        estateName: estate.name,
        address: [estate.address1, estate.city].filter(Boolean).join(", "),
        scheduledFor: visit.scheduledFor,
        window,
        serviceName: service.name,
        baseUrl: base,
        vendorToken: visit.vendorToken,
      }),
      visitId: visit.id,
      estateId,
      ruleKey: "vendor_dispatch",
    });
    await log(user.orgId, estateId, visit.id, "dispatched", sent.length ? `Visit link sent to ${vendor.contactName ?? vendor.name} by ${sent.join(" and ")}` : `${vendor.name} has no text or email on file. Visit link not sent.`, "system");
  }

  revalidatePath("/", "layout");
  redirect(`/visits/${visit.id}?created=1`);
}

export async function cancelVisit(formData: FormData) {
  const user = await requireUser();
  const id = str(formData.get("visitId"));
  const db = await getDb();
  const [visit] = await db.update(s.visits).set({ status: "cancelled" }).where(eq(s.visits.id, id)).returning();
  if (visit) await log(user.orgId, visit.estateId, visit.id, "cancelled", `${user.name} cancelled the visit`, "office");
  revalidatePath("/", "layout");
  redirect(`/visits/${id}`);
}

export async function sendBackToVendor(formData: FormData) {
  const user = await requireUser();
  const id = str(formData.get("visitId"));
  const note = str(formData.get("note"));
  const detail = await getVisit(id);
  if (!detail) redirect("/approvals");
  const db = await getDb();
  await db.update(s.visits).set({ status: "in_progress", officeNote: note || null, submittedAt: null }).where(eq(s.visits.id, id));
  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, user.orgId));
  {
    const base = await getBaseUrl();
    await notifyVendorChannels({
      orgId: user.orgId,
      vendor: detail.vendor,
      subject: `One more thing on ${detail.estate.name}`,
      text: `${org.name}: The office needs one more thing on ${detail.estate.name}. ${note} Reopen your report: ${base}/v/${detail.visit.vendorToken}`,
      visitId: id,
      estateId: detail.estate.id,
      ruleKey: "sent_back",
    });
  }
  await log(user.orgId, detail.estate.id, id, "sent_back", `${user.name} sent the report back to ${detail.vendor.name}: ${note}`, "office");
  revalidatePath("/", "layout");
  redirect(`/visits/${id}`);
}

/* ---------------- Office: approve and send ---------------- */

export async function approveAndSend(formData: FormData) {
  const user = await requireUser();
  const id = str(formData.get("visitId"));
  const detail = await getVisit(id);
  if (!detail || !detail.report) redirect("/approvals");
  const db = await getDb();
  const recapFinal = str(formData.get("recap")) || detail.report.recapDraft || "";
  const ownerAction = (str(formData.get("ownerAction")) || "fyi") as "fyi" | "decision" | "call";
  const decisionPrompt = strOrNull(formData.get("decisionPrompt"));
  const opt1 = str(formData.get("option1"));
  const opt2 = str(formData.get("option2"));
  const decisionOptions = ownerAction === "decision" ? [opt1, opt2].filter(Boolean) : [];
  const recipientIds = formData.getAll("recipients").map(String);
  const now = new Date();

  await db
    .update(s.reports)
    .set({ recapFinal, ownerAction, decisionPrompt: ownerAction === "decision" ? decisionPrompt : null, decisionOptions, approvedBy: user.name, updatedAt: now })
    .where(eq(s.reports.visitId, id));
  await db.update(s.visits).set({ status: "sent", approvedAt: now, sentAt: now }).where(eq(s.visits.id, id));

  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, user.orgId));
  const base = await getBaseUrl();
  const urgent = detail.report.attention === "urgent" || ownerAction === "call";
  const hold = !urgent && inQuietHours(org, now);
  const recipients = detail.contacts.filter((c) => recipientIds.includes(c.id));
  const names: string[] = [];
  for (const c of recipients) {
    const input = {
      baseUrl: base,
      orgName: org.name,
      orgPhone: org.phone,
      estateName: detail.estate.name,
      serviceName: detail.service.name,
      vendorName: detail.vendor.name,
      completedAt: detail.visit.completedAt,
      recap: recapFinal,
      ownerAction,
      decisionPrompt,
      decisionOptions,
      photos: detail.photos,
      ownerToken: detail.visit.ownerToken,
      contactName: c.name,
    };
    if (c.smsOptIn && c.phone) {
      await notify({ orgId: user.orgId, audience: "owner", channel: "sms", to: c.phone, toName: c.name, body: ownerSms(input), visitId: id, estateId: detail.estate.id, ruleKey: "approved_send_owner", hold });
    }
    if (c.emailOptIn && c.email) {
      await notify({ orgId: user.orgId, audience: "owner", channel: "email", to: c.email, toName: c.name, subject: ownerEmailSubject(input), body: recapFinal, html: ownerEmailHtml(input), visitId: id, estateId: detail.estate.id, ruleKey: "approved_send_owner", hold, replyTo: org.replyTo });
    }
    names.push(c.name);
  }
  await log(user.orgId, detail.estate.id, id, "approved", `${user.name} approved the report${names.length ? ` and it was sent to ${names.join(" and ")}` : ""}${hold ? " (held for quiet hours)" : ""}`, "office");
  revalidatePath("/", "layout");
  redirect(`/visits/${id}?sent=1${hold ? "&held=1" : ""}`);
}

/* ---------------- Vendor ---------------- */

export async function vendorCheckIn(formData: FormData) {
  const token = str(formData.get("token"));
  const detail = await getVisitByVendorToken(token);
  if (!detail) redirect("/");
  const db = await getDb();
  const now = new Date();
  await db.update(s.visits).set({ status: "in_progress", arrivedAt: now, vendorOpenedAt: detail.visit.vendorOpenedAt ?? now }).where(eq(s.visits.id, detail.visit.id));
  await log(detail.visit.orgId, detail.estate.id, detail.visit.id, "arrived", `${detail.vendor.name} checked in on site`, "vendor");
  revalidatePath(`/v/${token}`);
  redirect(`/v/${token}`);
}

export async function vendorSubmit(formData: FormData) {
  const token = str(formData.get("token"));
  const detail = await getVisitByVendorToken(token);
  if (!detail) redirect("/");
  const db = await getDb();
  const items = formData.getAll("items").map(String);
  const vendorNote = strOrNull(formData.get("note"));
  const attention = str(formData.get("attention")) || "none";
  const attentionNote = strOrNull(formData.get("attentionNote"));
  let photoList: { url: string; caption: string }[] = [];
  try {
    photoList = JSON.parse(str(formData.get("photos")) || "[]");
  } catch {
    photoList = [];
  }
  const now = new Date();
  const arrivedAt = detail.visit.arrivedAt ?? new Date(now.getTime() - detail.service.durationMin * 60000);

  const recapDraft = composeRecap({
    estateName: detail.estate.name,
    serviceName: detail.service.name,
    vendorName: detail.vendor.name,
    arrivedAt,
    completedAt: now,
    checklist: detail.service.checklist,
    items,
    vendorNote,
    attention,
    attentionNote,
  });
  const decision = defaultDecision(attention, attentionNote);
  const ownerAction = attention === "decision" ? "decision" : attention === "urgent" ? "call" : "fyi";

  if (detail.report) {
    await db
      .update(s.reports)
      .set({ items, vendorNote, attention, attentionNote, recapDraft, ownerAction, decisionPrompt: decision.prompt || null, decisionOptions: decision.options, updatedAt: now })
      .where(eq(s.reports.visitId, detail.visit.id));
    await db.delete(s.photos).where(eq(s.photos.visitId, detail.visit.id));
  } else {
    await db.insert(s.reports).values({ visitId: detail.visit.id, items, vendorNote, attention, attentionNote, recapDraft, ownerAction, decisionPrompt: decision.prompt || null, decisionOptions: decision.options });
  }
  if (photoList.length) {
    await db.insert(s.photos).values(photoList.map((p, n) => ({ visitId: detail.visit.id, url: p.url, caption: p.caption || null, sort: n })));
  }
  await db.update(s.visits).set({ status: "submitted", arrivedAt, completedAt: now, submittedAt: now, officeNote: null }).where(eq(s.visits.id, detail.visit.id));
  await log(detail.visit.orgId, detail.estate.id, detail.visit.id, "filed", `${detail.vendor.name} filed the report${attention === "urgent" ? " and flagged it urgent" : attention === "decision" ? " with a decision for the owner" : ""}`, "vendor");

  // Event rules
  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, detail.visit.orgId));
  const rules = await db.select().from(s.automationRules).where(eq(s.automationRules.orgId, detail.visit.orgId));
  const enabled = (k: string) => rules.some((r) => r.key === k && r.enabled);
  const base = await getBaseUrl();
  const staff = await db.select().from(s.users).where(eq(s.users.orgId, detail.visit.orgId));
  if (enabled("report_filed_office")) {
    for (const u of staff.filter((x) => x.role !== "owner")) {
      await notify({ orgId: detail.visit.orgId, audience: "office", channel: "email", to: u.email, toName: u.name, subject: `Report filed: ${detail.service.name} at ${detail.estate.name}`, body: `${detail.vendor.name} filed a report for ${detail.estate.name}. Review it: ${base}/visits/${detail.visit.id}`, visitId: detail.visit.id, estateId: detail.estate.id, ruleKey: "report_filed_office" });
    }
  }
  if (attention === "urgent" && enabled("urgent_to_principal")) {
    for (const u of staff.filter((x) => x.notifySms && x.phone)) {
      await notify({ orgId: detail.visit.orgId, audience: "office", channel: "sms", to: u.phone!, toName: u.name, body: officeSms({ orgName: org.name, text: `URGENT at ${detail.estate.name}. ${detail.vendor.name} flagged: ${attentionNote ?? ""}`, baseUrl: base, path: `/visits/${detail.visit.id}` }), visitId: detail.visit.id, estateId: detail.estate.id, ruleKey: "urgent_to_principal" });
    }
  }
  revalidatePath("/", "layout");
  redirect(`/v/${token}?filed=1`);
}

/* ---------------- Homeowner ---------------- */

export async function ownerRespond(formData: FormData) {
  const token = str(formData.get("token"));
  const choice = str(formData.get("choice"));
  const message = strOrNull(formData.get("message"));
  const detail = await getVisitByOwnerToken(token);
  if (!detail) redirect("/");
  const db = await getDb();
  const contact = detail.contacts.find((c) => c.isPrimary) ?? detail.contacts[0] ?? null;
  await db.insert(s.responses).values({ visitId: detail.visit.id, contactId: contact?.id ?? null, channel: "web", choice: choice || null, message });
  const who = contact?.name ?? "The homeowner";
  await log(detail.visit.orgId, detail.estate.id, detail.visit.id, "replied", `${who} replied: ${choice || message || ""}`, "owner");

  const rules = await db.select().from(s.automationRules).where(eq(s.automationRules.orgId, detail.visit.orgId));
  if (rules.some((r) => r.key === "owner_reply_task" && r.enabled)) {
    const title = choice ? `${choice}: ${detail.service.name} at ${detail.estate.name}` : `Reply from ${who} on ${detail.estate.name}`;
    await db.insert(s.tasks).values({ orgId: detail.visit.orgId, estateId: detail.estate.id, visitId: detail.visit.id, title, detail: [detail.report?.decisionPrompt, message ? `"${message}"` : null].filter(Boolean).join(" "), source: "owner_reply", dueAt: new Date(Date.now() + 86400000) });
    const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, detail.visit.orgId));
    const base = await getBaseUrl();
    const staff = await db.select().from(s.users).where(and(eq(s.users.orgId, detail.visit.orgId), eq(s.users.notifySms, true)));
    for (const u of staff.filter((x) => x.role !== "owner" && x.phone)) {
      await notify({ orgId: detail.visit.orgId, audience: "office", channel: "sms", to: u.phone!, toName: u.name, body: officeSms({ orgName: org.name, text: `${who} replied on ${detail.estate.name}: ${choice || message || ""}`, baseUrl: base, path: `/visits/${detail.visit.id}` }), visitId: detail.visit.id, estateId: detail.estate.id, ruleKey: "owner_reply_task" });
    }
  }
  revalidatePath("/", "layout");
  redirect(`/r/${token}?thanks=1`);
}

export async function ownerRequest(formData: FormData) {
  const token = str(formData.get("token"));
  const message = str(formData.get("message"));
  const portal = await getContactByToken(token);
  if (!portal || !message) redirect("/");
  const db = await getDb();
  await db.insert(s.ownerRequests).values({ orgId: portal.contact.orgId, estateId: portal.estate.id, contactId: portal.contact.id, channel: "web", message });
  await log(portal.contact.orgId, portal.estate.id, null, "request", `${portal.contact.name} sent a request: ${message.slice(0, 80)}`, "owner");
  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, portal.contact.orgId));
  const base = await getBaseUrl();
  const staff = await db.select().from(s.users).where(eq(s.users.orgId, portal.contact.orgId));
  for (const u of staff.filter((x) => x.role !== "owner")) {
    await notify({ orgId: portal.contact.orgId, audience: "office", channel: "email", to: u.email, toName: u.name, subject: `Request from ${portal.contact.name} (${portal.estate.name})`, body: `${message}\n\nOpen requests: ${base}/requests`, estateId: portal.estate.id, ruleKey: "owner_request_intake" });
  }
  void org;
  revalidatePath("/", "layout");
  redirect(`/home/${token}?requested=1`);
}

/* ---------------- Requests, tasks, automations ---------------- */

export async function dismissRequest(formData: FormData) {
  await requireUser();
  const id = str(formData.get("requestId"));
  const db = await getDb();
  await db.update(s.ownerRequests).set({ status: "dismissed" }).where(eq(s.ownerRequests.id, id));
  revalidatePath("/", "layout");
  redirect("/requests");
}

export async function completeTask(formData: FormData) {
  await requireUser();
  const id = str(formData.get("taskId"));
  const back = str(formData.get("back")) || "/today";
  const db = await getDb();
  await db.update(s.tasks).set({ status: "done", doneAt: new Date() }).where(eq(s.tasks.id, id));
  revalidatePath("/", "layout");
  redirect(back);
}

export async function addTask(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const title = str(formData.get("title"));
  const estateId = strOrNull(formData.get("estateId"));
  const back = str(formData.get("back")) || "/today";
  if (title) await db.insert(s.tasks).values({ orgId: user.orgId, estateId, title, source: "office", dueAt: new Date(Date.now() + 86400000) });
  revalidatePath("/", "layout");
  redirect(back);
}

export async function runAutomationsNow() {
  const user = await requireUser();
  const results = await runAutomations(user.orgId);
  revalidatePath("/", "layout");
  const summary = encodeURIComponent(JSON.stringify(results.slice(0, 12)));
  redirect(`/automations?ran=${results.length}&summary=${summary}`);
}

export async function noteDate(d: Date) {
  return fmtLongDate(d);
}
