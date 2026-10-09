import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getEstate } from "@/lib/queries";
import { PageHeader, Card, CardHeader, Pill, Button, Avatar, KV, Notice, Field, Input, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { VisitList } from "@/components/visits/visit-card";
import { Timeline } from "@/components/visits/timeline";
import { fmtDate, fmtPhone, relTime, ROLE_LABEL, WINDOW_LABEL, pluralize } from "@/lib/format";
import { saveContact, removeContact, setAssignment, saveRecurring, toggleRecurring, removeRecurring, updateEstate } from "@/lib/actions/directory";
import { CopyLink } from "@/components/copy-link";
import { cn } from "@/lib/utils";
import { MapPin, KeyRound, Mail, MessageSquare, CalendarPlus } from "lucide-react";

const TABS = [
  ["overview", "Overview"],
  ["people", "People"],
  ["vendors", "Vendors"],
  ["services", "Recurring"],
  ["history", "History"],
  ["messages", "Messages"],
  ["edit", "Edit"],
] as const;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function EstatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const e = await getEstate(id);
  if (!e) notFound();
  const tab = (TABS.find((t) => t[0] === sp.tab)?.[0] ?? "overview") as (typeof TABS)[number][0];
  const primary = e.contacts.find((c) => c.isPrimary) ?? e.contacts[0];
  const now = Date.now();
  const past = e.visits.filter((r) => ["sent", "approved", "submitted", "closed"].includes(r.visit.status));
  const upcoming = e.visits.filter((r) => ["scheduled", "requested", "in_progress"].includes(r.visit.status) && r.visit.scheduledFor.getTime() > now - 6 * 3600000).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
  const trades = [...new Set(e.allVendors.map((v) => v.trade))].sort();
  const openRequests = e.requests.filter((r) => r.status === "new");

  // Health strip: per assigned trade, last and next
  const health = e.assignments.map((a) => {
    const last = past.find((r) => r.vendor.trade === a.trade);
    const next = upcoming.find((r) => r.vendor.trade === a.trade);
    const rec = e.recurring.find((r) => r.vendor.trade === a.trade && r.active);
    const daysSince = last?.visit.completedAt ? Math.floor((now - last.visit.completedAt.getTime()) / 86400000) : null;
    const expectedDays = rec ? (rec.cadence === "weekly" ? 7 : rec.cadence === "biweekly" ? 14 : rec.cadence === "monthly" ? 30 : 90) : null;
    const overdue = expectedDays !== null && daysSince !== null && daysSince > expectedDays + 2 && !next;
    return { trade: a.trade, vendor: a.vendor, last, next, rec, daysSince, overdue };
  });

  return (
    <div>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-ink">
        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={e.estate.coverImage ? { backgroundImage: `url(${e.estate.coverImage})` } : undefined} />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/30 to-transparent" />
        <div className="relative flex min-h-56 flex-col justify-end p-6 text-porcelain sm:p-8">
          <Link href="/estates" className="mb-3 text-xs font-medium text-porcelain/70 hover:text-porcelain">
            ← Estates
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="display text-3xl sm:text-4xl">{e.estate.name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-porcelain/85">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {[e.estate.address1, e.estate.city, e.estate.state].filter(Boolean).join(", ")}
                </span>
                {e.estate.gateCode ? (
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" /> Gate {e.estate.gateCode}
                  </span>
                ) : null}
                {e.estate.status === "paused" ? <Pill tone="slate">Paused</Pill> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href={`/schedule/new?estate=${e.estate.id}`}>
                <CalendarPlus className="h-4 w-4" /> Schedule a visit
              </Button>
              {primary ? <CopyLink path={`/home/${primary.portalToken}`} label="Owner page" /> : null}
            </div>
          </div>
        </div>
      </div>

      {sp.welcome ? (
        <div className="mb-5">
          <Notice tone="green" title={`${e.estate.name} is live`}>
            {primary ? `${primary.name} received the welcome note with their private page.` : "Add a contact so reports have somewhere to go."} Recurring services will generate their first visits automatically.
          </Notice>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-muted p-1 sm:inline-flex">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/estates/${e.estate.id}?tab=${k}`} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition", tab === k ? "bg-card shadow-xs" : "text-muted-foreground hover:text-foreground")}>
            {label}
            {k === "overview" && openRequests.length ? <span className="ml-1 rounded-full bg-warning-soft px-1.5 text-xs text-warning">{openRequests.length}</span> : null}
          </Link>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card>
              <CardHeader title="House at a glance" description="Each trade this house uses, when it was last seen, and when it is next due." />
              <div className="grid gap-px overflow-hidden rounded-b-2xl bg-border/70 sm:grid-cols-2 lg:grid-cols-3">
                {health.map((h) => (
                  <div key={h.trade} className="bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{h.trade}</p>
                      {h.overdue ? <Pill tone="red">Overdue</Pill> : h.next ? <Pill tone="blue">{fmtDate(h.next.visit.scheduledFor)}</Pill> : h.rec ? <Pill tone="slate">{h.rec.cadence}</Pill> : null}
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium">{h.vendor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.last ? `Last ${h.last.service.name.toLowerCase()} ${h.daysSince === 0 ? "today" : `${h.daysSince} days ago`}` : "No visits yet"}
                    </p>
                  </div>
                ))}
                {health.length === 0 ? <p className="bg-card p-6 text-center text-xs text-subtle">No vendors assigned yet. Add them under Vendors.</p> : null}
              </div>
            </Card>

            {openRequests.length ? (
              <Card>
                <CardHeader title={`${pluralize(openRequests.length, "open request")}`} />
                <ul className="divide-y divide-border/70 px-5 pb-3">
                  {openRequests.map((q) => (
                    <li key={q.id} className="flex items-center justify-between gap-3 py-2.5">
                      <p className="min-w-0 flex-1 text-sm">
                        <span className="font-medium">{q.contact?.name ?? "Homeowner"}:</span> “{q.message}”
                      </p>
                      <Button href={`/schedule/new?estate=${e.estate.id}&request=${q.id}&note=${encodeURIComponent(q.message)}`} size="sm">
                        Schedule
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <Card>
              <CardHeader title="Upcoming" description={upcoming.length ? `${pluralize(upcoming.length, "visit")} on the books.` : "Nothing scheduled."} />
              <div className="px-2 pb-2">
                <VisitList rows={upcoming.slice(0, 6)} emptyText="Nothing scheduled." showDate />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Recent reports"
                action={
                  <Link href={`/estates/${e.estate.id}?tab=history`} className="text-xs font-medium text-primary hover:underline">
                    Full history
                  </Link>
                }
              />
              <div className="px-2 pb-2">
                <VisitList rows={past.slice(0, 6)} emptyText="No reports yet." showDate />
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader title="People" action={<Link href={`/estates/${e.estate.id}?tab=people`} className="text-xs font-medium text-primary hover:underline">Manage</Link>} />
              <ul className="divide-y divide-border/70 px-5 pb-3">
                {e.contacts.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={c.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.name} {c.isPrimary ? <span className="text-xs font-normal text-subtle">primary</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABEL[c.role]}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-subtle">
                      {c.phone && c.smsOptIn ? <MessageSquare className="h-3.5 w-3.5" /> : null}
                      {c.email && c.emailOptIn ? <Mail className="h-3.5 w-3.5" /> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Access" />
              <div className="divide-y divide-border/70 px-5 pb-3">
                <KV k="Gate code" v={e.estate.gateCode ? <span className="tabular">{e.estate.gateCode}</span> : null} />
                <KV k="Access notes" v={e.estate.accessNotes ? <span className="text-xs">{e.estate.accessNotes}</span> : null} />
                <KV k="House notes" v={e.estate.notes ? <span className="text-xs">{e.estate.notes}</span> : null} />
              </div>
            </Card>
            <Card>
              <CardHeader title="Activity" />
              <div className="px-5 pb-3">
                <Timeline items={e.activity.slice(0, 10)} relative />
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "people" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {e.contacts.map((c) => (
              <Card key={c.id} className="p-4">
                <form action={saveContact} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="estateId" value={e.estate.id} />
                  <input type="hidden" name="contactId" value={c.id} />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABEL[c.role]} · {c.phone ? fmtPhone(c.phone) : "no phone"} · {c.email ?? "no email"}
                      </p>
                    </div>
                    <CopyLink path={`/home/${c.portalToken}`} label="Private page" />
                  </div>
                  <Field label="Name">
                    <Input name="name" defaultValue={c.name} required />
                  </Field>
                  <Field label="Role">
                    <Select name="role" defaultValue={c.role}>
                      <option value="homeowner">Homeowner</option>
                      <option value="home_manager">Home manager</option>
                      <option value="assistant">Assistant</option>
                    </Select>
                  </Field>
                  <Field label="Mobile">
                    <Input name="phone" defaultValue={c.phone ?? ""} />
                  </Field>
                  <Field label="Email">
                    <Input name="email" defaultValue={c.email ?? ""} />
                  </Field>
                  <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
                    <Toggle name="smsOptIn" defaultChecked={c.smsOptIn} label="Text reports" />
                    <Toggle name="emailOptIn" defaultChecked={c.emailOptIn} label="Email reports" />
                    <Toggle name="isPrimary" defaultChecked={c.isPrimary} label="Primary contact" />
                  </div>
                  <div className="flex items-center justify-between sm:col-span-2">
                    <button type="submit" formAction={removeContact} className="text-xs text-muted-foreground hover:text-danger">
                      Remove
                    </button>
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-5">
            <Card className="p-4">
              <p className="text-sm font-semibold">Add a person</p>
              <form action={saveContact} className="mt-3 grid gap-3">
                <input type="hidden" name="estateId" value={e.estate.id} />
                <Field label="Name">
                  <Input name="name" required placeholder="Daniel Reyes" />
                </Field>
                <Field label="Role">
                  <Select name="role" defaultValue="home_manager">
                    <option value="homeowner">Homeowner</option>
                    <option value="home_manager">Home manager</option>
                    <option value="assistant">Assistant</option>
                  </Select>
                </Field>
                <Field label="Mobile">
                  <Input name="phone" placeholder="(561) 555-0172" />
                </Field>
                <Field label="Email">
                  <Input name="email" placeholder="daniel@example.com" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Toggle name="smsOptIn" defaultChecked label="Text reports" />
                  <Toggle name="emailOptIn" defaultChecked label="Email reports" />
                </div>
                <Button type="submit">Add</Button>
              </form>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "vendors" ? (
        <Card>
          <CardHeader title="Usual vendors by trade" description="Scheduling pre-fills from this list. Change a vendor here and every future visit for that trade follows." />
          <div className="divide-y divide-border/70 px-5 pb-3">
            {trades.map((t) => {
              const current = e.assignments.find((a) => a.trade === t);
              return (
                <form key={t} action={setAssignment} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                  <input type="hidden" name="estateId" value={e.estate.id} />
                  <input type="hidden" name="trade" value={t} />
                  <div className="w-36 shrink-0">
                    <p className="text-sm font-medium">{t}</p>
                    {current ? <p className="text-xs text-muted-foreground">{current.vendor.contactName ? `${current.vendor.contactName} · ` : ""}{fmtPhone(current.vendor.phone)}</p> : <p className="text-xs text-subtle">Not needed</p>}
                  </div>
                  <Select name="vendorId" defaultValue={current?.vendorId ?? ""} className="sm:max-w-xs">
                    <option value="">Not needed</option>
                    {e.allVendors
                      .filter((v) => v.trade === t)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                  </Select>
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </form>
              );
            })}
          </div>
        </Card>
      ) : null}

      {tab === "services" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card>
              <CardHeader title="Recurring services" description="Visits generate from these and the vendor is dispatched automatically. Pause one when the owners are away." />
              <ul className="divide-y divide-border/70 px-5 pb-3">
                {e.recurring.length === 0 ? <li className="py-6 text-center text-xs text-subtle">Nothing recurring yet.</li> : null}
                {e.recurring.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium", !r.active && "text-subtle line-through")}>{r.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.vendor.name} · {r.cadence} on {WEEKDAYS[r.weekday]} {WINDOW_LABEL[r.window].toLowerCase()}
                        {r.nextAt ? ` · next ${fmtDate(r.nextAt)}` : ""}
                      </p>
                    </div>
                    <form action={toggleRecurring}>
                      <input type="hidden" name="estateId" value={e.estate.id} />
                      <input type="hidden" name="recurringId" value={r.id} />
                      <Button type="submit" size="sm" variant="outline">
                        {r.active ? "Pause" : "Resume"}
                      </Button>
                    </form>
                    <form action={removeRecurring}>
                      <input type="hidden" name="estateId" value={e.estate.id} />
                      <input type="hidden" name="recurringId" value={r.id} />
                      <button type="submit" className="text-xs text-muted-foreground hover:text-danger">
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-5">
            <Card className="p-4">
              <p className="text-sm font-semibold">Add a recurring service</p>
              <form action={saveRecurring} className="mt-3 grid gap-3">
                <input type="hidden" name="estateId" value={e.estate.id} />
                <Field label="Service">
                  <Select name="serviceTypeId" required>
                    {e.allServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Vendor">
                  <Select name="vendorId" required>
                    {e.allVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} · {v.trade}
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
                <Button type="submit">Add</Button>
              </form>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "history" ? (
        <Card>
          <CardHeader title={`${pluralize(e.visits.length, "visit")} on record`} description="The house’s service history. Every report, every photo, every reply." />
          <div className="px-2 pb-2">
            <VisitList rows={e.visits} emptyText="No visits yet." showDate />
          </div>
        </Card>
      ) : null}

      {tab === "messages" ? (
        <Card>
          <CardHeader title="Messages for this house" description="Everything texted or emailed to the people and vendors of this estate." />
          <ul className="divide-y divide-border/70 px-5 pb-3">
            {e.notifications.length === 0 ? <li className="py-6 text-center text-xs text-subtle">Nothing sent yet.</li> : null}
            {e.notifications.map((n) => (
              <li key={n.id} className="py-2.5">
                <Link href={`/outbox/${n.id}`} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      {n.channel === "sms" ? <MessageSquare className="h-3.5 w-3.5 text-primary" /> : <Mail className="h-3.5 w-3.5 text-primary" />}
                      {n.toName ?? n.to} <span className="font-normal text-subtle">· {n.audience}</span>
                    </p>
                    <span className="text-xs text-subtle">{relTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{n.subject ?? n.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === "edit" ? (
        <Card className="p-5">
          <form action={updateEstate} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="estateId" value={e.estate.id} />
            <input type="hidden" name="coverImage" value={e.estate.coverImage ?? ""} />
            <Field label="House name" className="sm:col-span-2">
              <Input name="name" defaultValue={e.estate.name} required />
            </Field>
            <Field label="Street address">
              <Input name="address1" defaultValue={e.estate.address1 ?? ""} />
            </Field>
            <div className="grid grid-cols-[1fr_72px_96px] gap-2">
              <Field label="City">
                <Input name="city" defaultValue={e.estate.city ?? ""} />
              </Field>
              <Field label="State">
                <Input name="state" defaultValue={e.estate.state ?? "FL"} />
              </Field>
              <Field label="Zip">
                <Input name="zip" defaultValue={e.estate.zip ?? ""} />
              </Field>
            </div>
            <Field label="Gate code">
              <Input name="gateCode" defaultValue={e.estate.gateCode ?? ""} />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={e.estate.status}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </Select>
            </Field>
            <Field label="Access notes" className="sm:col-span-2">
              <Input name="accessNotes" defaultValue={e.estate.accessNotes ?? ""} />
            </Field>
            <Field label="House notes" className="sm:col-span-2">
              <Textarea name="notes" defaultValue={e.estate.notes ?? ""} />
            </Field>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
