import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRequests } from "@/lib/queries";
import { PageHeader, Card, Pill, Button, Avatar, EmptyState } from "@/components/ui/primitives";
import { relTime, ROLE_LABEL, pluralize } from "@/lib/format";
import { dismissRequest } from "@/lib/actions/visits";
import { CalendarPlus } from "lucide-react";

export const metadata = { title: "Requests" };

export default async function RequestsPage() {
  const user = await requireUser();
  const all = await listRequests(user.orgId);
  const open = all.filter((r) => r.request.status === "new");
  const done = all.filter((r) => r.request.status !== "new").slice(0, 10);

  return (
    <div>
      <PageHeader
        eyebrow="Requests"
        title={open.length ? `${pluralize(open.length, "request")} from homeowners` : "No open requests"}
        description="Messages from homeowners. Schedule a visit or dismiss."
      />
      {open.length === 0 ? (
        <EmptyState title="Inbox is clear" description="New requests from homeowners appear here with the house and the person attached." />
      ) : (
        <div className="space-y-3">
          {open.map(({ request, estate, contact }) => (
            <Card key={request.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar name={contact?.name ?? "Owner"} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold">{contact?.name ?? "Homeowner"}</p>
                    <span className="text-xs text-muted-foreground">{contact ? ROLE_LABEL[contact.role] : ""}</span>
                    <Link href={`/estates/${estate.id}`}>
                      <Pill tone="blue">{estate.name}</Pill>
                    </Link>
                    <span className="text-xs text-subtle">· by {request.channel} · {relTime(request.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed">“{request.message}”</p>
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button href={`/schedule/new?estate=${estate.id}&request=${request.id}&note=${encodeURIComponent(request.message)}`}>
                    <CalendarPlus className="h-4 w-4" /> Schedule
                  </Button>
                  <form action={dismissRequest}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <Button type="submit" variant="ghost" className="w-full">
                      Dismiss
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {done.length ? (
        <Card className="mt-8">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold">Handled</h2>
          </div>
          <ul className="divide-y divide-border/70 px-5 pb-3">
            {done.map(({ request, estate, contact }) => (
              <li key={request.id} className="flex items-center justify-between gap-3 py-2.5">
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium">{contact?.name ?? "Homeowner"}</span> <span className="text-muted-foreground">· {estate.name} · “{request.message}”</span>
                </p>
                {request.visitId ? (
                  <Link href={`/visits/${request.visitId}`}>
                    <Pill tone="green">Scheduled</Pill>
                  </Link>
                ) : (
                  <Pill tone="slate">Dismissed</Pill>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
