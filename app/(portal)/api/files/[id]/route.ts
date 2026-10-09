import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { projectRoot } from "@/lib/root";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", gif: "image/gif" };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]+\.[a-z0-9]+$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const file = path.join(projectRoot(), ".data", "uploads", id);
  try {
    const bytes = await fs.readFile(file);
    const ext = id.split(".").pop() ?? "jpg";
    return new NextResponse(bytes, { headers: { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
