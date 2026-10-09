import { CalendarPlus, Send, DoorOpen, FileCheck, CheckCircle2, MessageCircle, AlertTriangle, Undo2, Zap, Inbox, UserPlus, Home } from "lucide-react";
import type { Activity } from "@/lib/db/schema";
import { fmtDateTime, relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ICON: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  scheduled: { icon: CalendarPlus, cls: "bg-primary-soft text-primary" },
  dispatched: { icon: Send, cls: "bg-primary-soft text-primary" },
  reminder_sent: { icon: Send, cls: "bg-muted text-muted-foreground" },
  arrived: { icon: DoorOpen, cls: "bg-primary text-primary-foreground" },
  filed: { icon: FileCheck, cls: "bg-warning-soft text-warning" },
  approved: { icon: CheckCircle2, cls: "bg-success-soft text-success" },
  replied: { icon: MessageCircle, cls: "bg-info-soft text-info" },
  sent_back: { icon: Undo2, cls: "bg-warning-soft text-warning" },
  cancelled: { icon: Undo2, cls: "bg-muted text-muted-foreground" },
  no_show_alert: { icon: AlertTriangle, cls: "bg-danger-soft text-danger" },
  unapproved_nudge: { icon: Zap, cls: "bg-warning-soft text-warning" },
  unfiled_alert: { icon: AlertTriangle, cls: "bg-warning-soft text-warning" },
  decision_nudge: { icon: Zap, cls: "bg-muted text-muted-foreground" },
  request: { icon: Inbox, cls: "bg-warning-soft text-warning" },
  vendor_added: { icon: UserPlus, cls: "bg-muted text-muted-foreground" },
  vendor_assigned: { icon: UserPlus, cls: "bg-muted text-muted-foreground" },
  estate_added: { icon: Home, cls: "bg-success-soft text-success" },
};

export function Timeline({ items, estates, relative, className }: { items: Activity[]; estates?: Map<string, { name: string }> | Record<string, { name: string } | null>; relative?: boolean; className?: string }) {
  if (!items.length) return <p className="px-2 py-6 text-center text-xs text-subtle">Nothing yet.</p>;
  return (
    <ol className={cn("relative space-y-0", className)}>
      {items.map((a, i) => {
        const meta = ICON[a.kind.split(":")[0]] ?? { icon: Zap, cls: "bg-muted text-muted-foreground" };
        const Icon = meta.icon;
        const estateName = a.estateId ? (estates instanceof Map ? estates.get(a.estateId)?.name : estates?.[a.estateId]?.name) : null;
        return (
          <li key={a.id} className="relative flex gap-3 pb-4">
            {i < items.length - 1 ? <span className="absolute left-[13px] top-7 h-[calc(100%-12px)] w-px bg-border" /> : null}
            <span className={cn("relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.cls)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                {a.visitId ? (
                  <Link href={`/visits/${a.visitId}`} className="hover:underline">
                    {a.message}
                  </Link>
                ) : (
                  a.message
                )}
              </p>
              <p className="mt-0.5 text-xs text-subtle">
                {relative ? relTime(a.createdAt) : fmtDateTime(a.createdAt)}
                {estateName ? ` · ${estateName}` : ""}
                {a.actor === "system" ? " · automation" : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
