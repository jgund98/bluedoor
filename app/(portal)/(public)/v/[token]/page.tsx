import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/lib/db";
import { getVisitByVendorToken, getOrg } from "@/lib/queries";
import { vendorCheckIn } from "@/lib/actions/visits";
import { VendorReport } from "@/components/vendor/vendor-report";
import { fmtLongDate, fmtTime, WINDOW_RANGE, isToday } from "@/lib/format";
import { MapPin, KeyRound, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorVisitPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string>> }) {
  const { token } = await params;
  const sp = await searchParams;
  const v = await getVisitByVendorToken(token);
  if (!v) notFound();
  const org = await getOrg();

  // Opening the link is the first signal the office gets.
  if (!v.visit.vendorOpenedAt) {
    const db = await getDb();
    await db.update(s.visits).set({ vendorOpenedAt: new Date() }).where(eq(s.visits.id, v.visit.id));
  }

  const address = [v.estate.address1, v.estate.city, v.estate.state].filter(Boolean).join(", ");
  const maps = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  const showGate = isToday(v.visit.scheduledFor) || v.visit.status === "in_progress";
  const status = v.visit.status;

  return (
    <div className="min-h-dvh bg-chalk">
      <header className="flex items-center gap-2.5 px-5 pt-5">
        <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
        <span className="font-display text-sm tracking-[0.14em]">BLUEDOOR</span>
      </header>
      <main className="mx-auto max-w-lg px-5 pb-32 pt-6">
        <p className="eyebrow text-stone">{v.service.name}</p>
        <h1 className="display mt-1 text-3xl text-ink">{v.estate.name}</h1>
        <p className="mt-2 text-sm text-stone">
          {fmtLongDate(v.visit.scheduledFor)} · {WINDOW_RANGE[v.visit.window] ?? ""}
        </p>

        <div className="mt-5 grid gap-2">
          <a href={maps} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xs">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="flex-1 text-sm">{address}</span>
            <span className="text-xs font-medium text-primary">Map</span>
          </a>
          {v.estate.gateCode ? (
            <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xs">
              <KeyRound className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm">Gate code</span>
              <span className="text-lg font-semibold tabular text-ink">{showGate ? v.estate.gateCode : "Shown on the day"}</span>
            </div>
          ) : null}
          {v.estate.accessNotes ? <p className="px-1 text-sm text-stone">{v.estate.accessNotes}</p> : null}
        </div>

        {v.visit.requestNote ? (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">From the office</p>
            <p className="mt-1 text-sm text-ink">{v.visit.requestNote}</p>
          </div>
        ) : null}
        {v.visit.officeNote ? (
          <div className="mt-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-warning">The office needs one more thing</p>
            <p className="mt-1 text-sm text-ink">{v.visit.officeNote}</p>
          </div>
        ) : null}
        {v.service.instructions ? <p className="mt-4 px-1 text-sm leading-relaxed text-ink/80">{v.service.instructions}</p> : null}

        {status === "scheduled" || status === "requested" ? (
          <>
            <div className="mt-6 rounded-2xl bg-card p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">You will be asked to</p>
              <ol className="mt-2 space-y-1.5">
                {v.service.checklist.map((c, n) => (
                  <li key={c.key} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-right text-xs tabular text-stone">{n + 1}.</span> {c.label}
                  </li>
                ))}
              </ol>
            </div>
            <form action={vendorCheckIn} className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="mx-auto flex h-14 w-full max-w-lg items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg active:scale-[0.99]">
                <CheckCircle2 className="h-5 w-5" /> I’m here, start the visit
              </button>
              <p className="mt-2 text-center text-xs text-stone">The office sees your check-in time.</p>
            </form>
          </>
        ) : null}

        {status === "in_progress" ? (
          <VendorReport
            token={token}
            orgName={org.name}
            checklist={v.service.checklist}
            minPhotos={v.service.minPhotos}
            arrivedAt={v.visit.arrivedAt ? fmtTime(v.visit.arrivedAt) : null}
            existing={v.report ? { items: v.report.items, note: v.report.vendorNote ?? "", attention: v.report.attention, attentionNote: v.report.attentionNote ?? "", photos: v.photos.map((p) => ({ url: p.url, caption: p.caption ?? "" })) } : null}
          />
        ) : null}

        {status === "submitted" || status === "approved" || status === "sent" || status === "closed" ? (
          <div className="mt-6 rounded-3xl bg-card p-6 text-center shadow-xs">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="display mt-4 text-2xl text-ink">{sp.filed ? "Filed. Thank you." : "Report filed"}</p>
            <p className="mt-2 text-sm text-stone">
              {v.visit.arrivedAt && v.visit.completedAt ? `On site ${fmtTime(v.visit.arrivedAt)} to ${fmtTime(v.visit.completedAt)}. ` : ""}
              {status === "submitted" ? "The office is reviewing it now. You will be texted if they need anything else." : "The office approved it and the owner has been updated."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-stone">
              <Clock className="h-3 w-3" /> {v.photos.length} photos · {v.report?.items.length ?? 0} of {v.service.checklist.length} steps
            </div>
          </div>
        ) : null}

        {status === "cancelled" ? (
          <div className="mt-6 rounded-3xl bg-card p-6 text-center shadow-xs">
            <p className="display text-2xl text-ink">This visit was cancelled</p>
            <p className="mt-2 text-sm text-stone">The office will text you if it is rescheduled.</p>
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-stone">
          {org.name}
          {org.phone ? ` · ${org.phone}` : ""}
        </p>
      </main>
    </div>
  );
}
