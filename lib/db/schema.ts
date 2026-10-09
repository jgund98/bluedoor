import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(12));
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const organizations = pgTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  replyTo: text("reply_to"),
  address: text("address"),
  timezone: text("timezone").notNull().default("America/New_York"),
  quietStart: integer("quiet_start").notNull().default(20),
  quietEnd: integer("quiet_end").notNull().default(7),
  createdAt: createdAt(),
});

export const users = pgTable("users", {
  id: id(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("staff"), // owner | admin | staff
  phone: text("phone"),
  notifySms: boolean("notify_sms").notNull().default(false),
  createdAt: createdAt(),
});

export const estates = pgTable("estates", {
  id: id(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  address1: text("address1"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  gateCode: text("gate_code"),
  accessNotes: text("access_notes"),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active | paused
  coverImage: text("cover_image"),
  createdAt: createdAt(),
});

export const contacts = pgTable("contacts", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("homeowner"), // homeowner | home_manager | assistant
  email: text("email"),
  phone: text("phone"),
  smsOptIn: boolean("sms_opt_in").notNull().default(true),
  emailOptIn: boolean("email_opt_in").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false),
  portalToken: text("portal_token")
    .notNull()
    .$defaultFn(() => nanoid(24)),
  createdAt: createdAt(),
});

export const vendors = pgTable("vendors", {
  id: id(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  trade: text("trade").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  rating: integer("rating"),
  status: text("status").notNull().default("active"), // active | paused
  notifySms: boolean("notify_sms").notNull().default(true),
  notifyEmail: boolean("notify_email").notNull().default(true),
  token: text("token")
    .notNull()
    .$defaultFn(() => nanoid(24)),
  createdAt: createdAt(),
});

/** Which vendor handles which trade at which estate. Scheduling pre-fills from this. */
export const estateVendors = pgTable("estate_vendors", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id").notNull(),
  vendorId: text("vendor_id").notNull(),
  trade: text("trade").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export type ChecklistItem = { key: string; label: string; photo?: boolean };

export const serviceTypes = pgTable("service_types", {
  id: id(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  trade: text("trade").notNull(),
  instructions: text("instructions"),
  checklist: jsonb("checklist").$type<ChecklistItem[]>().notNull().default([]),
  minPhotos: integer("min_photos").notNull().default(1),
  durationMin: integer("duration_min").notNull().default(60),
  createdAt: createdAt(),
});

export const recurringSchedules = pgTable("recurring_schedules", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id").notNull(),
  vendorId: text("vendor_id").notNull(),
  serviceTypeId: text("service_type_id").notNull(),
  cadence: text("cadence").notNull().default("weekly"), // weekly | biweekly | monthly
  weekday: integer("weekday").notNull().default(1),
  window: text("window").notNull().default("morning"),
  nextAt: timestamp("next_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const visits = pgTable("visits", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id").notNull(),
  vendorId: text("vendor_id").notNull(),
  serviceTypeId: text("service_type_id").notNull(),
  // requested | scheduled | in_progress | submitted | approved | sent | closed | cancelled
  status: text("status").notNull().default("scheduled"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  window: text("window").notNull().default("morning"), // morning | afternoon | anytime
  requestedBy: text("requested_by").notNull().default("office"), // office | owner | recurring
  requestNote: text("request_note"),
  officeNote: text("office_note"),
  recurringId: text("recurring_id"),
  vendorToken: text("vendor_token")
    .notNull()
    .$defaultFn(() => nanoid(24)),
  ownerToken: text("owner_token")
    .notNull()
    .$defaultFn(() => nanoid(24)),
  vendorOpenedAt: timestamp("vendor_opened_at", { withTimezone: true }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const reports = pgTable("reports", {
  id: id(),
  visitId: text("visit_id").notNull().unique(),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  vendorNote: text("vendor_note"),
  attention: text("attention").notNull().default("none"), // none | note | decision | urgent
  attentionNote: text("attention_note"),
  recapDraft: text("recap_draft"),
  recapFinal: text("recap_final"),
  ownerAction: text("owner_action").notNull().default("fyi"), // fyi | decision | call
  decisionPrompt: text("decision_prompt"),
  decisionOptions: jsonb("decision_options").$type<string[]>().notNull().default([]),
  approvedBy: text("approved_by"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const photos = pgTable("photos", {
  id: id(),
  visitId: text("visit_id").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
});

export const notifications = pgTable("notifications", {
  id: id(),
  orgId: text("org_id").notNull(),
  visitId: text("visit_id"),
  estateId: text("estate_id"),
  audience: text("audience").notNull(), // vendor | office | owner
  channel: text("channel").notNull(), // sms | email
  toName: text("to_name"),
  to: text("to").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  html: text("html"),
  status: text("status").notNull().default("queued"), // queued | sent | skipped | failed
  error: text("error"),
  ruleKey: text("rule_key"),
  createdAt: createdAt(),
});

export const responses = pgTable("responses", {
  id: id(),
  visitId: text("visit_id").notNull(),
  contactId: text("contact_id"),
  channel: text("channel").notNull().default("web"), // web | sms | email
  choice: text("choice"),
  message: text("message"),
  createdAt: createdAt(),
});

export const tasks = pgTable("tasks", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id"),
  visitId: text("visit_id"),
  title: text("title").notNull(),
  detail: text("detail"),
  status: text("status").notNull().default("open"), // open | done
  dueAt: timestamp("due_at", { withTimezone: true }),
  source: text("source").notNull().default("office"), // office | owner_reply | automation | vendor
  createdAt: createdAt(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

export const ownerRequests = pgTable("owner_requests", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id").notNull(),
  contactId: text("contact_id"),
  channel: text("channel").notNull().default("sms"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new | scheduled | dismissed
  visitId: text("visit_id"),
  createdAt: createdAt(),
});

export type RuleConfig = {
  hours?: number;
  days?: number;
  minutes?: number;
  recipient?: "office" | "owner_user" | "vendor" | "homeowner";
  channel?: "sms" | "email" | "both";
};

export const automationRules = pgTable("automation_rules", {
  id: id(),
  orgId: text("org_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  trigger: text("trigger").notNull(), // event | schedule
  enabled: boolean("enabled").notNull().default(true),
  config: jsonb("config").$type<RuleConfig>().notNull().default({}),
  lastRanAt: timestamp("last_ran_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const activity = pgTable("activity", {
  id: id(),
  orgId: text("org_id").notNull(),
  estateId: text("estate_id"),
  visitId: text("visit_id"),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  actor: text("actor").notNull().default("system"), // office | vendor | owner | system
  createdAt: createdAt(),
});

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Estate = typeof estates.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type OwnerRequest = typeof ownerRequests.$inferSelect;
export type RecurringSchedule = typeof recurringSchedules.$inferSelect;
export type EstateVendor = typeof estateVendors.$inferSelect;
export type Response = typeof responses.$inferSelect;

export const ALL_TABLES = [
  activity,
  automationRules,
  ownerRequests,
  tasks,
  responses,
  notifications,
  photos,
  reports,
  visits,
  recurringSchedules,
  estateVendors,
  serviceTypes,
  vendors,
  contacts,
  estates,
  users,
  organizations,
];
