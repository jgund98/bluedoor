export default function Loading() {
  return (
    <div className="min-h-dvh bg-chalk">
      <div className="mx-auto max-w-lg animate-pulse px-5 pt-16" aria-busy="true" aria-label="Loading">
        <div className="h-3 w-32 rounded bg-card" />
        <div className="mt-3 h-9 w-64 rounded-lg bg-card" />
        <div className="mt-6 space-y-2">
          <div className="h-14 rounded-2xl bg-card" />
          <div className="h-14 rounded-2xl bg-card" />
          <div className="h-14 rounded-2xl bg-card" />
        </div>
      </div>
    </div>
  );
}
