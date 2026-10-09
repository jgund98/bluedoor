import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema as s } from "./db";
import { listVisits, listRules } from "./queries";
import { notify, deliver, baseUrl as getBaseUrl } from "./notify";
import { vendorReminderSms, officeSms } from "./templates";
import { notifyVendor } from "./vendor-notify";
import { TZ, fmtTime } from "./format";

export type AutomationResult = { rule: string; message: string };

function hourIn(tz: string, d = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(d)) % 24;
}

export function inQuietHours(org: { quietStart: number; quietEnd: number; timezone: string }, d = new Date()) {
  const h = hourIn(org.timezone || TZ, d);
  return org.quietStart > org.quietEnd ? h >= org.quietStart || h < org.quietEnd : h >= org.quietStart && h < org.quietEnd;
}

async function once(orgId: string, visitId: string | null, kind: string, message: string, estateId?: string | null) {
  const db = await getDb();
  const conds = [eq(s.activity.orgId, orgId), eq(s.activity.kind, kind)];
  if (visitId) conds.push(eq(s.activity.visitId, visitId));
  const prior = await db.select({ id: s.activity.id }).from(s.activity).where(and(...conds)).limit(1);
  if (prior.length) return false;
  await db.insert(s.activity).values({ orgId, visitId, estateId: estateId ?? null, kind, message, actor: "system" });
  return true;
}

/**
 * Runs every scheduled rule once. Event rules fire inline from the actions
 * that cause them; this is the clock. In production a cron hits this hourly.
 */
export async function runAutomations(orgId: string, now = new Date()): Promise<AutomationResult[]> {
  const db = await getDb();
  const [org] = await db.select().from(s.organizations).where(eq(s.organizations.id, orgId));
  const rules = await listRules(orgId);
  const on = (key: string) => rules.find((r) => r.key === key && r.enabled);
  const base = await getBaseUrl();
  const results: AutomationResult[] = [];
  const rows = await listVisits(orgId);
  const officeUsers = await db.select().from(s.users).where(and(eq(s.users.orgId, orgId), eq(s.users.notifySms, true)));
  const office = officeUsers.filter((u) => u.role !== "owner");
  const principals = officeUsers.filter((u) => u.role === "owner");
  const smsTo = (people: typeof officeUsers, text: string, path: string, ruleKey: string, visitId?: string, estateId?: string) =>
    Promise.all(
      people
        .filter((u) => u.phone)
        .map((u) => notify({ orgId, audience: "office", channel: "sms", to: u.phone!, toName: u.name, body: officeSms({ orgName: org.name, text, baseUrl: base, path }), ruleKey, visitId, estateId })),
    );

  // Quiet hours: release anything held once the morning comes.
  const quiet = inQuietHours(org, now);
  if (!quiet) {
    const held = await db.select().from(s.notifications).where(and(eq(s.notifications.orgId, orgId), eq(s.notifications.status, "queued")));
    for (const n of held) {
      await deliver(n.id);
      results.push({ rule: "quiet_hours", message: `Released the held ${n.channel === "sms" ? "text" : "email"} to ${n.toName ?? n.to}` });
    }
  }

  // One-hour reminder to the vendor
  const dispatch = on("vendor_dispatch");
  if (dispatch) {
    const mins = (dispatch.config.hours ?? 1) * 60;
    for (const r of rows) {
      if (r.visit.status !== "scheduled") continue;
      const delta = (r.visit.scheduledFor.getTime() - now.getTime()) / 60000;
      if (delta > 0 && delta <= mins) {
        if (await once(orgId, r.visit.id, "reminder_sent", `Reminder sent to ${r.vendor.contactName ?? r.vendor.name} one hour before`, r.estate.id)) {
          await notifyVendor({ orgId, vendor: r.vendor, subject: `Reminder: ${r.estate.name} at ${fmtTime(r.visit.scheduledFor)}`, text: vendorReminderSms({ orgName: org.name, estateName: r.estate.name, baseUrl: base, vendorToken: r.visit.vendorToken, when: `at ${fmtTime(r.visit.scheduledFor)} today` }), ruleKey: "vendor_dispatch", visitId: r.visit.id, estateId: r.estate.id });
          results.push({ rule: "vendor_dispatch", message: `Reminded ${r.vendor.name} about ${r.estate.name} at ${fmtTime(r.visit.scheduledFor)}` });
        }
      }
    }
  }

  // No-show watch
  const noShow = on("vendor_no_show");
  if (noShow) {
    const grace = noShow.config.minutes ?? 30;
    for (const r of rows) {
      if (r.visit.status !== "scheduled" || r.visit.vendorOpenedAt) continue;
      const late = (now.getTime() - r.visit.scheduledFor.getTime()) / 60000;
      if (late >= grace && late < 24 * 60) {
        if (await once(orgId, r.visit.id, "no_show_alert", `${r.vendor.name} had not opened the visit ${grace} minutes into the window. Vendor and office alerted.`, r.estate.id)) {
          await notifyVendor({ orgId, vendor: r.vendor, subject: `Are you on your way to ${r.estate.name}?`, text: vendorReminderSms({ orgName: org.name, estateName: r.estate.name, baseUrl: base, vendorToken: r.visit.vendorToken, when: `was scheduled for ${fmtTime(r.visit.scheduledFor)} and we have not seen you check in` }), ruleKey: "vendor_no_show", visitId: r.visit.id, estateId: r.estate.id });
          await smsTo(office, `${r.vendor.name} has not checked in at ${r.estate.name} (${fmtTime(r.visit.scheduledFor)}).`, `/visits/${r.visit.id}`, "vendor_no_show", r.visit.id, r.estate.id);
          results.push({ rule: "vendor_no_show", message: `${r.vendor.name} has not checked in at ${r.estate.name}. Texted the vendor and the office.` });
        }
      }
    }
  }

  // Waiting too long for approval
  const unapproved = on("unapproved_report");
  if (unapproved) {
    const hrs = unapproved.config.hours ?? 2;
    for (const r of rows) {
      if (r.visit.status !== "submitted" || !r.visit.submittedAt) continue;
      if (now.getTime() - r.visit.submittedAt.getTime() >= hrs * 3600000) {
        if (await once(orgId, r.visit.id, "unapproved_nudge", `Report waited more than ${hrs} hours for approval. Office nudged.`, r.estate.id)) {
          await smsTo(office, `${r.service.name} at ${r.estate.name} has been waiting ${hrs}+ hours for approval.`, `/visits/${r.visit.id}`, "unapproved_report", r.visit.id, r.estate.id);
          results.push({ rule: "unapproved_report", message: `Nudged the office about ${r.estate.name} (${r.service.name})` });
        }
      }
    }
  }

  // Unfiled by evening
  const unfiled = on("unfiled_report");
  if (unfiled && hourIn(org.timezone || TZ, now) >= (unfiled.config.hours ?? 18)) {
    for (const r of rows) {
      const sameDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(r.visit.scheduledFor) === new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
      if (!sameDay || !["scheduled", "in_progress"].includes(r.visit.status)) continue;
      if (await once(orgId, r.visit.id, "unfiled_alert", `No report by evening. Vendor reminded and office flagged.`, r.estate.id)) {
        await notifyVendor({ orgId, vendor: r.vendor, subject: `Report still needed for ${r.estate.name}`, text: vendorReminderSms({ orgName: org.name, estateName: r.estate.name, baseUrl: base, vendorToken: r.visit.vendorToken, when: "still needs its report filed today" }), ruleKey: "unfiled_report", visitId: r.visit.id, estateId: r.estate.id });
        await smsTo(office, `No report yet from ${r.vendor.name} for ${r.estate.name} today.`, `/visits/${r.visit.id}`, "unfiled_report", r.visit.id, r.estate.id);
        results.push({ rule: "unfiled_report", message: `${r.vendor.name} has not filed for ${r.estate.name}. Reminded.` });
      }
    }
  }

  // Unanswered decision
  const unanswered = on("unanswered_decision");
  if (unanswered) {
    const days = unanswered.config.days ?? 3;
    const decisionRows = rows.filter((r) => r.visit.status === "sent" && r.report?.ownerAction === "decision" && r.visit.sentAt);
    const ids = decisionRows.map((r) => r.visit.id);
    const answered = ids.length ? new Set((await db.select({ v: s.responses.visitId }).from(s.responses).where(inArray(s.responses.visitId, ids))).map((x) => x.v)) : new Set<string>();
    for (const r of decisionRows) {
      if (answered.has(r.visit.id)) continue;
      if (now.getTime() - r.visit.sentAt!.getTime() >= days * 86400000) {
        if (await once(orgId, r.visit.id, "decision_nudge", `Decision unanswered after ${days} days. Gentle follow-up sent.`, r.estate.id)) {
          const contacts = await db.select().from(s.contacts).where(and(eq(s.contacts.estateId, r.estate.id), eq(s.contacts.isPrimary, true)));
          for (const c of contacts) {
            if (c.phone && c.smsOptIn) await notify({ orgId, audience: "owner", channel: "sms", to: c.phone, toName: c.name, body: `${org.name}: A quick follow-up on ${r.estate.name}. We are waiting on your decision about the ${r.service.name.toLowerCase()} note. ${base}/r/${r.visit.ownerToken}`, ruleKey: "unanswered_decision", visitId: r.visit.id, estateId: r.estate.id, hold: quiet });
          }
          results.push({ rule: "unanswered_decision", message: `Followed up with the owner at ${r.estate.name}` });
        }
      }
    }
  }

  // Missed recurring service
  const overdue = on("overdue_recurring");
  if (overdue) {
    const days = overdue.config.days ?? 2;
    const recurring = await db.select().from(s.recurringSchedules).where(and(eq(s.recurringSchedules.orgId, orgId), eq(s.recurringSchedules.active, true)));
    for (const rec of recurring) {
      if (!rec.nextAt) continue;
      const lateDays = (now.getTime() - rec.nextAt.getTime()) / 86400000;
      if (lateDays < days) continue;
      const covered = rows.some((r) => r.visit.recurringId === rec.id && Math.abs(r.visit.scheduledFor.getTime() - rec.nextAt!.getTime()) < 3 * 86400000);
      if (covered) continue;
      const [estate] = await db.select().from(s.estates).where(eq(s.estates.id, rec.estateId));
      const [service] = await db.select().from(s.serviceTypes).where(eq(s.serviceTypes.id, rec.serviceTypeId));
      const key = lateDays >= 5 ? "overdue_recurring_principal" : "overdue_recurring_office";
      if (await once(orgId, null, `${key}:${rec.id}`, `${service?.name} at ${estate?.name} is ${Math.floor(lateDays)} days overdue`, rec.estateId)) {
        await smsTo(lateDays >= 5 ? principals : office, `${service?.name} at ${estate?.name} is ${Math.floor(lateDays)} days overdue.`, `/estates/${rec.estateId}`, "overdue_recurring", undefined, rec.estateId);
        results.push({ rule: "overdue_recurring", message: `${service?.name} at ${estate?.name} is overdue. ${lateDays >= 5 ? "Siobhan" : "Office"} alerted.` });
      }
    }
  }

  await db.update(s.automationRules).set({ lastRanAt: now }).where(eq(s.automationRules.orgId, orgId));
  return results;
}
