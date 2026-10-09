import "server-only";
import { getDb, schema } from "./db";
import { headers } from "next/headers";

const BREVO_EMAIL = "https://api.brevo.com/v3/smtp/email";
const BREVO_SMS = "https://api.brevo.com/v3/transactionalSMS/sms";

export function deliveryEnabled() {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function baseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
    if (host) return `${proto}://${host}`;
  } catch {}
  return "http://localhost:3485";
}

function normalizePhone(phone: string): string {
  let d = phone.replace(/[^\d]/g, "");
  if (d.length === 10) d = "1" + d;
  return d;
}

async function brevoSms(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, error: "no key" };
  const rawSender = (process.env.BREVO_SMS_SENDER || "Bluedoor").trim();
  const sender = /^\+?\d+$/.test(rawSender) ? rawSender.replace(/\D/g, "").slice(0, 15) : rawSender.slice(0, 11);
  const res = await fetch(BREVO_SMS, {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender, recipient: normalizePhone(to), content: text, type: "transactional" }),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300) };
  return { ok: true };
}

async function brevoEmail(i: {
  to: string;
  toName?: string | null;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, error: "no key" };
  const res = await fetch(BREVO_EMAIL, {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: {
        email: process.env.MAIL_FROM_EMAIL || "noreply@epicdevsolutions.com",
        name: process.env.MAIL_FROM_NAME || "Bluedoor Building",
      },
      to: [{ email: i.to, name: i.toName || undefined }],
      replyTo: i.replyTo ? { email: i.replyTo } : undefined,
      subject: i.subject,
      htmlContent: i.html,
      textContent: i.text,
    }),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300) };
  return { ok: true };
}

export type NotifyInput = {
  orgId: string;
  audience: "vendor" | "office" | "owner";
  channel: "sms" | "email";
  to: string;
  toName?: string | null;
  subject?: string | null;
  body: string;
  html?: string | null;
  visitId?: string | null;
  estateId?: string | null;
  ruleKey?: string | null;
  replyTo?: string | null;
  /** When true the message is logged as queued and released by the next automation run. */
  hold?: boolean;
};

/**
 * Every outbound message goes through here. It is always logged, and it is
 * delivered only when a provider key exists. Without a key the outbox still
 * shows exactly what would have gone out, link included.
 */
export async function notify(i: NotifyInput) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.notifications)
    .values({
      orgId: i.orgId,
      visitId: i.visitId ?? null,
      estateId: i.estateId ?? null,
      audience: i.audience,
      channel: i.channel,
      to: i.to,
      toName: i.toName ?? null,
      subject: i.subject ?? null,
      body: i.body,
      html: i.html ?? null,
      ruleKey: i.ruleKey ?? null,
      status: "queued",
    })
    .returning();
  if (i.hold) return row;
  return deliver(row.id);
}

export async function deliver(notificationId: string) {
  const db = await getDb();
  const { eq } = await import("drizzle-orm");
  const [n] = await db.select().from(schema.notifications).where(eq(schema.notifications.id, notificationId));
  if (!n) return null;
  if (!deliveryEnabled()) {
    const [u] = await db
      .update(schema.notifications)
      .set({ status: "skipped", error: "No delivery key configured. Logged only." })
      .where(eq(schema.notifications.id, n.id))
      .returning();
    return u;
  }
  const result =
    n.channel === "sms"
      ? await brevoSms(n.to, n.body)
      : await brevoEmail({
          to: n.to,
          toName: n.toName,
          subject: n.subject ?? "Update from Bluedoor",
          html: n.html ?? `<pre>${n.body}</pre>`,
          text: n.body,
        });
  const [u] = await db
    .update(schema.notifications)
    .set({ status: result.ok ? "sent" : "failed", error: result.ok ? null : result.error ?? "failed" })
    .where(eq(schema.notifications.id, n.id))
    .returning();
  return u;
}
