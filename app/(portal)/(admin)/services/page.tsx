import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listServiceTypes } from "@/lib/queries";
import { PageHeader, Button, Pill } from "@/components/ui/primitives";
import { Camera, Clock } from "lucide-react";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const user = await requireUser();
  const rows = (await listServiceTypes(user.orgId)).sort((a, b) => a.service.name.localeCompare(b.service.name));
  return (
    <div>
      <PageHeader eyebrow="Services" title="Checklists" description="Step-by-step checklists vendors follow on their phone." actions={<Button href="/services/new">New checklist</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ service, uses }) => (
          <Link key={service.id} href={`/services/${service.id}`} className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{service.name}</p>
              <Pill tone="blue">{service.trade}</Pill>
            </div>
            <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {service.durationMin} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Camera className="h-3 w-3" /> {service.minPhotos}+ photos
              </span>
              <span>{uses} visits</span>
            </p>
            <ol className="mt-3 space-y-1">
              {service.checklist.slice(0, 4).map((c, n) => (
                <li key={c.key} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right tabular text-subtle">{n + 1}.</span> {c.label}
                  {c.photo ? <Camera className="h-3 w-3 text-subtle" /> : null}
                </li>
              ))}
              {service.checklist.length > 4 ? <li className="pl-6 text-xs text-subtle">and {service.checklist.length - 4} more</li> : null}
            </ol>
          </Link>
        ))}
      </div>
    </div>
  );
}
