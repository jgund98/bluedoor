import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { serviceContext, schedulingOptions } from "@/lib/queries";
import { PageHeader, Card, CardHeader, Button, Avatar, Field, Select, Pill } from "@/components/ui/primitives";
import { ChecklistBuilder } from "@/components/checklist-builder";
import { VisitList } from "@/components/visits/visit-card";
import { saveRecurring } from "@/lib/actions/directory";
import { fmtDate, WINDOW_LABEL } from "@/lib/format";
import { CalendarPlus, Star } from "lucide-react";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  const ctx = isNew ? null : await serviceContext(id);
  if (!isNew && !ctx) notFound();
  const o = await schedulingOptions(user.orgId);
  const trades = [...new Set([...o.vendors.map((v) => v.trade), ...o.services.map((s) => s.trade)])].sort();
  const service = ctx?.service ?? null;
  const tab = sp.tab === "checklist" || isNew ? "checklist" : "overview";

  return (
    <div>
      <PageHeader
        back={{ href: "/services", label: "Services" }}
        eyebrow={service?.trade ?? "New"}
        title={service?.name ?? "New checklist"}
        description={isNew ? "Each step becomes a tap on the vendor’s phone. Mark a step as needing a photo and they cannot submit without one." : `${service!.checklist.length} steps · ${service!.durationMin} min · ${service!.minPhotos}+ photos`}
        actions={
          !isNew ? (
            <>
              <Button href={`/services/${id}?tab=${tab === "overview" ? "checklist" : "overview"}`} variant="outline">
                {tab === "overview" ? "Edit checklist" : "Overview"}
              </Button>
              <Button href={`/schedule/new?service=${id}`}>
                <CalendarPlus className="h-4 w-4" /> Schedule
              </Button>
            </>
          ) : undefined
        }
      />

      {tab === "checklist" ? (
        <ChecklistBuilder
          trades={trades}
          service={service ? { id: service.id, name: service.name, trade: service.trade, instructions: service.instructions ?? "", checklist: service.checklist, minPhotos: service.minPhotos, durationMin: service.durationMin } : null}
        />
      ) : null}

      {tab === "overview" && ctx ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card>
              <CardHeader title={`Houses with ${service!.name.toLowerCase()}`} description="Where this service runs on a schedule, and which vendor does it there." />
              <ul className="divide-y divide-border/70 px-5 pb-3">
                {ctx.recurring.length === 0 ? <li className="py-8 text-center text-sm text-subtle">Not set up at any house yet. Add it on the right.</li> : null}
                {ctx.recurring.map(({ recurring, estate, vendor }) => (
                  <li key={recurring.id} className="flex items-center gap-3 py-3">
                    <Link href={`/estates/${estate.id}?tab=services`} className="h-10 w-10 shrink-0 rounded-lg bg-muted bg-cover bg-center" style={estate.coverImage ? { backgroundImage: `url(${estate.coverImage})` } : undefined} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/estates/${estate.id}?tab=services`} className="text-base font-medium hover:underline">
                        {estate.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        <Link href={`/vendors/${vendor.id}`} className="hover:underline">
                          {vendor.name}
                        </Link>{" "}
                        · {recurring.cadence} on {WEEKDAYS[recurring.weekday]} {WINDOW_LABEL[recurring.window].toLowerCase()}
                        {recurring.nextAt ? ` · next ${fmtDate(recurring.nextAt)}` : ""}
                      </p>
                    </div>
                    {!recurring.active ? <Pill tone="slate">Paused</Pill> : null}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Checklist" description={service!.instructions ?? "What the vendor is walked through on their phone."} action={<Link href={`/services/${id}?tab=checklist`} className="text-sm font-medium text-primary hover:underline">Edit</Link>} />
              <ol className="grid gap-1.5 px-5 pb-5 sm:grid-cols-2">
                {service!.checklist.map((c, n) => (
                  <li key={c.key} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-right tabular text-subtle">{n + 1}.</span> {c.label}
                    {c.photo ? <span className="text-xs text-subtle">photo</span> : null}
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <CardHeader title="Recent visits" />
              <div className="px-2 pb-2">
                <VisitList rows={ctx.recent} emptyText="No visits yet." showDate />
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader title="Vendors who perform this" description={`Every ${service!.trade.toLowerCase()} vendor can be sent this checklist.`} action={<Link href="/vendors/new" className="text-sm font-medium text-primary hover:underline">Add vendor</Link>} />
              <ul className="divide-y divide-border/70 px-5 pb-3">
                {ctx.vendors.length === 0 ? <li className="py-6 text-center text-sm text-subtle">No {service!.trade.toLowerCase()} vendors yet.</li> : null}
                {ctx.vendors.map(({ vendor, houses, visits }) => (
                  <li key={vendor.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={vendor.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/vendors/${vendor.id}`} className="text-sm font-medium hover:underline">
                        {vendor.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {houses} {houses === 1 ? "house" : "houses"} · {visits} {visits === 1 ? "visit" : "visits"} of this service
                      </p>
                    </div>
                    {vendor.rating ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-brass">
                        <Star className="h-3.5 w-3.5 fill-current" /> {vendor.rating}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <p className="text-base font-semibold">Add to a house</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Pick the house and the vendor. Visits generate on the schedule and the vendor is notified automatically.</p>
              <form action={saveRecurring} className="mt-4 grid gap-3">
                <input type="hidden" name="serviceTypeId" value={id} />
                <Field label="House">
                  <Select name="estateId" required>
                    {ctx.estates.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Vendor">
                  <Select name="vendorId" required>
                    {ctx.vendors.map(({ vendor }) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Cadence">
                    <Select name="cadence" defaultValue="weekly">
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </Select>
                  </Field>
                  <Field label="Day">
                    <Select name="weekday" defaultValue="2">
                      {WEEKDAYS.map((d, n) => (
                        <option key={d} value={n}>
                          {d.slice(0, 3)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Window">
                    <Select name="window" defaultValue="morning">
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" disabled={ctx.vendors.length === 0}>
                  Add to house
                </Button>
              </form>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
