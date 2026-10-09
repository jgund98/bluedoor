import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listVisits } from "@/lib/queries";
import { PageHeader, Button, Pill } from "@/components/ui/primitives";
import { STATUS, fmtTime, dayKey, type VisitStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "Schedule" };

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const offset = Number(sp.w ?? 0) || 0;
  const start = startOfWeek(new Date(Date.now() + offset * 7 * 86400000));
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * 86400000));
  const rows = (await listVisits(user.orgId)).filter((r) => !["cancelled"].includes(r.visit.status));
  const byDay = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = dayKey(r.visit.scheduledFor);
    byDay.set(k, [...(byDay.get(k) ?? []), r]);
  }
  const todayKey = dayKey(new Date());
  const label = `${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(days[0])} to ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(days[6])}`;
  const weekCount = days.reduce((n, d) => n + (byDay.get(dayKey(d))?.length ?? 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title={offset === 0 ? "This week" : offset === 1 ? "Next week" : label}
        description={`${weekCount} visits · ${label}`}
        actions={
          <>
            <div className="flex items-center rounded-xl border border-border bg-card">
              <Link href={`/schedule?w=${offset - 1}`} className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link href="/schedule" className="px-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                Today
              </Link>
              <Link href={`/schedule?w=${offset + 1}`} className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Next week">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Button href="/schedule/new">Schedule a visit</Button>
          </>
        }
      />
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((d) => {
          const k = dayKey(d);
          const list = (byDay.get(k) ?? []).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
          const isToday = k === todayKey;
          return (
            <section key={k} className={cn("flex min-h-40 flex-col rounded-2xl border bg-card p-2 shadow-xs", isToday ? "border-primary/50 ring-2 ring-primary/10" : "border-border")}>
              <header className="flex items-baseline justify-between px-1.5 pb-2 pt-1">
                <p className={cn("text-xs font-semibold uppercase tracking-wider", isToday ? "text-primary" : "text-subtle")}>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d)}</p>
                <p className={cn("text-sm font-semibold tabular", isToday ? "text-primary" : "")}>{d.getDate()}</p>
              </header>
              <div className="flex-1 space-y-1.5">
                {list.map((r) => {
                  const st = STATUS[r.visit.status as VisitStatus] ?? STATUS.scheduled;
                  return (
                    <Link key={r.visit.id} href={`/visits/${r.visit.id}`} className="block rounded-lg border border-border/70 bg-background px-2 py-1.5 transition hover:border-primary/40 hover:bg-card">
                      <p className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
                        <span className="tabular">{fmtTime(r.visit.scheduledFor)}</span>
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.tone === "green" ? "bg-success" : st.tone === "amber" ? "bg-warning" : st.tone === "navy" ? "bg-primary live-dot" : st.tone === "blue" ? "bg-info" : "bg-border")} />
                      </p>
                      <p className="truncate text-xs font-medium leading-snug">{r.estate.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.service.name}</p>
                    </Link>
                  );
                })}
                {list.length === 0 ? (
                  <Link href={`/schedule/new?date=${k}`} className="block rounded-lg border border-dashed border-border px-2 py-3 text-center text-xs text-subtle transition hover:border-primary/40 hover:text-primary">
                    Open
                  </Link>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-subtle">
        {(["scheduled", "in_progress", "submitted", "sent"] as VisitStatus[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <Pill tone={STATUS[k].tone} dot>
              {STATUS[k].label}
            </Pill>
          </span>
        ))}
      </div>
    </div>
  );
}
