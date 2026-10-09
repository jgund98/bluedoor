import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/queries";
import { deliveryEnabled } from "@/lib/notify";
import { PageHeader, Card, Pill, Notice } from "@/components/ui/primitives";
import { fmtDateTime, relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MessageSquare, Mail } from "lucide-react";

export const metadata = { title: "Outbox" };

const AUD: Record<string, "blue" | "amber" | "green"> = { vendor: "blue", office: "amber", owner: "green" };

export default async function OutboxPage({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const all = await listNotifications(user.orgId);
  const rows = sp.a && sp.a !== "all" ? all.filter((r) => r.n.audience === sp.a) : all;
  const held = all.filter((r) => r.n.status === "queued").length;

  return (
    <div>
      <PageHeader eyebrow="Outbox" title="Every text and email" description="Every text and email, with delivery status." />
      {!deliveryEnabled() ? (
        <div className="mb-5">
          <Notice tone="blue" title="Demo mode: messages are logged, not delivered">
            Add the delivery key and every message here goes out for real by text and email. Everything else works the same.
          </Notice>
        </div>
      ) : null}
      {held ? (
        <div className="mb-5">
          <Notice tone="amber" title={`${held} held for quiet hours`}>
            Routine homeowner messages wait until the morning. Urgent messages never wait.
          </Notice>
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-muted p-1 sm:inline-flex">
        {[
          ["all", "All"],
          ["owner", "To homeowners"],
          ["vendor", "To vendors"],
          ["office", "To the office"],
        ].map(([k, label]) => (
          <Link key={k} href={`/outbox?a=${k}`} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition", (sp.a ?? "all") === k ? "bg-card shadow-xs" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </Link>
        ))}
      </div>
      <Card>
        <ul className="divide-y divide-border/70">
          {rows.length === 0 ? <li className="py-10 text-center text-xs text-subtle">Nothing here yet.</li> : null}
          {rows.map(({ n, estate }) => (
            <li key={n.id}>
              <Link href={`/outbox/${n.id}`} className="flex items-start gap-3 px-4 py-3 transition hover:bg-muted/50 sm:px-5">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", n.channel === "sms" ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground")}>
                  {n.channel === "sms" ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium">{n.toName ?? n.to}</p>
                    <Pill tone={AUD[n.audience] ?? "slate"}>{n.audience}</Pill>
                    {estate ? <span className="text-xs text-muted-foreground">· {estate.name}</span> : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{n.subject ?? n.body}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Pill tone={n.status === "sent" ? "green" : n.status === "queued" ? "amber" : n.status === "failed" ? "red" : "slate"}>{n.status === "queued" ? "held" : n.status}</Pill>
                  <p className="mt-1 text-xs text-subtle" title={fmtDateTime(n.createdAt)}>
                    {relTime(n.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
