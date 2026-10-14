import "server-only";

/**
 * The "Begin a conversation" form, delivered by email (Brevo, the same
 * account and sender as the estate portal in lib/notify.ts).
 *
 * Only BREVO_API_KEY lives in the environment. Who receives it is a fact
 * about the client, so it is a default here and overridable without a
 * deploy via INQUIRY_TO_EMAIL.
 *
 * TODO(Jordan): swap the default to Bluedoor's inbox once Siobhan says which.
 */
const TO_EMAIL = process.env.INQUIRY_TO_EMAIL || "jordan@epicdevsolutions.com";
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || "noreply@epicdevsolutions.com";
const FROM_NAME = process.env.MAIL_FROM_NAME || "Bluedoor Building";

export type Inquiry = {
  name: string;
  email: string;
  where?: string;
  project?: string;
  message?: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(i: Inquiry) {
  const rows: [string, string | undefined][] = [
    ["Name", i.name],
    ["Email", i.email],
    ["Building in", i.where],
    ["Project", i.project],
    ["About it", i.message],
  ];
  const body = rows
    .filter(([, v]) => v && v.trim())
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 18px 7px 0;color:#5b5346;font:600 13px Georgia,serif;vertical-align:top;white-space:nowrap">${esc(k)}</td>` +
        `<td style="padding:7px 0;color:#14294a;font:15px/1.55 Georgia,serif;vertical-align:top">${esc(v!).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<div style="max-width:560px;margin:0 auto;padding:28px;background:#fdfcfa;border:1px solid #e6e2da;font-family:Georgia,serif">
  <p style="margin:0 0 4px;font:600 11px Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#224b82">Bluedoor Building</p>
  <h2 style="margin:0 0 18px;font:400 22px Georgia,serif;color:#14294a">A new inquiry from the website</h2>
  <table style="border-collapse:collapse;width:100%">${body}</table>
  <p style="margin:22px 0 0;font:13px Arial,sans-serif;color:#8c8274">Reply to this email to answer ${esc(i.name)} directly.</p>
</div>`;
}

function text(i: Inquiry) {
  return [
    "A new inquiry from the Bluedoor website",
    "",
    `Name: ${i.name}`,
    `Email: ${i.email}`,
    i.where ? `Building in: ${i.where}` : "",
    i.project ? `Project: ${i.project}` : "",
    i.message ? `\n${i.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendInquiry(i: Inquiry): Promise<{ ok: boolean; reason?: "no-key" | "rejected" | "network" }> {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn("[inquiry] BREVO_API_KEY is not set, nothing was sent.");
    return { ok: false, reason: "no-key" };
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: TO_EMAIL }],
        replyTo: { email: i.email, name: i.name },
        subject: `New inquiry: ${i.name}${i.project ? ` (${i.project})` : ""}`,
        htmlContent: html(i),
        textContent: text(i),
      }),
    });
    if (!res.ok) {
      console.error("[inquiry] Brevo refused:", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return { ok: false, reason: "rejected" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[inquiry] send failed:", err);
    return { ok: false, reason: "network" };
  }
}
