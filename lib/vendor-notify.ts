import "server-only";
import { notify } from "./notify";
import type { Vendor } from "./db/schema";
import { esc } from "./templates";

/**
 * Vendors are reached on whatever they actually use. Text when they have a
 * mobile and want texts, email when they have an address and want email.
 * Most get both. A vendor with neither is flagged in the UI, not silently skipped.
 */
export async function notifyVendor(i: {
  orgId: string;
  vendor: Pick<Vendor, "phone" | "email" | "contactName" | "name" | "notifySms" | "notifyEmail">;
  text: string;
  subject: string;
  html?: string;
  visitId?: string | null;
  estateId?: string | null;
  ruleKey?: string | null;
}) {
  const sent: string[] = [];
  if (i.vendor.notifySms && i.vendor.phone) {
    await notify({ orgId: i.orgId, audience: "vendor", channel: "sms", to: i.vendor.phone, toName: i.vendor.contactName ?? i.vendor.name, body: i.text, visitId: i.visitId, estateId: i.estateId, ruleKey: i.ruleKey });
    sent.push("text");
  }
  if (i.vendor.notifyEmail && i.vendor.email) {
    await notify({
      orgId: i.orgId,
      audience: "vendor",
      channel: "email",
      to: i.vendor.email,
      toName: i.vendor.contactName ?? i.vendor.name,
      subject: i.subject,
      body: i.text,
      html: i.html ?? vendorEmailHtml(i.subject, i.text),
      visitId: i.visitId,
      estateId: i.estateId,
      ruleKey: i.ruleKey,
    });
    sent.push("email");
  }
  return sent;
}

export function vendorChannels(v: Pick<Vendor, "phone" | "email" | "notifySms" | "notifyEmail">) {
  const out: string[] = [];
  if (v.notifySms && v.phone) out.push("text");
  if (v.notifyEmail && v.email) out.push("email");
  return out;
}

export function vendorEmailHtml(subject: string, text: string) {
  const link = /https?:\/\/\S+/.exec(text)?.[0];
  const body = esc(text.replace(link ?? "", "").trim());
  return `<!doctype html><html><body style="margin:0;background:#f3f1ec;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:16px">
<tr><td style="background:#224b82;padding:18px 24px;color:#fff;font-size:13px;letter-spacing:0.18em;text-transform:uppercase">Bluedoor Building</td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#14294a">${esc(subject)}</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#14294a">${body}</p>
${link ? `<a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#224b82;color:#fff;font-size:14px;font-weight:600;text-decoration:none">Open the visit</a>` : ""}
</td></tr></table></td></tr></table></body></html>`;
}
