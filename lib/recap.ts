import { fmtTime, timeOfDay } from "./format";
import type { ChecklistItem } from "./db/schema";

export type RecapInput = {
  estateName: string;
  serviceName: string;
  vendorName: string;
  arrivedAt: Date | null;
  completedAt: Date | null;
  checklist: ChecklistItem[];
  items: string[];
  vendorNote: string | null;
  attention: string;
  attentionNote: string | null;
};

function sentence(s: string) {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return "";
  const cap = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

function listify(parts: string[]) {
  const p = parts.map((s) => s.trim()).filter(Boolean);
  if (p.length === 0) return "";
  if (p.length === 1) return p[0];
  if (p.length === 2) return `${p[0]} and ${p[1]}`;
  return `${p.slice(0, -1).join(", ")}, and ${p[p.length - 1]}`;
}

function lower(s: string) {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}

/**
 * Turns a vendor's chips and shorthand into an owner-ready recap in the
 * office's voice. Deterministic so the office always gets the same draft
 * for the same report; the office edits before anything is sent.
 */
export function composeRecap(input: RecapInput): string {
  const when = input.completedAt ?? input.arrivedAt;
  const tod = when ? timeOfDay(when) : "today";
  const out: string[] = [];

  const times =
    input.arrivedAt && input.completedAt
      ? ` ${input.vendorName} was on site from ${fmtTime(input.arrivedAt)} to ${fmtTime(input.completedAt)}.`
      : input.arrivedAt
        ? ` ${input.vendorName} arrived at ${fmtTime(input.arrivedAt)}.`
        : "";
  out.push(`${sentence(`${input.serviceName} was completed at ${input.estateName} ${tod}`)}${times}`);

  const labels = input.items
    .map((k) => input.checklist.find((c) => c.key === k)?.label)
    .filter((l): l is string => Boolean(l))
    .map(lower);
  if (labels.length) out.push(sentence(`Completed: ${listify(labels)}`));

  const skipped = input.checklist
    .filter((c) => !input.items.includes(c.key))
    .map((c) => lower(c.label));
  if (skipped.length && labels.length) {
    out.push(sentence(`Not completed on this visit: ${listify(skipped)}`));
  }

  switch (input.attention) {
    case "note":
      if (input.attentionNote) {
        out.push(sentence(`One thing to be aware of: ${lower(input.attentionNote.trim())}`));
        out.push("No action is needed on your part.");
      }
      break;
    case "decision":
      if (input.attentionNote) out.push(sentence(input.attentionNote));
      out.push("Please let us know how you would like us to proceed.");
      break;
    case "urgent":
      if (input.attentionNote) out.push(sentence(`This needs attention right away: ${lower(input.attentionNote.trim())}`));
      out.push("We are already on it and will call you shortly.");
      break;
    default:
      if (input.vendorNote) out.push(sentence(`Noted on site: ${lower(input.vendorNote.trim())}`));
      break;
  }

  // The vendor's shorthand usually says the same thing as the flagged note;
  // the office sees the raw note on the approval screen and can add it back.

  if (input.attention === "none") out.push("Everything else looked as it should.");

  return out.filter(Boolean).join(" ");
}

export function defaultDecision(attention: string, attentionNote: string | null) {
  if (attention !== "decision") return { prompt: "", options: [] as string[] };
  return {
    prompt: attentionNote ? `How would you like us to handle this? ${attentionNote.trim()}` : "How would you like us to proceed?",
    options: ["Go ahead and handle it", "Call me first"],
  };
}
