/**
 * Shown while a page is loading, so a slow page never looks broken.
 * It is a plain skeleton - no animation beyond DESIGN.md's subtle rules.
 */
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-5xl px-6 py-16"
    >
      <span className="sr-only">Loading&hellip;</span>

      <div className="h-9 w-40 rounded-lg bg-slate-200" />
      <div className="mt-3 h-5 w-64 rounded-lg bg-slate-100" />

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 p-5">
            <div className="aspect-square w-full rounded-lg bg-slate-100" />
            <div className="mt-4 h-5 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-full rounded bg-slate-100" />
            <div className="mt-5 h-10 w-full rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}