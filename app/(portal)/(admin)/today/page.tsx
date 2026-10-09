import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { todayData } from "@/lib/queries";
import { Card, CardHeader, Pill, Button, Stat, Avatar } from "@/components/ui/primitives";
import { VisitList } from "@/components/visits/visit-card";
import { Timeline } from "@/components/visits/timeline";
import { ATTENTION, fmtLongDate, fmtTime, relTime, TZ, pluralize, thumb } from "@/lib/format";
import { completeTask } from "@/lib/actions/visits";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Today" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date())) % 24;
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function TodayPage() {
  const user = await requireUser();
  const d = await todayData(user.orgId);
  const first = user.name.split(" ")[0];
  const needs = d.approvals.length + d.replies.length + d.requests.length;
  const urgent = d.approvals.filter((r) => r.report?.attention === "urgent");
  const estateMap = new Map(d.estates.map((e) => [e.id, e]));
  const nextUp = d.today[0];
  const lastSent = d.sentThisWeek.sort((a, b) => (b.visit.sentAt?.getTime() ?? 0) - (a.visit.sentAt?.getTime() ?? 0))[0];
  const activeEstates = d.estates.filter((e) => e.status === "active").length;
  const list = (names: string[]) => names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");

  return (
    <div className="space-y-6">
      <div className=" flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="eyebrow text-subtle">{fmtLongDate(new Date())}</p>
          <h1 className="display mt-1 text-3xl text-ink sm:text-4xl lg:text-5xl">
            {greeting()}, {first}.
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {activeEstates} houses under management · {d.vendors.filter((v) => v.status === "active").length} vendors
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/schedule/new" size="lg" className="flex-1 sm:flex-none">
            Schedule a visit
          </Button>
          <div className="hidden sm:block">
            <Button href="/approvals" variant="outline" size="lg">
              Open approvals
            </Button>
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5 [&>a:last-child]:col-span-2 xl:[&>a:last-child]:col-span-1">
        <Stat
          href="/approvals"
          label="Needs approval"
          value={d.approvals.length}
          tone={urgent.length ? "red" : d.approvals.length ? "amber" : undefined}
          hint={urgent.length ? `${urgent.length} urgent` : undefined}
          detail={d.approvals.length ? list(d.approvals.map((r) => `${r.estate.name}${r.report?.attention === "urgent" ? " (urgent)" : ""}`)) : "Nothing waiting"}
        />
        <Stat
          href="/visits?f=open"
          label="On site now"
          value={d.onSite.length}
          detail={d.onSite.length ? list(d.onSite.map((r) => `${r.vendor.name} at ${r.estate.name}${r.visit.arrivedAt ? ` since ${fmtTime(r.visit.arrivedAt)}` : ""}`)) : "No one checked in"}
        />
        <Stat
          href="/schedule"
          label="Still today"
          value={d.today.length}
          detail={nextUp ? `Next ${fmtTime(nextUp.visit.scheduledFor)} · ${nextUp.vendor.name} at ${nextUp.estate.name}` : "Nothing more scheduled"}
        />
        <Stat
          href="/visits?f=sent"
          label="Sent this week"
          value={d.sentThisWeek.length}
          tone={d.sentThisWeek.length ? "green" : undefined}
          detail={lastSent ? `Last to ${lastSent.estate.name} ${relTime(lastSent.visit.sentAt)}` : "No reports yet"}
        />
        <Stat
          href="/requests"
          label="Requests"
          value={d.requests.length}
          tone={d.requests.length ? "amber" : undefined}
          detail={d.requests.length ? list(d.requests.map((q) => `${q.contact?.name?.split(" ")[0] ?? "Owner"} · ${q.estate.name}`)) : "Inbox is clear"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className="">
            <CardHeader
              title={needs ? `Needs you (${needs})` : "Needs you"}
              description="Reports to approve, replies to act on, and requests to schedule. Most urgent first."
              action={
                <Link href="/approvals" className="text-sm font-medium text-primary hover:underline">
                  All approvals
                </Link>
              }
            />
            <div className="px-3 pb-3">
              {needs === 0 ? <p className="px-3 py-10 text-center text-sm text-subtle">Clear. Nothing is waiting on the office.</p> : null}
              {d.approvals.map((r) => {
                const att = ATTENTION[r.report?.attention ?? "none"];
                return (
                  <Link key={r.visit.id} href={`/visits/${r.visit.id}`} className="group mb-2 block rounded-xl border border-border bg-card p-3.5 transition hover:border-primary/40 hover:shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-muted bg-cover bg-center" style={r.estate.coverImage ? { backgroundImage: `url(${thumb(r.estate.coverImage)})` } : undefined} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <p className="text-base font-semibold">{r.estate.name}</p>
                          {att.label !== "Routine" ? <Pill tone={att.tone}>{att.label}</Pill> : null}
                          <span className="text-sm text-subtle">filed {relTime(r.visit.submittedAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {r.service.name} · {r.vendor.name}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-foreground/85">{r.report?.attentionNote || r.report?.vendorNote || r.report?.recapDraft}</p>
                      </div>
                      <span className="mt-1 hidden items-center gap-1 text-sm font-medium text-primary group-hover:underline sm:inline-flex">
                        Review <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
              {d.replies.map(({ response, row, contact }) => (
                <Link key={response.id} href={`/visits/${row.visit.id}`} className="mb-2 flex items-start gap-3.5 rounded-xl border border-border bg-card p-3.5 transition hover:border-primary/40 hover:shadow-sm">
                  <Avatar name={contact?.name ?? "Owner"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-base font-semibold">{contact?.name ?? "Homeowner"} replied</p>
                      <span className="text-sm text-muted-foreground">{row.estate.name}</span>
                      <span className="text-sm text-subtle">{relTime(response.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm">
                      “{response.choice ?? response.message}” <span className="text-muted-foreground">on {row.service.name.toLowerCase()}</span>
                    </p>
                  </div>
                </Link>
              ))}
              {d.requests.map(({ request, estate, contact }) => (
                <Link key={request.id} href="/requests" className="mb-2 flex items-start gap-3.5 rounded-xl border border-dashed border-border bg-card p-3.5 transition hover:border-primary/40">
                  <Avatar name={contact?.name ?? "Owner"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-base font-semibold">{contact?.name ?? "Homeowner"} asked</p>
                      <span className="text-sm text-muted-foreground">{estate.name}</span>
                      <span className="text-sm text-subtle">
                        by {request.channel} · {relTime(request.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">“{request.message}”</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className=" hidden lg:block">
            <CardHeader
              title="Recent activity"
              description="Everything that happened across the houses."
              action={
                <Link href="/visits" className="text-sm font-medium text-primary hover:underline">
                  All visits
                </Link>
              }
            />
            <div className="px-5 pb-4">
              <Timeline items={d.activity.slice(0, 6).map((a) => a.activity)} estates={estateMap} relative />
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card className="">
            <CardHeader
              title="On site and today"
              description={d.onSite.length ? `${d.onSite.map((r) => r.vendor.name).join(", ")} checked in.` : "Vendors check in from the link on their phone."}
              action={
                <Link href="/schedule" className="text-sm font-medium text-primary hover:underline">
                  Week
                </Link>
              }
            />
            <div className="px-2 pb-2">
              <VisitList rows={[...d.onSite, ...d.today]} emptyText="Nothing else scheduled today." />
            </div>
          </Card>

          <Card className="">
            <CardHeader title="Tomorrow" description={d.tomorrow.length ? `${pluralize(d.tomorrow.length, "visit")}. Vendors get their link tonight.` : "Nothing scheduled yet."} />
            <div className="px-2 pb-2">
              <VisitList rows={d.tomorrow} emptyText="Open day." />
            </div>
          </Card>

          <Card className="">
            <CardHeader title="Open tasks" description="Created from owner replies, automations, or the office." />
            <ul className="divide-y divide-border/70 px-5 pb-3">
              {d.tasks.length === 0 ? <li className="py-8 text-center text-sm text-subtle">No open tasks.</li> : null}
              {d.tasks.map(({ task, estate }) => (
                <li key={task.id} className="flex items-start gap-3 py-3">
                  <form action={completeTask}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="back" value="/today" />
                    <button type="submit" title="Mark done" className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border text-transparent transition hover:border-success hover:text-success">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p className="text-base leading-snug">{task.title}</p>
                    <p className="mt-0.5 text-sm text-subtle">
                      {estate ? `${estate.name} · ` : ""}
                      {task.dueAt ? `due ${relTime(task.dueAt)}` : ""}
                      {task.source === "owner_reply" ? " · from an owner reply" : task.source === "automation" ? " · automation" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
