import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactByToken, getOrg } from "@/lib/queries";
import { ownerRequest } from "@/lib/actions/visits";
import { fmtDate, fmtLongDate, fmtTime, isToday, isTomorrow, WINDOW_RANGE, thumb } from "@/lib/format";
import { CheckCircle2, ChevronRight, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerHomePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string>> }) {
  const { token } = await params;
  const sp = await searchParams;
  const p = await getContactByToken(token);
  if (!p) notFound();
  const org = await getOrg();
  const now = Date.now();
  const sent = p.visits.filter((r) => r.visit.status === "sent").sort((a, b) => (b.visit.sentAt?.getTime() ?? 0) - (a.visit.sentAt?.getTime() ?? 0));
  const upcoming = p.visits.filter((r) => ["scheduled", "in_progress"].includes(r.visit.status) && r.visit.scheduledFor.getTime() > now - 6 * 3600000).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
  const thirtyDays = sent.filter((r) => r.visit.sentAt && now - r.visit.sentAt.getTime() < 30 * 86400000);
  const openRequests = p.requests.filter((q) => q.status === "new");
  const onSite = upcoming.find((r) => r.visit.status === "in_progress");
  const next = upcoming.find((r) => r.visit.status !== "in_progress");

  const facts = [
    { k: "Last 30 days", v: `${thirtyDays.length} ${thirtyDays.length === 1 ? "visit" : "visits"}` },
    { k: "Right now", v: onSite ? `${onSite.vendor.name} on site` : "No one on site" },
    { k: "Next", v: next ? `${isToday(next.visit.scheduledFor) ? "Today" : isTomorrow(next.visit.scheduledFor) ? "Tomorrow" : fmtDate(next.visit.scheduledFor)} · ${next.service.name}` : "Nothing scheduled" },
    { k: "Open requests", v: String(openRequests.length) },
  ];

  return (
    <div className="min-h-dvh bg-chalk">
      <div className="relative h-64 sm:h-80">
        <Image src={p.estate.coverImage ?? "/estates/estate-colonial.jpg"} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/20 to-abyss/20" />
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-5xl items-center gap-2.5 px-5 pt-5 text-porcelain">
          <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full ring-2 ring-white/20" />
          <span className="font-display text-sm tracking-[0.14em]">BLUEDOOR</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-5 pb-6 text-porcelain">
          <p className="eyebrow text-porcelain/70">{[p.estate.address1, p.estate.city].filter(Boolean).join(", ")}</p>
          <h1 className="display mt-1 text-3xl sm:text-4xl">{p.estate.name}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-6">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.k} className="rounded-2xl bg-card px-4 py-3 shadow-xs">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">{f.k}</dt>
              <dd className="mt-1 text-base font-medium leading-snug text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>

        {sp.requested ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-card p-4 shadow-xs">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <p className="text-sm text-ink">Received. The office will schedule it and confirm with you.</p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {upcoming.length ? (
              <>
                <p className="eyebrow text-stone">Coming up</p>
                <ul className="mt-3 space-y-2">
                  {upcoming.slice(0, 5).map((r) => (
                    <li key={r.visit.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xs">
                      <div className="w-24 shrink-0">
                        <p className="text-base font-semibold text-ink">{isToday(r.visit.scheduledFor) ? "Today" : isTomorrow(r.visit.scheduledFor) ? "Tomorrow" : fmtDate(r.visit.scheduledFor)}</p>
                        <p className="text-xs text-stone">{WINDOW_RANGE[r.visit.window]}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base text-ink">{r.service.name}</p>
                        <p className="truncate text-sm text-stone">{r.vendor.name}</p>
                      </div>
                      {r.visit.status === "in_progress" ? <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-white">On site</span> : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className={upcoming.length ? "mt-8 eyebrow text-stone" : "eyebrow text-stone"}>Visits</p>
            <ul className="mt-3 space-y-2">
              {sent.length === 0 ? <li className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-stone shadow-xs">No reports yet.</li> : null}
              {sent.slice(0, 12).map((r) => (
                <li key={r.visit.id}>
                  <Link href={`/r/${r.visit.ownerToken}`} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xs transition hover:shadow-md">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted bg-cover bg-center" style={r.photos[0] ? { backgroundImage: `url(${thumb(r.photos[0].url)})` } : undefined} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base text-ink">{r.service.name}</p>
                      <p className="truncate text-sm text-stone">
                        {fmtLongDate(r.visit.completedAt ?? r.visit.scheduledFor)}
                        {r.visit.completedAt ? ` · ${fmtTime(r.visit.completedAt)}` : ""} · {r.vendor.name}
                        {r.report?.attention && r.report.attention !== "none" ? " · note" : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-stone" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-card p-5 shadow-xs lg:sticky lg:top-6">
              <p className="display text-xl text-ink">Request a visit</p>
              <form action={ownerRequest} className="mt-3">
                <input type="hidden" name="token" value={token} />
                <textarea name="message" required rows={3} placeholder="The ocean side gate is sticking. Can someone look at it this week?" className="w-full rounded-2xl border border-border bg-chalk px-3.5 py-3 text-base outline-none focus:border-primary" />
                <button type="submit" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground">
                  <Send className="h-4 w-4" /> Send to the office
                </button>
              </form>
              {openRequests.length ? (
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
                  {openRequests.map((q) => (
                    <li key={q.id} className="text-sm text-stone">
                      Waiting: “{q.message}”
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-5 border-t border-border pt-4 text-sm text-stone">
                <p className="font-medium text-ink">{org.name}</p>
                {org.phone ? <p>{org.phone}</p> : null}
                {org.email ? <p>{org.email}</p> : null}
                <p className="mt-2 text-xs">
                  Reports reach you by {p.contact.smsOptIn && p.contact.phone ? "text" : ""}
                  {p.contact.smsOptIn && p.contact.phone && p.contact.emailOptIn && p.contact.email ? " and " : ""}
                  {p.contact.emailOptIn && p.contact.email ? "email" : ""}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
