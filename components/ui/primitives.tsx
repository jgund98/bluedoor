import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn, toneClasses } from "@/lib/utils";
import { initials } from "@/lib/format";

/* ---------------- Buttons ---------------- */

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-ink shadow-sm",
  secondary: "bg-primary-soft text-primary hover:bg-ceramic",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  outline: "bg-card text-foreground border border-border hover:bg-muted",
  danger: "bg-danger text-white hover:brightness-95",
  success: "bg-success text-white hover:brightness-95",
};
const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2 rounded-xl",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
    variantClass[variant],
    sizeClass[size],
    extra,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
};

export function Button({ variant = "primary", size = "md", href, className, children, ...rest }: ButtonProps) {
  const cls = buttonClasses(variant, size, className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ---------------- Form fields ---------------- */

export const fieldClass =
  "w-full h-10 rounded-xl border border-border bg-input px-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-60";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "h-auto min-h-24 py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClass, "pr-8 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364708a%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center]", className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-subtle">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  name,
  defaultChecked,
  label,
  description,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3 hover:bg-muted/60">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-border p-0.5 transition peer-checked:bg-primary [&>span]:peer-checked:translate-x-4">
        <span className="h-4 w-4 rounded-full bg-white shadow transition" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  );
}

/* ---------------- Surfaces ---------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border bg-card shadow-xs", className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-5 pb-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Pill({
  tone = "slate",
  children,
  className,
  dot,
  solid,
}: {
  tone?: "slate" | "blue" | "amber" | "green" | "red" | "navy";
  children: ReactNode;
  className?: string;
  dot?: boolean;
  solid?: boolean;
}) {
  if (solid || tone === "navy") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap", toneClasses(tone), className)}>
        {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
        {children}
      </span>
    );
  }
  const text = tone === "blue" ? "text-info" : tone === "amber" ? "text-warning" : tone === "green" ? "text-success" : tone === "red" ? "text-danger" : "text-muted-foreground";
  const dotCls = tone === "blue" ? "bg-info" : tone === "amber" ? "bg-warning" : tone === "green" ? "bg-success" : tone === "red" ? "bg-danger" : "bg-subtle";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap", text, className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotCls)} />
      {children}
    </span>
  );
}

export function Avatar({ name, size = "md", className, src }: { name: string; size?: "sm" | "md" | "lg"; className?: string; src?: string | null }) {
  const sz = size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sz, className)} />;
  }
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary", sz, className)}>
      {initials(name)}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <span aria-hidden>←</span> {back.label}
          </Link>
        ) : null}
        {eyebrow ? <p className="eyebrow mb-1 text-subtle">{eyebrow}</p> : null}
        <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl lg:text-4xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:mt-1.5 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  detail,
  tone,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  detail?: ReactNode;
  tone?: "slate" | "blue" | "amber" | "green" | "red" | "navy";
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {hint ? <p className="hidden truncate text-xs text-subtle sm:block">{hint}</p> : null}
      </div>
      <p className={cn("mt-1 text-2xl font-semibold tabular tracking-tight sm:text-3xl", tone === "red" ? "text-danger" : tone === "amber" ? "text-warning" : tone === "green" ? "text-success" : "text-ink")}>{value}</p>
      {detail ? <div className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground sm:mt-1.5 sm:text-sm">{detail}</div> : null}
    </>
  );
  const cls = "block rounded-2xl border border-border bg-card px-4 py-3.5 shadow-xs transition sm:px-5 sm:py-4";
  if (href) {
    return (
      <Link href={href} className={cn(cls, "hover:border-primary/40 hover:shadow-md")}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right text-sm">{v || <span className="text-subtle">—</span>}</span>
    </div>
  );
}

export function Notice({ tone = "blue", title, children }: { tone?: "blue" | "amber" | "green" | "red"; title?: string; children: ReactNode }) {
  const cls =
    tone === "amber" ? "bg-warning-soft text-warning border-warning/20" : tone === "green" ? "bg-success-soft text-success border-success/20" : tone === "red" ? "bg-danger-soft text-danger border-danger/20" : "bg-info-soft text-info border-info/20";
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", cls)}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title ? "mt-0.5" : "", "text-sm leading-relaxed opacity-90")}>{children}</div>
    </div>
  );
}
