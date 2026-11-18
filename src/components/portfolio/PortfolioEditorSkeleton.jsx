/**
 * PortfolioEditorSkeleton — Layout-matched loading skeleton for PortfolioEditorPage
 * (header bar, tab bar, identity shortcut, cover customizer & form fields grid).
 * Also exports MediaLibrarySkeleton for AddCaseModal / EditCaseModal media grids.
 */
export default function PortfolioEditorSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading portfolio editor..."
      className="space-y-5 sm:space-y-6 animate-pulse"
    >
      {/* 1. Identity Dashboard Header Bar Skeleton */}
      <div className="bg-base-200 border border-neutral-light shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-base-content/10 shrink-0" />
            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-40 rounded-lg bg-base-content/15" />
                <div className="h-5 w-14 rounded-full bg-base-content/10" />
              </div>
              <div className="h-3.5 w-60 max-w-full rounded-md bg-base-content/10" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="h-10 w-36 rounded-xl bg-base-content/15 flex-1 sm:flex-none" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="h-10 w-28 rounded-xl bg-base-content/10 flex-1 sm:flex-none" />
              <div className="h-10 w-24 rounded-xl bg-base-content/10 flex-1 sm:flex-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs Skeleton (Profile & Cases) */}
      <div className="flex items-center gap-1.5 bg-base-200 p-1 rounded-2xl border border-neutral-light w-fit">
        <div className="h-10 w-28 rounded-xl bg-base-content/15" />
        <div className="h-10 w-28 rounded-xl bg-base-content/10" />
      </div>

      {/* 3. Account Identity Shortcut Card Skeleton */}
      <div className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-base-content/10 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-md bg-base-content/15" />
            <div className="h-3 w-64 max-w-[65vw] rounded-md bg-base-content/10" />
          </div>
        </div>
        <div className="h-9 w-56 rounded-xl bg-base-content/10 shrink-0" />
      </div>

      {/* 4. Cover Banner Customizer Skeleton */}
      <div className="bg-base-200 border border-neutral-light rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-44 rounded-lg bg-base-content/15" />
            <div className="h-3.5 w-72 max-w-full rounded-md bg-base-content/10" />
          </div>
          <div className="h-9 w-40 rounded-xl bg-base-content/10 shrink-0" />
        </div>
        <div className="w-full h-40 sm:h-48 rounded-2xl bg-base-100 border border-neutral-light" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((preset) => (
            <div
              key={preset}
              className="h-14 rounded-xl bg-base-100 border border-neutral-light"
            />
          ))}
        </div>
      </div>

      {/* 5. Profile Form Card Skeleton */}
      <div className="bg-base-200 border border-neutral-light rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="h-5 w-48 rounded-lg bg-base-content/15" />

        {/* Custom URL Field */}
        <div className="space-y-2">
          <div className="h-3.5 w-36 rounded bg-base-content/10" />
          <div className="h-11 w-full rounded-xl bg-base-100 border border-neutral-light" />
        </div>

        {/* Bio Textarea */}
        <div className="space-y-2">
          <div className="h-3.5 w-32 rounded bg-base-content/10" />
          <div className="h-28 w-full rounded-xl bg-base-100 border border-neutral-light" />
        </div>

        {/* Two-Column Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((field) => (
            <div key={field} className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-base-content/10" />
              <div className="h-11 w-full rounded-xl bg-base-100 border border-neutral-light" />
            </div>
          ))}
        </div>

        {/* Submit Row */}
        <div className="pt-2 flex justify-end">
          <div className="h-11 w-48 rounded-xl bg-base-content/15" />
        </div>
      </div>
    </div>
  );
}

/**
 * MediaLibrarySkeleton — Thumbnail grid shimmer shown inside AddCaseModal & EditCaseModal
 * while useMediaLibrary() is loading session media.
 */
export function MediaLibrarySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading media library..."
      className="space-y-3 animate-pulse"
    >
      {[1, 2].map((group) => (
        <div
          key={group}
          className="border border-neutral-light rounded-2xl p-4 bg-base-100 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-32 rounded-md bg-base-content/15" />
            <div className="h-3 w-20 rounded-md bg-base-content/10" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4].map((tile) => (
              <div
                key={tile}
                className="aspect-square rounded-xl bg-base-content/10"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

