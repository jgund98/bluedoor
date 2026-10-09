export const TZ = "America/New_York";

export function fmtDate(d: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    ...opts,
  }).format(date);
}

export function fmtLongDate(d: Date | string | null | undefined) {
  return fmtDate(d, { weekday: "long", month: "long", day: "numeric" });
}

export function fmtTime(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  })
    .format(date)
    .replace(" ", " ");
}

export function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "";
  return `${fmtDate(d)} · ${fmtTime(d)}`;
}

export function relTime(d: Date | string | null | undefined, now = new Date()) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  const past = diff < 0;
  const unit = (n: number, u: string) => `${n} ${u}${n === 1 ? "" : "s"}`;
  let txt: string;
  if (abs < 60) txt = "just now";
  else if (abs < 3600) txt = unit(Math.round(abs / 60), "min");
  else if (abs < 86400) txt = unit(Math.round(abs / 3600), "hour");
  else if (abs < 86400 * 7) txt = unit(Math.round(abs / 86400), "day");
  else txt = fmtDate(date);
  if (txt === "just now" || abs >= 86400 * 7) return txt;
  return past ? `${txt} ago` : `in ${txt}`;
}

export function dayKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isToday(d: Date | string, now = new Date()) {
  return dayKey(d) === dayKey(now);
}

export function isTomorrow(d: Date | string, now = new Date()) {
  const t = new Date(now.getTime() + 86400000);
  return dayKey(d) === dayKey(t);
}

export function timeOfDay(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(date),
  );
  if (hour < 12) return "this morning";
  if (hour < 17) return "this afternoon";
  return "this evening";
}

export function fmtPhone(p: string | null | undefined) {
  if (!p) return "";
  const d = p.replace(/\D/g, "");
  const n = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  if (n.length !== 10) return p;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export const WINDOW_LABEL: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  anytime: "Any time",
};

export const WINDOW_RANGE: Record<string, string> = {
  morning: "8 am to 12 pm",
  afternoon: "12 pm to 5 pm",
  anytime: "during the day",
};

export type VisitStatus =
  | "requested"
  | "scheduled"
  | "in_progress"
  | "submitted"
  | "approved"
  | "sent"
  | "closed"
  | "cancelled";

export const STATUS: Record<VisitStatus, { label: string; tone: "slate" | "blue" | "amber" | "green" | "red" | "navy" }> =
  {
    requested: { label: "Requested", tone: "amber" },
    scheduled: { label: "Scheduled", tone: "blue" },
    in_progress: { label: "On site", tone: "navy" },
    submitted: { label: "Needs approval", tone: "amber" },
    approved: { label: "Approved", tone: "green" },
    sent: { label: "Sent to owner", tone: "green" },
    closed: { label: "Closed", tone: "slate" },
    cancelled: { label: "Cancelled", tone: "slate" },
  };

export const ATTENTION: Record<string, { label: string; tone: "slate" | "blue" | "amber" | "green" | "red" | "navy" }> = {
  none: { label: "Routine", tone: "slate" },
  note: { label: "For your information", tone: "blue" },
  decision: { label: "Needs a decision", tone: "amber" },
  urgent: { label: "Urgent", tone: "red" },
};

export const ROLE_LABEL: Record<string, string> = {
  homeowner: "Homeowner",
  home_manager: "Home manager",
  assistant: "Assistant",
  owner: "Principal",
  admin: "Admin",
  staff: "Office",
};

export function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Small version of a bundled estate photo for list thumbnails. Uploaded or external images pass through. */
export function thumb(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/estates/") && !url.includes("/thumb/")) return url.replace("/estates/", "/estates/thumb/");
  return url;
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
