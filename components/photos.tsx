/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

export function PhotoGrid({ photos, className, size = "md" }: { photos: { url: string; caption?: string | null }[]; className?: string; size?: "sm" | "md" | "lg" }) {
  if (!photos.length) return null;
  return (
    <div className={cn("grid gap-2", photos.length === 1 ? "grid-cols-1" : "grid-cols-2", size === "lg" ? "sm:grid-cols-2" : "sm:grid-cols-3", className)}>
      {photos.map((p, n) => (
        <figure key={`${p.url}-${n}`} className="overflow-hidden rounded-xl bg-muted">
          <a href={p.url} target="_blank" rel="noreferrer">
            <img src={p.url} alt={p.caption ?? ""} className={cn("w-full object-cover", size === "sm" ? "h-24" : size === "lg" ? "h-56" : "h-36")} loading="lazy" />
          </a>
          {p.caption ? <figcaption className="px-2 py-1.5 text-xs text-muted-foreground">{p.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
