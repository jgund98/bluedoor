import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisitByOwnerToken, getOrg } from "@/lib/queries";
import { ownerRespond } from "@/lib/actions/visits";
import { PhotoGrid } from "@/components/photos";
import { fmtLongDate, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerReportPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string>> }) {
  const { token } = await params;
  const sp = await searchParams;
  const v = await getVisitByOwnerToken(token);
  if (!v || !v.report) notFound();
  const org = await getOrg();
  const primary = v.contacts.find((c) => c.isPrimary) ?? v.contacts[0];
  const released = ["sent", "approved", "closed"].includes(v.visit.status);
  const recap = v.report.recapFinal ?? v.report.recapDraft ?? "";
  const paragraphs = recap.split(/(?<=\.)\s(?=[A-Z])/).reduce<string[]>((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && last.length < 150) acc[acc.length - 1] = `${last} ${s}`;
    else acc.push(s);
    return acc;
  }, []);
  const answered = v.responses[0] ?? null;
  const preselect = sp.choice ? v.report.decisionOptions[Number(sp.choice) - 1] : undefined;

  return (
    <div className="min-h-dvh bg-chalk">
      <div className="bg-primary px-5 py-6 text-porcelain">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <Image src="/brand/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full ring-2 ring-white/20" />
          <div className="leading-tight">
            <p className="font-display text-base tracking-[0.14em]">BLUEDOOR</p>
            <p className="text-xs text-porcelain/70">Estate management</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-xl px-5 pb-20 pt-8">
        {!released ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-xs">
            <p className="display text-2xl text-ink">This report is being prepared</p>
            <p className="mt-2 text-sm text-stone">The office is reviewing it. You will receive it shortly.</p>
          </div>
        ) : (
          <>
            <p className="eyebrow text-stone">{v.estate.name}</p>
            <h1 className="display mt-1 text-3xl text-ink sm:text-4xl">{v.service.name}</h1>
            <p className="mt-2 text-sm text-stone">
              {fmtLongDate(v.visit.completedAt ?? v.visit.scheduledFor)}
              {v.visit.completedAt ? ` at ${fmtTime(v.visit.completedAt)}` : ""} · {v.vendor.name}
            </p>

            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink">
              {primary ? <p>{primary.name.split(" ")[0]},</p> : null}
              {paragraphs.map((p, n) => (
                <p key={n}>{p}</p>
              ))}
            </div>

            {v.report.ownerAction === "decision" ? (
              <div className="mt-8 rounded-3xl bg-card p-5 shadow-xs">
                {answered || sp.thanks ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    <div>
                      <p className="text-base font-medium text-ink">Thank you. {answered ? `You chose “${answered.choice ?? answered.message}”.` : "We received your reply."}</p>
                      <p className="mt-1 text-sm text-stone">The office has it and will take care of the rest.</p>
                    </div>
                  </div>
                ) : (
                  <form action={ownerRespond}>
                    <input type="hidden" name="token" value={token} />
                    <p className="text-base font-medium text-ink">{v.report.decisionPrompt}</p>
                    <div className="mt-4 grid gap-2">
                      {v.report.decisionOptions.map((o, n) => (
                        <button key={o} type="submit" name="choice" value={o} className={cn("h-13 rounded-2xl px-4 py-3.5 text-base font-semibold transition active:scale-[0.99]", n === 0 ? "bg-primary text-primary-foreground" : "border border-primary bg-card text-primary", preselect === o && "ring-2 ring-primary/40")}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <textarea name="message" rows={2} placeholder="Add a note for the office (optional)" className="mt-3 w-full rounded-2xl border border-border bg-card px-3.5 py-3 text-base outline-none focus:border-primary" />
                    <p className="mt-2 text-xs text-stone">You can also reply to the text with 1 or 2.</p>
                  </form>
                )}
              </div>
            ) : null}

            {v.report.ownerAction === "call" ? (
              <div className="mt-8 flex items-start gap-3 rounded-3xl bg-card p-5 shadow-xs">
                <Phone className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-base font-medium text-ink">We will call you shortly.</p>
                  <p className="mt-1 text-sm text-stone">If you would rather reach us first, the office is at {org.phone}.</p>
                </div>
              </div>
            ) : null}

            {v.photos.length ? (
              <div className="mt-8">
                <p className="eyebrow text-stone">Photos from today</p>
                <PhotoGrid photos={v.photos} className="mt-3" size="lg" />
              </div>
            ) : null}

            <div className="mt-10 border-t border-border pt-6 text-sm text-stone">
              <p>
                Sent by {org.name} Estate Management.
                {org.phone ? ` Questions, call ${org.phone}.` : ""}
              </p>
              {primary ? (
                <p className="mt-2">
                  <Link href={`/home/${primary.portalToken}`} className="font-medium text-primary hover:underline">
                    See every visit to {v.estate.name}
                  </Link>
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
