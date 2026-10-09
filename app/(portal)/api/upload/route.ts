import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { projectRoot } from "@/lib/root";
import { getDb, schema as s } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Photo upload from the vendor's phone. Authenticated by the visit's vendor token.
 * Stored in Vercel Blob when a token exists, otherwise under .data/uploads.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const file = form.get("file");
  if (!token || !(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  const db = await getDb();
  const [visit] = await db.select({ id: s.visits.id }).from(s.visits).where(eq(s.visits.vendorToken, token));
  if (!visit) return NextResponse.json({ error: "Unknown visit" }, { status: 404 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Photo too large" }, { status: 413 });

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const id = `${nanoid(16)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`visits/${visit.id}/${id}`, bytes, { access: "public", contentType: file.type || "image/jpeg" });
    return NextResponse.json({ url: blob.url });
  }
  if (process.env.VERCEL) {
    // No Blob store connected yet and no writable disk: keep the photo with the visit itself.
    return NextResponse.json({ url: `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}` });
  }
  const dir = path.join(projectRoot(), ".data", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id), bytes);
  return NextResponse.json({ url: `/api/files/${id}` });
}
