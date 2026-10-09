/* Instant response on every click: the shell stays, the page area shows a quiet skeleton. */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-9 w-72 rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-96 rounded-2xl border border-border bg-card lg:col-span-7" />
        <div className="h-96 rounded-2xl border border-border bg-card lg:col-span-5" />
      </div>
    </div>
  );
}
