import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listVendors } from "@/lib/queries";
import { PageHeader, Button, Pill, Avatar } from "@/components/ui/primitives";
import { fmtDate, fmtPhone, relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export const metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const user = await requireUser();
  const rows = (await listVendors(user.orgId)).sort((a, b) => a.vendor.name.localeCompare(b.vendor.name));

  return (
    <div>
      <PageHeader eyebrow="Vendors" title={`${rows.length} vendors`} description="On-time rate, filing speed, and flags are calculated from their visits." actions={<Button href="/vendors/new">Add a vendor</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ vendor, stats, next }) => (
          <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md">
            <div className="flex items-start gap-3">
              <Avatar name={vendor.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{vendor.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {vendor.contactName ?? ""}
                  {vendor.phone ? ` · ${fmtPhone(vendor.phone)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {vendor.rating ? (
                  <span className="inline-flex items-center gap-0.5 text-xs text-brass">
                    <Star className="h-3.5 w-3.5 fill-current" /> {vendor.rating}
                  </span>
                ) : null}
                <Pill tone={vendor.status === "paused" ? "slate" : "blue"}>{vendor.status === "paused" ? "Paused" : vendor.trade}</Pill>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/70 px-2 py-2">
                <p className={cn("text-lg font-semibold tabular", stats.onTimePct !== null && stats.onTimePct < 80 ? "text-warning" : "")}>{stats.onTimePct === null ? "—" : `${stats.onTimePct}%`}</p>
                <p className="text-xs text-subtle">on time</p>
              </div>
              <div className="rounded-xl bg-muted/70 px-2 py-2">
                <p className="text-lg font-semibold tabular">{stats.avgReportMinutes === null ? "—" : `${stats.avgReportMinutes}m`}</p>
                <p className="text-xs text-subtle">to file</p>
              </div>
              <div className="rounded-xl bg-muted/70 px-2 py-2">
                <p className="text-lg font-semibold tabular">{stats.completed}</p>
                <p className="text-xs text-subtle">visits</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {stats.estates} {stats.estates === 1 ? "house" : "houses"}
              {stats.lastVisit ? ` · last visit ${relTime(stats.lastVisit)}` : ""}
              {next ? ` · next ${fmtDate(next.visit.scheduledFor)} at ${next.estate.name}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
