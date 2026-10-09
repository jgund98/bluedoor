import { fmtLongDate, fmtTime, WINDOW_RANGE } from "./format";

export type OwnerMessageInput = {
  baseUrl: string;
  orgName: string;
  orgPhone?: string | null;
  estateName: string;
  serviceName: string;
  vendorName: string;
  completedAt: Date | null;
  recap: string;
  ownerAction: "fyi" | "decision" | "call";
  decisionPrompt?: string | null;
  decisionOptions?: string[];
  photos: { url: string; caption?: string | null }[];
  ownerToken: string;
  contactName: string;
};

function abs(baseUrl: string, url: string) {
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

export function ownerSms(i: OwnerMessageInput): string {
  const link = `${i.baseUrl}/r/${i.ownerToken}`;
  const first = i.recap.split(/(?<=\.)\s/)[0] ?? i.recap;
  let tail = "";
  if (i.ownerAction === "decision" && i.decisionOptions?.length) {
    tail = ` Reply ${i.decisionOptions.map((o, n) => `${n + 1} to ${o.toLowerCase()}`).join(" or ")}.`;
  } else if (i.ownerAction === "call") {
    tail = " We will call you shortly.";
  }
  return `${i.orgName}: ${first}${tail} Details and photos: ${link}`;
}

export function ownerEmailSubject(i: OwnerMessageInput) {
  const prefix =
    i.ownerAction === "decision" ? "Decision needed: " : i.ownerAction === "call" ? "We need to speak: " : "";
  return `${prefix}${i.serviceName} at ${i.estateName}`;
}

export function ownerEmailHtml(i: OwnerMessageInput): string {
  const link = `${i.baseUrl}/r/${i.ownerToken}`;
  const date = i.completedAt ? `${fmtLongDate(i.completedAt)} at ${fmtTime(i.completedAt).replace(" ", " ")}` : "";
  const paragraphs = i.recap
    .split(/(?<=\.)\s(?=[A-Z])/)
    .reduce<string[]>((acc, s) => {
      const last = acc[acc.length - 1];
      if (last && last.length < 140) acc[acc.length - 1] = `${last} ${s}`;
      else acc.push(s);
      return acc;
    }, [])
    .map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#14294a">${esc(p)}</p>`)
    .join("");
  const photoCells = i.photos
    .slice(0, 4)
    .map(
      (p) =>
        `<td style="padding:4px;width:50%"><a href="${link}"><img src="${abs(i.baseUrl, p.url)}" alt="${esc(p.caption ?? "")}" width="100%" style="display:block;border-radius:10px;width:100%;height:auto"/></a></td>`,
    );
  const rows: string[] = [];
  for (let k = 0; k < photoCells.length; k += 2) rows.push(`<tr>${photoCells.slice(k, k + 2).join("")}</tr>`);
  const buttons =
    i.ownerAction === "decision" && i.decisionOptions?.length
      ? i.decisionOptions
          .map(
            (o, n) =>
              `<a href="${link}?choice=${n + 1}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;background:${n === 0 ? "#224b82" : "#ffffff"};color:${n === 0 ? "#ffffff" : "#224b82"};border:1px solid #224b82;font-size:14px;font-weight:600;text-decoration:none">${esc(o)}</a>`,
          )
          .join("")
      : `<a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#224b82;color:#fff;font-size:14px;font-weight:600;text-decoration:none">View the full report</a>`;

  return `<!doctype html><html><body style="margin:0;background:#f3f1ec;font-family:Figtree,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="background:#224b82;padding:26px 32px;text-align:center">
  <img src="${i.baseUrl}/brand/logo.png" alt="${esc(i.orgName)}" width="72" style="display:inline-block;width:72px;height:auto;border-radius:50%"/>
</td></tr>
<tr><td style="padding:30px 32px 8px">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8c8274">${esc(i.estateName)}</p>
  <h1 style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;line-height:1.15;color:#14294a">${esc(i.serviceName)}</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#8c8274">${esc(date)}${i.vendorName ? ` · ${esc(i.vendorName)}` : ""}</p>
  <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#14294a">${esc(i.contactName.split(" ")[0])},</p>
  ${paragraphs}
  ${i.ownerAction === "decision" && i.decisionPrompt ? `<p style="margin:18px 0 10px;padding:14px 16px;background:#eaf0f6;border-radius:12px;font-size:15px;line-height:1.5;color:#14294a">${esc(i.decisionPrompt)}</p>` : ""}
  <div style="margin:18px 0 8px">${buttons}</div>
</td></tr>
${rows.length ? `<tr><td style="padding:8px 28px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table></td></tr>` : ""}
<tr><td style="padding:18px 32px 28px;border-top:1px solid #eeebe4">
  <p style="margin:0;font-size:13px;line-height:1.6;color:#8c8274">Sent by ${esc(i.orgName)} Estate Management.${i.orgPhone ? ` Questions, call ${esc(i.orgPhone)}.` : ""} Reply to this email and it reaches the office.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

export function vendorDispatchSms(i: {
  orgName: string;
  vendorContact: string;
  estateName: string;
  address: string;
  scheduledFor: Date;
  window: string;
  serviceName: string;
  baseUrl: string;
  vendorToken: string;
}) {
  return `${i.orgName}: ${i.serviceName} at ${i.estateName} (${i.address}) on ${fmtLongDate(i.scheduledFor)}, ${WINDOW_RANGE[i.window] ?? i.window}. Open your visit: ${i.baseUrl}/v/${i.vendorToken}`;
}

export function vendorReminderSms(i: { orgName: string; estateName: string; baseUrl: string; vendorToken: string; when: string }) {
  return `${i.orgName}: Reminder, ${i.estateName} ${i.when}. Check in and file your report here: ${i.baseUrl}/v/${i.vendorToken}`;
}

export function officeSms(i: { orgName: string; text: string; baseUrl: string; path: string }) {
  return `${i.orgName}: ${i.text} ${i.baseUrl}${i.path}`;
}

export function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
