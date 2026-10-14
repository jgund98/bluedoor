import { sendInquiry } from "@/lib/inquiry";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** POST /api/inquiry/ — the "Begin a conversation" form. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  // A field people never see. Anything that fills it is a bot: say thanks, send nothing.
  if (clip(body.company, 200)) return Response.json({ ok: true });

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  if (!name || !EMAIL.test(email)) {
    return Response.json({ ok: false, error: "missing" }, { status: 422 });
  }

  const res = await sendInquiry({
    name,
    email,
    where: clip(body.where, 160),
    project: clip(body.project, 80),
    message: clip(body.message, 4000),
  });

  if (!res.ok) return Response.json({ ok: false, error: res.reason }, { status: 503 });
  return Response.json({ ok: true });
}
