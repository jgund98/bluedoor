import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listVisits } from "@/lib/queries";
import { PageHeader, Card, Button } from "@/components/ui/primitives";
import { VisitList } from "@/components/visits/visit-card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Visits" };

const FILTERS: { key: string; label: string; statuses?: string[] }[] = [
  { key: "open", label: "Open", statuses: ["requested", "scheduled", "in_progress", "submitted"] },
  { key: "submitted", label: "Needs approval", statuses: ["submitted"] },
  { key: "scheduled", label: "Scheduled", statuses: ["scheduled", "requested"] },
  { key: "sent", label: "Sent", statuses: ["sent", "approved", "closed"] },
  { key: "all", label: "All" },
];

export default async function VisitsPage({ searchParams }: { searchParams: Promise<{ f?: string; estate?: string; vendor?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const f = FILTERS.find((x) => x.key === sp.f) ?? FILTERS[0];
  const rows = (await listVisits(user.orgId, { status: f.statuses, estateId: sp.estate, vendorId: sp.vendor })).sort((a, b) =>
    f.key === "sent" || f.key === "all" ? b.visit.scheduledFor.getTime() - a.visit.scheduledFor.getTime() : a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime(),
  );
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric" }).format(r.visit.scheduledFor);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  return (
    <div>
      <PageHeader eyebrow="Visits" title="Every visit" description="One record per vendor visit." actions={<Button href="/schedule/new">Schedule a visit</Button>} />
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-muted p-1 sm:inline-flex">
        {FILTERS.map((x) => (
          <Link key={x.key} href={`/visits?f=${x.key}`} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition", f.key === x.key ? "bg-card shadow-xs" : "text-muted-foreground hover:text-foreground")}>
            {x.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <Card className="p-8 text-center text-sm text-subtle">No visits match.</Card>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([day, list]) => (
            <Card key={day}>
              <div className="px-5 pt-4 pb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{day}</p>
              </div>
              <div className="px-2 pb-2">
                <VisitList rows={list} emptyText="" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
