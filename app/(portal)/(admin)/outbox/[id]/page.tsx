import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getNotification } from "@/lib/queries";
import { PageHeader, Card, CardHeader, Pill, KV } from "@/components/ui/primitives";
import { fmtDateTime } from "@/lib/format";

export default async function OutboxItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const n = await getNotification(id);
  if (!n) notFound();
  const link = /https?:\/\/\S+/.exec(n.body)?.[0];
  const path = link ? link.replace(/^https?:\/\/[^/]+/, "") : null;
  return (
    <div>
      <PageHeader back={{ href: "/outbox", label: "Outbox" }} eyebrow={n.channel === "sms" ? "Text message" : "Email"} title={n.subject ?? `To ${n.toName ?? n.to}`} description={`${n.audience} · ${fmtDateTime(n.createdAt)}`} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {n.channel === "sms" ? (
            <Card className="p-6">
              <div className="mx-auto max-w-xs">
                <p className="mb-2 text-center text-xs text-subtle">to {n.to}</p>
                <div className="rounded-3xl rounded-tl-md bg-primary px-4 py-3 text-base leading-snug text-primary-foreground">{n.body}</div>
                {path ? (
                  <Link href={path} className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
                    Open the link they received
                  </Link>
                ) : null}
              </div>
            </Card>
          ) : n.html ? (
            <Card className="overflow-hidden">
              <CardHeader title={n.subject ?? ""} description={`to ${n.toName ?? n.to}`} />
              <iframe srcDoc={n.html} title="Email preview" className="h-[720px] w-full border-t border-border bg-chalk" sandbox="" />
            </Card>
          ) : (
            <Card className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{n.body}</p>
            </Card>
          )}
        </div>
        <div className="lg:col-span-4">
          <Card>
            <CardHeader title="Delivery" />
            <div className="divide-y divide-border/70 px-5 pb-3">
              <KV k="Status" v={<Pill tone={n.status === "sent" ? "green" : n.status === "queued" ? "amber" : n.status === "failed" ? "red" : "slate"}>{n.status === "queued" ? "held for quiet hours" : n.status}</Pill>} />
              <KV k="Channel" v={n.channel === "sms" ? "Text" : "Email"} />
              <KV k="Recipient" v={n.to} />
              <KV k="Audience" v={n.audience} />
              {n.ruleKey ? <KV k="Caused by" v={<span className="text-xs">{n.ruleKey.replace(/_/g, " ")}</span>} /> : null}
              {n.error ? <KV k="Note" v={<span className="text-xs">{n.error}</span>} /> : null}
              {n.visitId ? (
                <KV
                  k="Visit"
                  v={
                    <Link href={`/visits/${n.visitId}`} className="text-primary hover:underline">
                      Open
                    </Link>
                  }
                />
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
