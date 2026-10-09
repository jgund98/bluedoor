export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function str(v: FormDataEntryValue | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

export function strOrNull(v: FormDataEntryValue | null | undefined): string | null {
  const s = str(v);
  return s ? s : null;
}

export function toneClasses(tone: "slate" | "blue" | "amber" | "green" | "red" | "navy") {
  switch (tone) {
    case "blue":
      return "bg-info-soft text-info";
    case "amber":
      return "bg-warning-soft text-warning";
    case "green":
      return "bg-success-soft text-success";
    case "red":
      return "bg-danger-soft text-danger";
    case "navy":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
