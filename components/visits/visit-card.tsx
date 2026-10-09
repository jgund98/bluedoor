import Link from "next/link";
import { Pill } from "@/components/ui/primitives";
import { ATTENTION, STATUS, fmtTime, fmtDate, WINDOW_LABEL, type VisitStatus, isToday, thumb } from "@/lib/format";
import type { VisitRow } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function VisitCard({ row, showDate, compact }: { row: VisitRow; showDate?: boolean; compact?: boolean }) {
  const st = STATUS[row.visit.status as VisitStatus] ?? STATUS.scheduled;
  const att = row.report ? ATTENTION[row.report.attention] : null;
  const live = row.visit.status === "in_progress";
  return (
    <Link
      href={`/visits/${row.visit.id}`}
      className={cn("group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-border hover:bg-muted/50", compact ? "" : "sm:gap-4 sm:px-3")}
    >
      <div className="w-14 shrink-0 text-right sm:w-16">
        <p className="text-base font-semibold tabular leading-tight">{fmtTime(row.visit.scheduledFor)}</p>
        <p className="text-xs text-subtle">{showDate && !isToday(row.visit.scheduledFor) ? fmtDate(row.visit.scheduledFor) : WINDOW_LABEL[row.visit.window]}</p>
      </div>
      <div
        className="hidden h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted bg-cover bg-center sm:block"
        style={row.estate.coverImage ? { backgroundImage: `url(${thumb(row.estate.coverImage)})` } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-medium leading-snug sm:line-clamp-1">
          {row.estate.name}
          <span className="text-muted-foreground"> · {row.service.name}</span>
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {row.vendor.name}
          {row.vendor.contactName ? ` · ${row.vendor.contactName}` : ""}
          {row.visit.requestedBy === "owner" ? " · requested by the owner" : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {att && att.label !== "Routine" ? (
          <Pill tone={att.tone} className="hidden sm:inline-flex">
            {att.label}
          </Pill>
        ) : null}
        <Pill tone={st.tone} dot={live} className={live ? "[&>span]:live-dot" : ""}>
          {st.label}
        </Pill>
      </div>
    </Link>
  );
}

export function VisitList({ rows, emptyText, showDate }: { rows: VisitRow[]; emptyText: string; showDate?: boolean }) {
  if (!rows.length) return <p className="px-3 py-6 text-center text-xs text-subtle">{emptyText}</p>;
  return (
    <div className="divide-y divide-border/70">
      {rows.map((r) => (
        <VisitCard key={r.visit.id} row={r} showDate={showDate} />
      ))}
    </div>
  );
}
