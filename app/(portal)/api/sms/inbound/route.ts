import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema as s } from "@/lib/db";

export const runtime = "nodejs";

function normalize(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.length === 10) d = "1" + d;
  return d;
}

/**
 * Inbound text from a homeowner. Wire the SMS provider's reply webhook here
 * (or poll Brevo's reply events and post them in).
 *
 * Body: { from: "+15615550101", text: "1" }
 *
 * A short numeric reply answers the most recent open decision for that phone.
 * Anything else becomes a request in the office inbox.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { from?: string; text?: string } | null;
  if (!body?.from || !body.text) return NextResponse.json({ error: "from and text required" }, { status: 400 });
  const db = await getDb();
  const from = normalize(body.from);
  const text = body.text.trim();

  const contacts = await db.select().from(s.contacts);
  const contact = contacts.find((c) => c.phone && normalize(c.phone) === from);
  if (!contact) return NextResponse.json({ ok: false, reason: "unknown number" });

  // Open decision?
  const visits = await db
    .select()
    .from(s.visits)
    .where(and(eq(s.visits.estateId, contact.estateId), eq(s.visits.status, "sent")))
    .orderBy(desc(s.visits.sentAt))
    .limit(10);
  const reports = visits.length ? await db.select().from(s.reports).where(inArray(s.reports.visitId, visits.map((v) => v.id))) : [];
  const answered = visits.length ? new Set((await db.select({ v: s.responses.visitId }).from(s.responses).where(inArray(s.responses.visitId, visits.map((v) => v.id)))).map((x) => x.v)) : new Set<string>();
  const open = visits.find((v) => reports.find((r) => r.visitId === v.id)?.ownerAction === "decision" && !answered.has(v.id));
  const numeric = /^\s*([12])\s*$/.exec(text);

  if (open && numeric) {
    const report = reports.find((r) => r.visitId === open.id)!;
    const choice = report.decisionOptions[Number(numeric[1]) - 1] ?? text;
    await db.insert(s.responses).values({ visitId: open.id, contactId: contact.id, channel: "sms", choice, message: null });
    await db.insert(s.activity).values({ orgId: contact.orgId, estateId: contact.estateId, visitId: open.id, kind: "replied", message: `${contact.name} replied by text: ${choice}`, actor: "owner" });
    await db.insert(s.tasks).values({ orgId: contact.orgId, estateId: contact.estateId, visitId: open.id, title: `${choice}: follow-up for ${contact.name}`, detail: report.decisionPrompt, source: "owner_reply", dueAt: new Date(Date.now() + 86400000) });
    return NextResponse.json({ ok: true, handled: "decision", visitId: open.id, choice });
  }

  await db.insert(s.ownerRequests).values({ orgId: contact.orgId, estateId: contact.estateId, contactId: contact.id, channel: "sms", message: text });
  await db.insert(s.activity).values({ orgId: contact.orgId, estateId: contact.estateId, kind: "request", message: `${contact.name} texted a request: ${text.slice(0, 80)}`, actor: "owner" });
  return NextResponse.json({ ok: true, handled: "request" });
}
