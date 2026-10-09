import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

let cached: string | null = null;

/** The app's root folder, regardless of the shell's working directory. */
export function projectRoot(): string {
  if (cached) return cached;
  const candidates: string[] = [];
  if (process.env.APP_ROOT) candidates.push(process.env.APP_ROOT);
  candidates.push(process.cwd());
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 6; i++) candidates.push(path.resolve(here, ...Array(i).fill("..")));
  } catch {}
  for (const c of candidates) {
    if (existsSync(path.join(c, "drizzle", "meta", "_journal.json"))) {
      cached = c;
      return c;
    }
  }
  cached = process.cwd();
  return cached;
}
