import { NextResponse } from "next/server";
import { getDb, schema as s } from "@/lib/db";
import { runAutomations } from "@/lib/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The clock. Vercel cron calls this hourly; locally the Automations page has a "Run now" button. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const orgs = await db.select({ id: s.organizations.id }).from(s.organizations);
  const out: Record<string, unknown> = {};
  for (const o of orgs) out[o.id] = await runAutomations(o.id);
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results: out });
}
