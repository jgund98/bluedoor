import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getVendor } from "@/lib/queries";
import { PageHeader, Card, CardHeader, Pill, Button, Avatar, Stat, Notice, Field, Input, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { VisitList } from "@/components/visits/visit-card";
import { fmtPhone, relTime, thumb } from "@/lib/format";
import { updateVendor } from "@/lib/actions/directory";
import { CopyLink } from "@/components/copy-link";
import { Star, Phone, Mail, CalendarPlus } from "lucide-react";

export default async function VendorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const v = await getVendor(id);
  if (!v) notFound();
  const upcoming = v.visits.filter((r) => ["scheduled", "requested", "in_progress"].includes(r.visit.status)).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
  const past = v.visits.filter((r) => ["sent", "approved", "submitted", "closed", "cancelled"].includes(r.visit.status));

  return (
    <div>
      <PageHeader
        back={{ href: "/vendors", label: "Vendors" }}
        eyebrow={v.vendor.trade}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={v.vendor.name} size="lg" />
            <span>
              {v.vendor.name}
              {v.vendor.rating ? (
                <span className="ml-2 inline-flex items-center gap-0.5 align-middle text-sm font-normal text-brass">
                  <Star className="h-4 w-4 fill-current" /> {v.vendor.rating}
                </span>
              ) : null}
              {v.vendor.status === "paused" ? <Pill tone="slate" className="ml-2 align-middle">Paused</Pill> : null}
            </span>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {v.vendor.contactName ? <span>{v.vendor.contactName}</span> : null}
            {v.vendor.phone ? (
              <a href={`tel:${v.vendor.phone}`} className="inline-flex items-center gap-1 hover:underline">
                <Phone className="h-3 w-3" /> {fmtPhone(v.vendor.phone)}
              </a>
            ) : null}
            {v.vendor.email ? (
              <a href={`mailto:${v.vendor.email}`} className="inline-flex items-center gap-1 hover:underline">
                <Mail className="h-3 w-3" /> {v.vendor.email}
              </a>
            ) : null}
          </span>
        }
        actions={
          <>
            <CopyLink path={`/vendor/${v.vendor.token}`} label="Their schedule link" />
            <Button href={`/schedule/new?vendor=${v.vendor.id}`}>
              <CalendarPlus className="h-4 w-4" /> Schedule
            </Button>
          </>
        }
      />
      {sp.welcome ? (
        <div className="mb-5">
          <Notice tone="green" title={`${v.vendor.name} is set up`}>
            {v.vendor.contactName ?? "They"} received the welcome message with their schedule link. Assign them to houses below and they appear in scheduling automatically.
          </Notice>
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="On time" value={v.stats.onTimePct === null ? "—" : `${v.stats.onTimePct}%`} hint="arrived within 20 min" tone={v.stats.onTimePct !== null && v.stats.onTimePct < 80 ? "amber" : undefined} />
        <Stat label="Files in" value={v.stats.avgReportMinutes === null ? "—" : `${v.stats.avgReportMinutes} min`} hint="after finishing" />
        <Stat label="Visits" value={v.stats.completed} hint={`${v.stats.total} total`} />
        <Stat label="Flagged" value={v.stats.flagged} hint="needed attention" tone={v.stats.flagged ? "amber" : undefined} />
        <Stat label="Houses" value={v.stats.estates} hint="assigned" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader title="Upcoming" description={upcoming.length ? `${upcoming.length} on the books. Links go out automatically.` : "Nothing scheduled."} />
            <div className="px-2 pb-2">
              <VisitList rows={upcoming} emptyText="Nothing scheduled." showDate />
            </div>
          </Card>
          <Card>
            <CardHeader title="History" description="Every visit this vendor has made for Bluedoor." />
            <div className="px-2 pb-2">
              <VisitList rows={past} emptyText="No visits yet." showDate />
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader title="Houses they serve" description={`Usual ${v.vendor.trade.toLowerCase()} vendor at these estates.`} />
            <ul className="divide-y divide-border/70 px-5 pb-3">
              {v.estates.length === 0 ? <li className="py-6 text-center text-xs text-subtle">Not assigned anywhere yet. Assign from an estate’s Vendors tab.</li> : null}
              {v.estates.map((e) => (
                <li key={e.id} className="py-2">
                  <Link href={`/estates/${e.id}?tab=vendors`} className="flex items-center gap-3 hover:underline">
                    <span className="h-8 w-8 rounded-lg bg-muted bg-cover bg-center" style={e.coverImage ? { backgroundImage: `url(${thumb(e.coverImage)})` } : undefined} />
                    <span className="text-sm font-medium">{e.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Services they perform" description="Checklists for this trade." />
            <ul className="divide-y divide-border/70 px-5 pb-3">
              {v.services.map((s) => (
                <li key={s.id} className="py-2">
                  <Link href={`/services/${s.id}`} className="text-sm hover:underline">
                    {s.name} <span className="text-xs text-muted-foreground">· {s.checklist.length} steps</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold">Edit vendor</p>
            {v.vendor.notes ? <p className="mt-1 text-xs text-muted-foreground">Office notes: {v.vendor.notes}</p> : null}
            <form action={updateVendor} className="mt-3 grid gap-3">
              <input type="hidden" name="vendorId" value={v.vendor.id} />
              <Field label="Company">
                <Input name="name" defaultValue={v.vendor.name} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Trade">
                  <Input name="trade" defaultValue={v.vendor.trade} />
                </Field>
                <Field label="Rating">
                  <Select name="rating" defaultValue={String(v.vendor.rating ?? "")}>
                    <option value="">None</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Contact">
                <Input name="contactName" defaultValue={v.vendor.contactName ?? ""} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mobile">
                  <Input name="phone" defaultValue={v.vendor.phone ?? ""} />
                </Field>
                <Field label="Email">
                  <Input name="email" defaultValue={v.vendor.email ?? ""} />
                </Field>
              </div>
              <Field label="Office notes">
                <Textarea name="notes" defaultValue={v.vendor.notes ?? ""} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Toggle name="notifySms" defaultChecked={v.vendor.notifySms} label="Text" description={v.vendor.phone ? fmtPhone(v.vendor.phone) : "No mobile on file"} />
                <Toggle name="notifyEmail" defaultChecked={v.vendor.notifyEmail} label="Email" description={v.vendor.email ?? "No email on file"} />
              </div>
              <Field label="Status">
                <Select name="status" defaultValue={v.vendor.status}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </Select>
              </Field>
              <Button type="submit">Save</Button>
            </form>
          </Card>
          <p className="text-xs text-subtle">Added {relTime(v.vendor.createdAt)}.</p>
        </div>
      </div>
    </div>
  );
}
