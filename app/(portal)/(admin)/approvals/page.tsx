import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listVisits } from "@/lib/queries";
import { PageHeader, Card, Pill, EmptyState, Button } from "@/components/ui/primitives";
import { ATTENTION, fmtTime, relTime, pluralize, thumb } from "@/lib/format";
import { ArrowRight, Camera } from "lucide-react";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const user = await requireUser();
  const rows = (await listVisits(user.orgId, { status: ["submitted"] })).sort((a, b) => rank(b.report?.attention) - rank(a.report?.attention) || (a.visit.submittedAt?.getTime() ?? 0) - (b.visit.submittedAt?.getTime() ?? 0));
  const recent = (await listVisits(user.orgId, { status: ["sent"] })).slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow="Approvals"
        title={rows.length ? `${pluralize(rows.length, "report")} waiting` : "All caught up"}
        description="Review each report before it goes to the homeowner. Urgent first."
        actions={<Button href="/outbox" variant="outline">Outbox</Button>}
      />

      {rows.length === 0 ? (
        <EmptyState title="No reports waiting" description="When a vendor files a report from their phone it lands here with a draft already written." action={<Button href="/schedule/new">Schedule a visit</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const att = ATTENTION[r.report?.attention ?? "none"];
            return (
              <Link key={r.visit.id} href={`/visits/${r.visit.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-md">
                <div className="relative h-32 bg-muted bg-cover bg-center" style={r.photos[0] ? { backgroundImage: `url(${thumb(r.photos[0].url)})` } : r.estate.coverImage ? { backgroundImage: `url(${thumb(r.estate.coverImage)})` } : undefined}>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-abyss/70 to-transparent p-3 text-porcelain">
                    <div>
                      <p className="text-sm font-semibold">{r.estate.name}</p>
                      <p className="text-xs opacity-80">{r.service.name}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 text-xs backdrop-blur">
                      <Camera className="h-3 w-3" /> {r.photos.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone={att.tone}>{att.label}</Pill>
                    <span className="text-xs text-subtle">filed {relTime(r.visit.submittedAt)}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-snug text-foreground/85">{r.report?.attentionNote || r.report?.recapDraft}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                    <span>
                      {r.vendor.name} · {fmtTime(r.visit.arrivedAt)}–{fmtTime(r.visit.completedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                      Review <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {recent.length ? (
        <Card className="mt-8">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold">Recently sent</h2>
            <p className="text-xs text-muted-foreground">What homeowners received this week.</p>
          </div>
          <ul className="divide-y divide-border/70 px-5 pb-3">
            {recent.map((r) => (
              <li key={r.visit.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/visits/${r.visit.id}`} className="min-w-0 flex-1 hover:underline">
                  <p className="truncate text-sm">
                    {r.estate.name} <span className="text-muted-foreground">· {r.service.name}</span>
                  </p>
                </Link>
                <span className="text-xs text-subtle">{relTime(r.visit.sentAt)}</span>
                <Pill tone="green">Sent</Pill>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function rank(a?: string | null) {
  return a === "urgent" ? 3 : a === "decision" ? 2 : a === "note" ? 1 : 0;
}
