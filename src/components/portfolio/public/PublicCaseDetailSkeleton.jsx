/**
 * PublicCaseDetailSkeleton — Layout-matched loading state for PublicCaseDetailPage
 * matching the compact max-w-5xl editorial layout (header, max-w-3xl Before/After frame,
 * 4-col clinical thumbnail gallery, summary card & More from Doctor grid).
 */
export default function PublicCaseDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading case details..."
      className="bg-base-100 min-h-screen pb-16 font-sans animate-pulse"
    >
      {/* 1. Compact Case Header Skeleton */}
      <div className="bg-base-200 border-b border-neutral-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-32 rounded-md bg-base-content/10" />
            <div className="h-7 w-20 rounded-full bg-base-content/10" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-20 rounded-full bg-base-content/10" />
                <div className="h-5 w-24 rounded-full bg-base-content/10" />
              </div>
              <div className="h-7 sm:h-8 w-3/4 max-w-md rounded-lg bg-base-content/15" />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-base-content/15 shrink-0" />
              <div className="space-y-1">
                <div className="h-3.5 w-32 rounded bg-base-content/15" />
                <div className="h-2.5 w-24 rounded bg-base-content/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Editorial Body Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Before/After Section Header + Proportioned Slider Frame */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3.5 w-36 rounded bg-base-content/10" />
            <div className="h-7 w-36 rounded-full bg-base-content/10" />
          </div>

          <div className="max-w-3xl mx-auto w-full bg-base-200 border border-neutral-light rounded-2xl p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-44 rounded bg-base-content/10" />
              <div className="h-6 w-16 rounded-full bg-base-content/10" />
            </div>
            <div className="aspect-[16/10] max-h-[380px] sm:max-h-[440px] w-full rounded-xl bg-base-content/10" />
            <div className="h-3 w-56 mx-auto rounded bg-base-content/10" />
          </div>
        </div>

        {/* Compact Clinical Gallery Grid */}
        <div className="space-y-3">
          <div className="h-3.5 w-28 rounded bg-base-content/10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((tile) => (
              <div
                key={tile}
                className="aspect-[4/3] rounded-xl bg-base-200 border border-neutral-light"
              />
            ))}
          </div>
        </div>

        {/* Clinical Summary Card */}
        <div className="bg-base-200 border border-neutral-light p-4 sm:p-5 rounded-2xl space-y-2.5">
          <div className="h-3 w-24 rounded bg-base-content/10" />
          <div className="h-3.5 w-full rounded bg-base-content/10" />
          <div className="h-3.5 w-11/12 rounded bg-base-content/10" />
          <div className="h-3.5 w-2/3 rounded bg-base-content/10" />
        </div>
      </div>
    </div>
  );
}
