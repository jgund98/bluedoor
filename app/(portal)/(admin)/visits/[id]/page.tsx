import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getVisit, getOrg } from "@/lib/queries";
import { PageHeader, Card, CardHeader, Pill, Button, KV, Notice } from "@/components/ui/primitives";
import { ApprovalForm } from "@/components/visits/approval-form";
import { Timeline } from "@/components/visits/timeline";
import { PhotoGrid } from "@/components/photos";
import { ATTENTION, STATUS, fmtLongDate, fmtTime, fmtDateTime, fmtPhone, WINDOW_LABEL, ROLE_LABEL, relTime, type VisitStatus } from "@/lib/format";
import { cancelVisit } from "@/lib/actions/visits";
import { cn } from "@/lib/utils";
import { ExternalLink, Phone, MessageSquare, Mail, Clock } from "lucide-react";
import { CopyLink } from "@/components/copy-link";

export default async function VisitPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const [v, org] = await Promise.all([getVisit(id), getOrg()]);
  if (!v) notFound();
  const st = STATUS[v.visit.status as VisitStatus] ?? STATUS.scheduled;
  const att = v.report ? ATTENTION[v.report.attention] : null;
  const primary = v.contacts.find((c) => c.isPrimary) ?? v.contacts[0];
  const reviewing = v.visit.status === "submitted" && v.report;
  const sent = ["sent", "approved", "closed"].includes(v.visit.status) && v.report;
  const waiting = ["scheduled", "requested", "in_progress"].includes(v.visit.status);

  return (
    <div>
      <PageHeader
        back={{ href: reviewing ? "/approvals" : "/visits", label: reviewing ? "Approvals" : "Visits" }}
        eyebrow={`${fmtLongDate(v.visit.scheduledFor)} · ${WINDOW_LABEL[v.visit.window]}`}
        title={
          <span className="flex flex-wrap items-center gap-2">
            <Link href={`/estates/${v.estate.id}`} className="hover:underline">
              {v.estate.name}
            </Link>
            <span className="block w-full font-normal text-muted-foreground sm:inline sm:w-auto"><span className="hidden sm:inline">· </span>{v.service.name}</span>
            <Pill tone={st.tone} className="translate-y-0.5">
              {st.label}
            </Pill>
            {att && att.label !== "Routine" ? (
              <Pill tone={att.tone} className="translate-y-0.5">
                {att.label}
              </Pill>
            ) : null}
          </span>
        }
        description={`${v.vendor.name}${v.vendor.contactName ? ` · ${v.vendor.contactName}` : ""}${v.visit.requestedBy === "owner" ? " · requested by the homeowner" : v.visit.requestedBy === "recurring" ? " · recurring" : ""}`}
        actions={
          <>
            <CopyLink path={`/v/${v.visit.vendorToken}`} label="Vendor link" />
            {sent ? (
              <Button href={`/r/${v.visit.ownerToken}`} variant="outline">
                <ExternalLink className="h-4 w-4" /> Owner page
              </Button>
            ) : null}
            {["scheduled", "requested"].includes(v.visit.status) ? (
              <form action={cancelVisit}>
                <input type="hidden" name="visitId" value={v.visit.id} />
                <Button type="submit" variant="ghost">
                  Cancel visit
                </Button>
              </form>
            ) : null}
          </>
        }
      />

      {sp.created ? (
        <div className="mb-5">
          <Notice tone="green" title="Scheduled">
            {v.vendor.contactName ?? v.vendor.name} was texted the visit link. They will get a reminder one hour before the window.
          </Notice>
        </div>
      ) : null}
      {sp.sent ? (
        <div className="mb-5">
          <Notice tone={sp.held ? "amber" : "green"} title={sp.held ? "Approved and held for the morning" : "Sent to the homeowner"}>
            {sp.held
              ? "It is quiet hours. The text and email are in the outbox and go out at 7 am."
              : `${primary?.name ?? "The homeowner"} received the text and the email with photos. Replies land back here.`}
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {reviewing ? (
            <ApprovalForm
              visitId={v.visit.id}
              estateName={v.estate.name}
              serviceName={v.service.name}
              vendorName={v.vendor.name}
              orgName={org.name}
              recapDraft={v.report!.recapDraft ?? ""}
              vendorNote={v.report!.vendorNote}
              attention={v.report!.attention}
              attentionNote={v.report!.attentionNote}
              ownerAction={v.report!.ownerAction as "fyi" | "decision" | "call"}
              decisionPrompt={v.report!.decisionPrompt}
              decisionOptions={v.report!.decisionOptions}
              checklist={v.service.checklist}
              items={v.report!.items}
              photos={v.photos.map((p) => ({ url: p.url, caption: p.caption }))}
              contacts={v.contacts.map((c) => ({ id: c.id, name: c.name, role: c.role, phone: c.phone, email: c.email, smsOptIn: c.smsOptIn, emailOptIn: c.emailOptIn, isPrimary: c.isPrimary }))}
            />
          ) : null}

          {sent ? (
            <Card>
              <CardHeader title="What the homeowner received" description={`Approved by ${v.report!.approvedBy ?? "the office"} · ${fmtDateTime(v.visit.approvedAt)}`} />
              <div className="px-5 pb-5">
                <p className="text-base leading-relaxed">{v.report!.recapFinal ?? v.report!.recapDraft}</p>
                {v.report!.ownerAction === "decision" ? (
                  <div className="mt-4 rounded-xl bg-mist px-4 py-3">
                    <p className="text-sm font-medium">{v.report!.decisionPrompt}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {v.report!.decisionOptions.map((o, n) => (
                        <span key={o} className={cn("rounded-full px-3 py-1 text-xs font-medium", n === 0 ? "bg-primary text-primary-foreground" : "border border-primary text-primary")}>
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {v.responses.length ? (
                  <div className="mt-4 space-y-2">
                    {v.responses.map((r) => (
                      <div key={r.id} className="rounded-xl border border-success/30 bg-success-soft px-4 py-3">
                        <p className="text-sm font-medium text-success">
                          {v.contacts.find((c) => c.id === r.contactId)?.name ?? "Homeowner"} replied: {r.choice ?? r.message}
                        </p>
                        {r.message && r.choice ? <p className="mt-0.5 text-sm text-success/90">“{r.message}”</p> : null}
                        <p className="mt-0.5 text-xs text-success/70">
                          by {r.channel} · {relTime(r.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : v.report!.ownerAction === "decision" ? (
                  <p className="mt-3 text-xs text-subtle">No reply yet. A gentle follow-up goes out after 3 days.</p>
                ) : null}
              </div>
            </Card>
          ) : null}

          {waiting ? (
            <Card>
              <CardHeader
                title={v.visit.status === "in_progress" ? `${v.vendor.name} is on site` : "Waiting on the vendor"}
                description={
                  v.visit.status === "in_progress"
                    ? `Checked in at ${fmtTime(v.visit.arrivedAt)}. The report arrives here the moment they submit.`
                    : v.visit.vendorOpenedAt
                      ? `${v.vendor.contactName ?? v.vendor.name} opened the link ${relTime(v.visit.vendorOpenedAt)}.`
                      : "The link was texted. We will know the moment it is opened."
                }
              />
              <div className="px-5 pb-5">
                {v.visit.officeNote ? (
                  <Notice tone="amber" title="Sent back to the vendor">
                    {v.visit.officeNote}
                  </Notice>
                ) : null}
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-subtle">What they will be asked to do</p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {v.service.checklist.map((c) => (
                    <li key={c.key} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      {c.label}
                      {c.photo ? <span className="text-xs text-subtle">photo</span> : null}
                    </li>
                  ))}
                </ul>
                {v.service.instructions ? <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm">{v.service.instructions}</p> : null}
                {v.visit.requestNote ? <p className="mt-3 text-sm text-muted-foreground">Note for this visit: {v.visit.requestNote}</p> : null}
              </div>
            </Card>
          ) : null}

          {v.photos.length ? (
            <Card>
              <CardHeader title={`Photos (${v.photos.length})`} description="Taken on site from the vendor’s phone." />
              <div className="px-5 pb-5">
                <PhotoGrid photos={v.photos} />
              </div>
            </Card>
          ) : null}

          {v.report && !reviewing ? (
            <Card>
              <CardHeader title="Vendor’s checklist" description={`On site ${fmtTime(v.visit.arrivedAt)} to ${fmtTime(v.visit.completedAt)}`} />
              <div className="px-5 pb-5">
                <ul className="grid gap-1 sm:grid-cols-2">
                  {v.service.checklist.map((c) => {
                    const done = v.report!.items.includes(c.key);
                    return (
                      <li key={c.key} className={cn("flex items-center gap-2 text-sm", done ? "" : "text-subtle line-through")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", done ? "bg-success" : "bg-border")} />
                        {c.label}
                      </li>
                    );
                  })}
                </ul>
                {v.report.vendorNote ? <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm italic">“{v.report.vendorNote}”</p> : null}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader title="Details" />
            <div className="divide-y divide-border/70 px-5 pb-3">
              <KV k="When" v={`${fmtLongDate(v.visit.scheduledFor)}, ${fmtTime(v.visit.scheduledFor)}`} />
              <KV k="Window" v={WINDOW_LABEL[v.visit.window]} />
              <KV
                k="Vendor"
                v={
                  <Link href={`/vendors/${v.vendor.id}`} className="hover:underline">
                    {v.vendor.name}
                  </Link>
                }
              />
              {v.vendor.phone ? (
                <KV
                  k="Vendor phone"
                  v={
                    <a href={`tel:${v.vendor.phone}`} className="inline-flex items-center gap-1 hover:underline">
                      <Phone className="h-3 w-3" /> {fmtPhone(v.vendor.phone)}
                    </a>
                  }
                />
              ) : null}
              <KV k="Address" v={[v.estate.address1, v.estate.city].filter(Boolean).join(", ")} />
              {v.estate.gateCode ? <KV k="Gate code" v={<span className="tabular">{v.estate.gateCode}</span>} /> : null}
              {v.estate.accessNotes ? <KV k="Access" v={<span className="text-xs">{v.estate.accessNotes}</span>} /> : null}
              {v.visit.arrivedAt ? <KV k="Checked in" v={fmtTime(v.visit.arrivedAt)} /> : null}
              {v.visit.completedAt ? <KV k="Finished" v={fmtTime(v.visit.completedAt)} /> : null}
              {v.visit.submittedAt ? <KV k="Report filed" v={fmtDateTime(v.visit.submittedAt)} /> : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Homeowner contacts" description="Who receives reports for this house." />
            <ul className="divide-y divide-border/70 px-5 pb-3">
              {v.contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {c.name} {c.isPrimary ? <span className="text-xs font-normal text-subtle">primary</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABEL[c.role] ?? c.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-subtle">
                    {c.phone && c.smsOptIn ? <MessageSquare className="h-3.5 w-3.5" /> : null}
                    {c.email && c.emailOptIn ? <Mail className="h-3.5 w-3.5" /> : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <div className="px-5 pb-3">
              <Timeline items={v.activity} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Messages" description="Every text and email tied to this visit." />
            <ul className="divide-y divide-border/70 px-5 pb-3">
              {v.notifications.length === 0 ? <li className="py-6 text-center text-xs text-subtle">None yet.</li> : null}
              {v.notifications.map((n) => (
                <li key={n.id} className="py-2.5">
                  <Link href={`/outbox/${n.id}`} className="group block">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-medium">
                        {n.channel === "sms" ? <MessageSquare className="h-3.5 w-3.5 text-primary" /> : <Mail className="h-3.5 w-3.5 text-primary" />}
                        {n.channel === "sms" ? "Text" : "Email"} to {n.toName ?? n.to}
                        <span className="font-normal text-subtle">· {n.audience}</span>
                      </p>
                      <Pill tone={n.status === "sent" ? "green" : n.status === "queued" ? "amber" : n.status === "failed" ? "red" : "slate"}>{n.status === "queued" ? "held" : n.status}</Pill>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground">{n.subject ?? n.body}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-subtle">
                      <Clock className="h-3 w-3" /> {fmtDateTime(n.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
