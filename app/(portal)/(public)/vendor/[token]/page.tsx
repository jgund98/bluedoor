import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendorByToken, getOrg } from "@/lib/queries";
import { fmtDate, fmtTime, WINDOW_RANGE, isToday, isTomorrow } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorSchedulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const v = await getVendorByToken(token);
  if (!v) notFound();
  const org = await getOrg();
  const now = Date.now();
  const upcoming = v.visits.filter((r) => ["scheduled", "in_progress", "requested"].includes(r.visit.status) && r.visit.scheduledFor.getTime() > now - 12 * 3600000).sort((a, b) => a.visit.scheduledFor.getTime() - b.visit.scheduledFor.getTime());
  const recent = v.visits.filter((r) => ["submitted", "sent", "approved", "closed"].includes(r.visit.status)).slice(0, 8);

  return (
    <div className="min-h-dvh bg-chalk">
      <header className="flex items-center gap-2.5 px-5 pt-5">
        <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
        <span className="font-display text-sm tracking-[0.14em]">BLUEDOOR</span>
      </header>
      <main className="mx-auto max-w-lg px-5 pb-16 pt-6">
        <p className="eyebrow text-stone">{v.vendor.trade}</p>
        <h1 className="display mt-1 text-3xl text-ink">{v.vendor.contactName ? `Hi ${v.vendor.contactName.split(" ")[0]}` : v.vendor.name}</h1>
        <p className="mt-2 text-sm text-stone">Your visits for {org.name}. Tap one to check in and file the report.</p>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-stone">Coming up</p>
        <ul className="mt-2 space-y-2">
          {upcoming.length === 0 ? <li className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-stone shadow-xs">Nothing scheduled right now.</li> : null}
          {upcoming.map((r) => {
            const today = isToday(r.visit.scheduledFor);
            return (
              <li key={r.visit.id}>
                <Link href={`/v/${r.visit.vendorToken}`} className={cn("flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xs", today && "ring-2 ring-primary/40")}>
                  <div className="w-16 shrink-0">
                    <p className={cn("text-sm font-semibold", today && "text-primary")}>{today ? "Today" : isTomorrow(r.visit.scheduledFor) ? "Tomorrow" : fmtDate(r.visit.scheduledFor)}</p>
                    <p className="text-xs text-stone">{fmtTime(r.visit.scheduledFor)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-ink">{r.estate.name}</p>
                    <p className="truncate text-xs text-stone">
                      {r.service.name} · {WINDOW_RANGE[r.visit.window]}
                    </p>
                  </div>
                  {r.visit.status === "in_progress" ? <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">On site</span> : null}
                  <ChevronRight className="h-4 w-4 text-stone" />
                </Link>
              </li>
            );
          })}
        </ul>

        {recent.length ? (
          <>
            <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-stone">Filed</p>
            <ul className="mt-2 space-y-2">
              {recent.map((r) => (
                <li key={r.visit.id} className="flex items-center gap-3 rounded-2xl bg-card/70 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      {r.estate.name} <span className="text-stone">· {r.service.name}</span>
                    </p>
                  </div>
                  <span className="text-xs text-stone">{fmtDate(r.visit.scheduledFor)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-10 text-center text-xs text-stone">
          {org.name}
          {org.phone ? ` · ${org.phone}` : ""}
        </p>
      </main>
    </div>
  );
}
