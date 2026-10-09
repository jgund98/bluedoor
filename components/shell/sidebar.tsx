"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sun,
  CheckSquare,
  Inbox,
  CalendarDays,
  ClipboardList,
  Home,
  Wrench,
  ListChecks,
  Zap,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";
import { logout } from "@/lib/actions/auth";
import { ROLE_LABEL } from "@/lib/format";

export type NavCounts = { approvals: number; requests: number; today: number; outboxHeld: number };

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; count?: number; countTone?: "amber" | "red" | "navy" };

export function Sidebar({ user, counts }: { user: { name: string; role: string }; counts: NavCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const groups: { label: string; items: Item[] }[] = [
    {
      label: "Operate",
      items: [
        { href: "/today", label: "Today", icon: Sun, count: counts.today || undefined, countTone: "navy" },
        { href: "/approvals", label: "Approvals", icon: CheckSquare, count: counts.approvals || undefined, countTone: "amber" },
        { href: "/requests", label: "Requests", icon: Inbox, count: counts.requests || undefined, countTone: "amber" },
        { href: "/schedule", label: "Schedule", icon: CalendarDays },
        { href: "/visits", label: "Visits", icon: ClipboardList },
      ],
    },
    {
      label: "Directory",
      items: [
        { href: "/estates", label: "Estates", icon: Home },
        { href: "/vendors", label: "Vendors", icon: Wrench },
        { href: "/services", label: "Services", icon: ListChecks },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/automations", label: "Automations", icon: Zap },
        { href: "/outbox", label: "Outbox", icon: Send, count: counts.outboxHeld || undefined, countTone: "amber" },
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/demo", label: "Try it on a phone", icon: Smartphone },
      ],
    },
  ];

  const nav = (
    <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-3">
      {groups.map((g) => (
        <div key={g.label} className="mb-4">
          <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-subtle">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", active ? "bg-white/15" : "bg-muted text-muted-foreground group-hover:text-foreground")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{it.label}</span>
                    {it.count ? (
                      <span
                        className={cn(
                          "min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular",
                          active ? "bg-white/20 text-white" : it.countTone === "amber" ? "bg-warning-soft text-warning" : it.countTone === "red" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary",
                        )}
                      >
                        {it.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-3 border-b border-border px-5">
      <Image src="/brand/logo.png" alt="Bluedoor Building" width={36} height={36} className="h-9 w-9 rounded-full" priority />
      <div className="min-w-0 leading-tight">
        <p className="font-display text-base tracking-[0.12em] text-ink">BLUEDOOR</p>
        <p className="text-xs font-medium text-subtle">Estate management</p>
      </div>
    </div>
  );

  const footer = (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role] ?? user.role}</p>
        </div>
        <form action={logout}>
          <button type="submit" title="Sign out" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
          <span className="font-display text-sm tracking-[0.12em]">BLUEDOOR</span>
        </div>
        <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Phone tab bar: the four places the office lives, and the menu for the rest */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[
          { href: "/today", label: "Today", icon: Sun, count: counts.today },
          { href: "/approvals", label: "Approve", icon: CheckSquare, count: counts.approvals },
          { href: "/schedule", label: "Schedule", icon: CalendarDays },
          { href: "/estates", label: "Estates", icon: Home },
        ].map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className={cn("relative flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {t.label}
              {t.count ? <span className="absolute right-[18%] top-1.5 min-w-4 rounded-full bg-warning px-1 text-center text-[11px] font-semibold leading-4 text-white">{t.count}</span> : null}
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground" aria-label="Open menu">
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-card lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-abyss/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-card shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-display text-sm tracking-[0.12em]">BLUEDOOR</span>
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      ) : null}
    </>
  );
}
