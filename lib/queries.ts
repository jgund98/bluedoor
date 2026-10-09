import "server-only";
import { cache } from "react";
import { and, desc, eq, inArray, asc } from "drizzle-orm";
import { getDb, schema as s } from "./db";
import type {
  Estate,
  Vendor,
  ServiceType,
  Visit,
  Report,
  Photo,
  Contact,
  Notification,
  Task,
  Activity,
  OwnerRequest,
  RecurringSchedule,
  EstateVendor,
  Response,
  Organization,
  User,
} from "./db/schema";
import { dayKey, isToday, isTomorrow } from "./format";

export type VisitRow = {
  visit: Visit;
  estate: Estate;
  vendor: Vendor;
  service: ServiceType;
  report: Report | null;
  photos: Photo[];
};

/* Reads are memoized per request with React cache(): the shell and the page
   both ask for the same tables, and a page may ask twice. One trip each. */
export const getOrg = cache(async (): Promise<Organization> => {
  const db = await getDb();
  const [org] = await db.select().from(s.organizations).limit(1);
  return org;
});

export async function listUsers(orgId: string): Promise<User[]> {
  const db = await getDb();
  return db.select().from(s.users).where(eq(s.users.orgId, orgId)).orderBy(asc(s.users.createdAt));
}

const dictionaries = cache(async (orgId: string) => {
  const db = await getDb();
  const [estates, vendors, services] = await Promise.all([
    db.select().from(s.estates).where(eq(s.estates.orgId, orgId)),
    db.select().from(s.vendors).where(eq(s.vendors.orgId, orgId)),
    db.select().from(s.serviceTypes).where(eq(s.serviceTypes.orgId, orgId)),
  ]);
  return {
    estates: new Map(estates.map((e) => [e.id, e])),
    vendors: new Map(vendors.map((v) => [v.id, v])),
    services: new Map(services.map((t) => [t.id, t])),
    estateList: estates,
    vendorList: vendors,
    serviceList: services,
  };
});

async function hydrate(orgId: string, visitRows: Visit[]): Promise<VisitRow[]> {
  if (!visitRows.length) return [];
  const db = await getDb();
  const d = await dictionaries(orgId);
  const ids = visitRows.map((v) => v.id);
  const [reports, photos] = await Promise.all([
    db.select().from(s.reports).where(inArray(s.reports.visitId, ids)),
    db.select().from(s.photos).where(inArray(s.photos.visitId, ids)).orderBy(asc(s.photos.sort)),
  ]);
  const rById = new Map(reports.map((r) => [r.visitId, r]));
  const pById = new Map<string, Photo[]>();
  for (const p of photos) pById.set(p.visitId, [...(pById.get(p.visitId) ?? []), p]);
  return visitRows
    .map((visit) => {
      const estate = d.estates.get(visit.estateId);
      const vendor = d.vendors.get(visit.vendorId);
      const service = d.services.get(visit.serviceTypeId);
      if (!estate || !vendor || !service) return null;
      return { visit, estate, vendor, service, report: rById.get(visit.id) ?? null, photos: pById.get(visit.id) ?? [] };
    })
    .filter((r): r is VisitRow => Boolean(r));
}

const allVisitRows = cache(async (orgId: string) => {
  const db = await getDb();
  return db.select().from(s.visits).where(eq(s.visits.orgId, orgId)).orderBy(desc(s.visits.scheduledFor));
});

/** Every visit in the org, hydrated once per request. Filters run in memory. */
const hydrateAll = cache(async (orgId: string) => hydrate(orgId, await allVisitRows(orgId)));

export async function listVisits(orgId: string, opts?: { status?: string[]; estateId?: string; vendorId?: string }): Promise<VisitRow[]> {
  if (!opts) return hydrateAll(orgId);
  if (!opts.status && (opts.estateId || opts.vendorId)) {
    return (await hydrateAll(orgId)).filter((r) => (!opts.estateId || r.visit.estateId === opts.estateId) && (!opts.vendorId || r.visit.vendorId === opts.vendorId));
  }
  const db = await getDb();
  const conds = [eq(s.visits.orgId, orgId)];
  if (opts?.status?.length) conds.push(inArray(s.visits.status, opts.status));
  if (opts?.estateId) conds.push(eq(s.visits.estateId, opts.estateId));
  if (opts?.vendorId) conds.push(eq(s.visits.vendorId, opts.vendorId));
  const rows = await db.select().from(s.visits).where(and(...conds)).orderBy(desc(s.visits.scheduledFor));
  return hydrate(orgId, rows);
}

export type VisitDetail = VisitRow & {
  contacts: Contact[];
  notifications: Notification[];
  responses: Response[];
  activity: Activity[];
  tasks: Task[];
};

export async function getVisit(id: string): Promise<VisitDetail | null> {
  const db = await getDb();
  const [visit] = await db.select().from(s.visits).where(eq(s.visits.id, id));
  if (!visit) return null;
  const [row] = await hydrate(visit.orgId, [visit]);
  if (!row) return null;
  const [contacts, notifications, responses, activity, tasks] = await Promise.all([
    db.select().from(s.contacts).where(eq(s.contacts.estateId, visit.estateId)).orderBy(desc(s.contacts.isPrimary)),
    db.select().from(s.notifications).where(eq(s.notifications.visitId, id)).orderBy(desc(s.notifications.createdAt)),
    db.select().from(s.responses).where(eq(s.responses.visitId, id)).orderBy(desc(s.responses.createdAt)),
    db.select().from(s.activity).where(eq(s.activity.visitId, id)).orderBy(asc(s.activity.createdAt)),
    db.select().from(s.tasks).where(eq(s.tasks.visitId, id)).orderBy(desc(s.tasks.createdAt)),
  ]);
  return { ...row, contacts, notifications, responses, activity, tasks };
}

export async function getVisitByVendorToken(token: string) {
  const db = await getDb();
  const [visit] = await db.select().from(s.visits).where(eq(s.visits.vendorToken, token));
  if (!visit) return null;
  return getVisit(visit.id);
}

export async function getVisitByOwnerToken(token: string) {
  const db = await getDb();
  const [visit] = await db.select().from(s.visits).where(eq(s.visits.ownerToken, token));
  if (!visit) return null;
  return getVisit(visit.id);
}

export async function navCounts(orgId: string) {
  const db = await getDb();
  const [visits, requests, held] = await Promise.all([
    db.select({ id: s.visits.id, status: s.visits.status, scheduledFor: s.visits.scheduledFor }).from(s.visits).where(eq(s.visits.orgId, orgId)),
    db.select({ id: s.ownerRequests.id }).from(s.ownerRequests).where(and(eq(s.ownerRequests.orgId, orgId), eq(s.ownerRequests.status, "new"))),
    db.select({ id: s.notifications.id }).from(s.notifications).where(and(eq(s.notifications.orgId, orgId), eq(s.notifications.status, "queued"))),
  ]);
  return {
    approvals: visits.filter((v) => v.status === "submitted").length,
    requests: requests.length,
    today: visits.filter((v) => isToday(v.scheduledFor) && !["cancelled", "closed"].includes(v.status)).length,
    outboxHeld: held.length,
  };
}

export async function todayData(orgId: string) {
  const db = await getDb();
  const all = await listVisits(orgId);
  const [requests, tasks, activity, contacts, recurring] = await Promise.all([
    db.select().from(s.ownerRequests).where(and(eq(s.ownerRequests.orgId, orgId), eq(s.ownerRequests.status, "new"))).orderBy(desc(s.ownerRequests.createdAt)),
    db.select().from(s.tasks).where(and(eq(s.tasks.orgId, orgId), eq(s.tasks.status, "open"))).orderBy(asc(s.tasks.dueAt)),
    db.select().from(s.activity).where(eq(s.activity.orgId, orgId)).orderBy(desc(s.activity.createdAt)).limit(14),
    db.select().from(s.contacts).where(eq(s.contacts.orgId, orgId)),
    db.select().from(s.recurringSchedules).where(and(eq(s.recurringSchedules.orgId, orgId), eq(s.recurringSchedules.active, true))),
  ]);
  const d = await dictionaries(orgId);
  const live = all.filter((r) => !["cancelled", "closed"].includes(r.visit.status));
  const sentThisWeek = all.filter((r) => r.visit.status === "sent" && r.visit.sentAt && Date.now() - r.visit.sentAt.getTime() < 7 * 86400000);
  // Recent replies: responses in the last 7 days
  const recentIds = sentThisWeek.map((r) => r.visit.id);
  const responses = recentIds.length ? await db.select().from(s.responses).where(inArray(s.responses.visitId, recentIds)).orderBy(desc(s.responses.createdAt)) : [];
  return {
    approvals: live.filter((r) => r.visit.status === "submitted").sort((a, b) => rank(b) - rank(a)),
    onSite: live.filter((r) => r.visit.status === "in_progress"),
    today: live.filter((r) => isToday(r.visit.scheduledFor) && ["scheduled", "requested"].includes(r.visit.status)).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime()),
    tomorrow: live.filter((r) => isTomorrow(r.visit.scheduledFor) && ["scheduled", "requested"].includes(r.visit.status)).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime()),
    requests: requests.map((q) => ({ request: q, estate: d.estates.get(q.estateId)!, contact: contacts.find((c) => c.id === q.contactId) ?? null })),
    tasks: tasks.map((t) => ({ task: t, estate: t.estateId ? d.estates.get(t.estateId) ?? null : null })),
    activity: activity.map((a) => ({ activity: a, estate: a.estateId ? d.estates.get(a.estateId) ?? null : null })),
    sentThisWeek,
    replies: responses.map((r) => ({ response: r, row: all.find((x) => x.visit.id === r.visitId)!, contact: contacts.find((c) => c.id === r.contactId) ?? null })),
    estates: d.estateList,
    vendors: d.vendorList,
    recurring,
    all,
  };
}

function rank(r: VisitRow) {
  const a = r.report?.attention;
  return a === "urgent" ? 3 : a === "decision" ? 2 : a === "note" ? 1 : 0;
}

export type EstateListRow = {
  estate: Estate;
  primary: Contact | null;
  contacts: Contact[];
  last: VisitRow | null;
  next: VisitRow | null;
  open: number; // submitted + requests
  vendorsAssigned: number;
};

export async function listEstates(orgId: string): Promise<EstateListRow[]> {
  const db = await getDb();
  const [all, contacts, assignments, requests] = await Promise.all([
    listVisits(orgId),
    db.select().from(s.contacts).where(eq(s.contacts.orgId, orgId)),
    db.select().from(s.estateVendors).where(eq(s.estateVendors.orgId, orgId)),
    db.select().from(s.ownerRequests).where(and(eq(s.ownerRequests.orgId, orgId), eq(s.ownerRequests.status, "new"))),
  ]);
  const d = await dictionaries(orgId);
  const now = Date.now();
  return d.estateList
    .map((estate) => {
      const mine = all.filter((r) => r.visit.estateId === estate.id);
      const past = mine.filter((r) => ["sent", "approved", "submitted", "closed"].includes(r.visit.status));
      const future = mine.filter((r) => ["scheduled", "requested", "in_progress"].includes(r.visit.status) && r.visit.scheduledFor.getTime() >= now - 3600000 * 6).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
      const cs = contacts.filter((c) => c.estateId === estate.id);
      return {
        estate,
        primary: cs.find((c) => c.isPrimary) ?? cs[0] ?? null,
        contacts: cs,
        last: past[0] ?? null,
        next: future[0] ?? null,
        open: mine.filter((r) => r.visit.status === "submitted").length + requests.filter((q) => q.estateId === estate.id).length,
        vendorsAssigned: assignments.filter((a) => a.estateId === estate.id).length,
      };
    })
    .sort((a, b) => a.estate.name.localeCompare(b.estate.name));
}

export type EstateDetail = {
  estate: Estate;
  contacts: Contact[];
  assignments: (EstateVendor & { vendor: Vendor })[];
  recurring: (RecurringSchedule & { vendor: Vendor; service: ServiceType })[];
  visits: VisitRow[];
  requests: (OwnerRequest & { contact: Contact | null })[];
  tasks: Task[];
  activity: Activity[];
  notifications: Notification[];
  allVendors: Vendor[];
  allServices: ServiceType[];
};

export async function getEstate(id: string): Promise<EstateDetail | null> {
  const db = await getDb();
  const [estate] = await db.select().from(s.estates).where(eq(s.estates.id, id));
  if (!estate) return null;
  const d = await dictionaries(estate.orgId);
  const [contacts, assignments, recurring, visits, requests, tasks, activity, notifications] = await Promise.all([
    db.select().from(s.contacts).where(eq(s.contacts.estateId, id)).orderBy(desc(s.contacts.isPrimary), asc(s.contacts.createdAt)),
    db.select().from(s.estateVendors).where(eq(s.estateVendors.estateId, id)),
    db.select().from(s.recurringSchedules).where(eq(s.recurringSchedules.estateId, id)),
    listVisits(estate.orgId, { estateId: id }),
    db.select().from(s.ownerRequests).where(eq(s.ownerRequests.estateId, id)).orderBy(desc(s.ownerRequests.createdAt)),
    db.select().from(s.tasks).where(eq(s.tasks.estateId, id)).orderBy(asc(s.tasks.status), asc(s.tasks.dueAt)),
    db.select().from(s.activity).where(eq(s.activity.estateId, id)).orderBy(desc(s.activity.createdAt)).limit(30),
    db.select().from(s.notifications).where(eq(s.notifications.estateId, id)).orderBy(desc(s.notifications.createdAt)).limit(30),
  ]);
  return {
    estate,
    contacts,
    assignments: assignments.map((a) => ({ ...a, vendor: d.vendors.get(a.vendorId)! })).filter((a) => a.vendor).sort((a, b) => a.trade.localeCompare(b.trade)),
    recurring: recurring.map((r) => ({ ...r, vendor: d.vendors.get(r.vendorId)!, service: d.services.get(r.serviceTypeId)! })).filter((r) => r.vendor && r.service),
    visits,
    requests: requests.map((q) => ({ ...q, contact: contacts.find((c) => c.id === q.contactId) ?? null })),
    tasks,
    activity,
    notifications,
    allVendors: d.vendorList.sort((a, b) => a.name.localeCompare(b.name)),
    allServices: d.serviceList.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export type VendorStats = {
  total: number;
  completed: number;
  onTimePct: number | null;
  flagged: number;
  avgReportMinutes: number | null;
  lastVisit: Date | null;
  estates: number;
};

export function vendorStats(vendorId: string, rows: VisitRow[], assignments: EstateVendor[]): VendorStats {
  const mine = rows.filter((r) => r.visit.vendorId === vendorId);
  const completed = mine.filter((r) => ["sent", "approved", "submitted", "closed"].includes(r.visit.status));
  const withTimes = completed.filter((r) => r.visit.arrivedAt);
  const onTime = withTimes.filter((r) => r.visit.arrivedAt!.getTime() - r.visit.scheduledFor.getTime() <= 20 * 60000);
  const reportLag = completed.filter((r) => r.visit.completedAt && r.visit.submittedAt).map((r) => (r.visit.submittedAt!.getTime() - r.visit.completedAt!.getTime()) / 60000);
  return {
    total: mine.length,
    completed: completed.length,
    onTimePct: withTimes.length ? Math.round((onTime.length / withTimes.length) * 100) : null,
    flagged: completed.filter((r) => r.report && r.report.attention !== "none").length,
    avgReportMinutes: reportLag.length ? Math.round(reportLag.reduce((a, b) => a + b, 0) / reportLag.length) : null,
    lastVisit: completed[0]?.visit.completedAt ?? null,
    estates: new Set(assignments.filter((a) => a.vendorId === vendorId).map((a) => a.estateId)).size,
  };
}

export async function listVendors(orgId: string) {
  const db = await getDb();
  const [rows, assignments] = await Promise.all([listVisits(orgId), db.select().from(s.estateVendors).where(eq(s.estateVendors.orgId, orgId))]);
  const d = await dictionaries(orgId);
  return d.vendorList
    .map((vendor) => ({ vendor, stats: vendorStats(vendor.id, rows, assignments), next: rows.filter((r) => r.visit.vendorId === vendor.id && ["scheduled", "in_progress"].includes(r.visit.status)).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime())[0] ?? null }))
    .sort((a, b) => a.vendor.trade.localeCompare(b.vendor.trade) || a.vendor.name.localeCompare(b.vendor.name));
}

export async function getVendor(id: string) {
  const db = await getDb();
  const [vendor] = await db.select().from(s.vendors).where(eq(s.vendors.id, id));
  if (!vendor) return null;
  const [rows, assignments] = await Promise.all([listVisits(vendor.orgId, { vendorId: id }), db.select().from(s.estateVendors).where(eq(s.estateVendors.vendorId, id))]);
  const d = await dictionaries(vendor.orgId);
  return {
    vendor,
    visits: rows,
    stats: vendorStats(id, rows, assignments),
    estates: assignments.map((a) => d.estates.get(a.estateId)!).filter(Boolean),
    services: d.serviceList.filter((t) => t.trade === vendor.trade),
  };
}

export async function getVendorByToken(token: string) {
  const db = await getDb();
  const [vendor] = await db.select().from(s.vendors).where(eq(s.vendors.token, token));
  if (!vendor) return null;
  const rows = await listVisits(vendor.orgId, { vendorId: vendor.id });
  return { vendor, visits: rows };
}

export async function listServiceTypes(orgId: string) {
  const db = await getDb();
  const [types, rows, vendors, recurring] = await Promise.all([
    db.select().from(s.serviceTypes).where(eq(s.serviceTypes.orgId, orgId)).orderBy(asc(s.serviceTypes.trade), asc(s.serviceTypes.name)),
    listVisits(orgId),
    db.select().from(s.vendors).where(eq(s.vendors.orgId, orgId)),
    db.select().from(s.recurringSchedules).where(and(eq(s.recurringSchedules.orgId, orgId), eq(s.recurringSchedules.active, true))),
  ]);
  return types.map((service) => ({
    service,
    uses: rows.filter((r) => r.visit.serviceTypeId === service.id).length,
    vendors: vendors.filter((v) => v.trade === service.trade && v.status === "active"),
    houses: new Set(recurring.filter((r) => r.serviceTypeId === service.id).map((r) => r.estateId)).size,
  }));
}

/** Everything around one service: who performs it, where it is set up, and what it can be added to. */
export async function serviceContext(serviceId: string) {
  const db = await getDb();
  const [service] = await db.select().from(s.serviceTypes).where(eq(s.serviceTypes.id, serviceId));
  if (!service) return null;
  const d = await dictionaries(service.orgId);
  const [assignments, recurring, rows] = await Promise.all([
    db.select().from(s.estateVendors).where(and(eq(s.estateVendors.orgId, service.orgId), eq(s.estateVendors.trade, service.trade))),
    db.select().from(s.recurringSchedules).where(and(eq(s.recurringSchedules.orgId, service.orgId), eq(s.recurringSchedules.serviceTypeId, serviceId))),
    listVisits(service.orgId),
  ]);
  const vendors = d.vendorList.filter((v) => v.trade === service.trade).sort((a, b) => a.name.localeCompare(b.name));
  return {
    service,
    vendors: vendors.map((v) => ({ vendor: v, houses: assignments.filter((a) => a.vendorId === v.id).length, visits: rows.filter((r) => r.visit.vendorId === v.id && r.visit.serviceTypeId === serviceId).length })),
    recurring: recurring.map((r) => ({ recurring: r, estate: d.estates.get(r.estateId)!, vendor: d.vendors.get(r.vendorId)! })).filter((r) => r.estate && r.vendor),
    recent: rows.filter((r) => r.visit.serviceTypeId === serviceId).slice(0, 8),
    estates: d.estateList.sort((a, b) => a.name.localeCompare(b.name)),
    assignments,
  };
}

export async function getServiceType(id: string) {
  const db = await getDb();
  const [t] = await db.select().from(s.serviceTypes).where(eq(s.serviceTypes.id, id));
  return t ?? null;
}

export async function listRules(orgId: string) {
  const db = await getDb();
  return db.select().from(s.automationRules).where(eq(s.automationRules.orgId, orgId)).orderBy(asc(s.automationRules.createdAt));
}

export async function listNotifications(orgId: string) {
  const db = await getDb();
  const rows = await db.select().from(s.notifications).where(eq(s.notifications.orgId, orgId)).orderBy(desc(s.notifications.createdAt)).limit(200);
  const d = await dictionaries(orgId);
  return rows.map((n) => ({ n, estate: n.estateId ? d.estates.get(n.estateId) ?? null : null }));
}

export async function getNotification(id: string) {
  const db = await getDb();
  const [n] = await db.select().from(s.notifications).where(eq(s.notifications.id, id));
  return n ?? null;
}

export async function listRequests(orgId: string) {
  const db = await getDb();
  const [rows, contacts] = await Promise.all([
    db.select().from(s.ownerRequests).where(eq(s.ownerRequests.orgId, orgId)).orderBy(desc(s.ownerRequests.createdAt)),
    db.select().from(s.contacts).where(eq(s.contacts.orgId, orgId)),
  ]);
  const d = await dictionaries(orgId);
  return rows.map((request) => ({ request, estate: d.estates.get(request.estateId)!, contact: contacts.find((c) => c.id === request.contactId) ?? null }));
}

export async function listTasks(orgId: string) {
  const db = await getDb();
  const rows = await db.select().from(s.tasks).where(eq(s.tasks.orgId, orgId)).orderBy(asc(s.tasks.status), asc(s.tasks.dueAt));
  const d = await dictionaries(orgId);
  return rows.map((task) => ({ task, estate: task.estateId ? d.estates.get(task.estateId) ?? null : null }));
}

export async function schedulingOptions(orgId: string) {
  const db = await getDb();
  const d = await dictionaries(orgId);
  const assignments = await db.select().from(s.estateVendors).where(eq(s.estateVendors.orgId, orgId));
  return {
    estates: d.estateList.sort((a, b) => a.name.localeCompare(b.name)),
    vendors: d.vendorList.sort((a, b) => a.name.localeCompare(b.name)),
    services: d.serviceList.sort((a, b) => a.name.localeCompare(b.name)),
    assignments,
  };
}

export async function getContactByToken(token: string) {
  const db = await getDb();
  const [contact] = await db.select().from(s.contacts).where(eq(s.contacts.portalToken, token));
  if (!contact) return null;
  const [estate] = await db.select().from(s.estates).where(eq(s.estates.id, contact.estateId));
  const visits = await listVisits(contact.orgId, { estateId: contact.estateId });
  const requests = await db.select().from(s.ownerRequests).where(eq(s.ownerRequests.estateId, contact.estateId)).orderBy(desc(s.ownerRequests.createdAt));
  return { contact, estate, visits, requests };
}

export { dayKey };
