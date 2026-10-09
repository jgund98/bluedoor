import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEstates } from "@/lib/queries";
import { PageHeader, Button, Pill, Avatar } from "@/components/ui/primitives";
import { fmtDate, relTime, STATUS, type VisitStatus } from "@/lib/format";
import { MapPin } from "lucide-react";

export const metadata = { title: "Estates" };

export default async function EstatesPage() {
  const user = await requireUser();
  const rows = await listEstates(user.orgId);
  return (
    <div>
      <PageHeader eyebrow="Estates" title={`${rows.length} houses under management`} description="People, vendors, recurring services, and visit history per house." actions={<Button href="/estates/new">Onboard an estate</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ estate, primary, contacts, last, next, open, vendorsAssigned }) => (
          <Link key={estate.id} href={`/estates/${estate.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-md">
            <div className="relative h-40 bg-muted bg-cover bg-center" style={estate.coverImage ? { backgroundImage: `url(${estate.coverImage})` } : undefined}>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-abyss/75 via-abyss/20 to-transparent p-4 text-porcelain">
                <p className="display text-xl">{estate.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs opacity-85">
                  <MapPin className="h-3 w-3" /> {[estate.address1, estate.city].filter(Boolean).join(", ")}
                </p>
              </div>
              {open ? <span className="absolute right-3 top-3 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-white shadow">{open} waiting</span> : null}
              {estate.status === "paused" ? <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink">Paused</span> : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-center gap-2.5">
                <Avatar name={primary?.name ?? "?"} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{primary?.name ?? "No contact yet"}</p>
                  <p className="text-xs text-muted-foreground">
                    {contacts.length} {contacts.length === 1 ? "contact" : "contacts"} · {vendorsAssigned} vendors
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-xs text-subtle">Last visit</p>
                  {last ? (
                    <p className="mt-0.5 truncate font-medium">
                      {last.service.name}
                      <span className="block text-xs font-normal text-muted-foreground">{relTime(last.visit.completedAt ?? last.visit.scheduledFor)}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-subtle">None</p>
                  )}
                </div>
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-xs text-subtle">Next</p>
                  {next ? (
                    <p className="mt-0.5 truncate font-medium">
                      {next.service.name}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {fmtDate(next.visit.scheduledFor)} · <Pill tone={STATUS[next.visit.status as VisitStatus].tone} className="px-1 py-0 text-xs">{STATUS[next.visit.status as VisitStatus].label}</Pill>
                      </span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-subtle">Nothing scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
