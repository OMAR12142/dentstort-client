/**
 * PublicPortfolioSkeleton — Layout-matched loading state for PublicPortfolioPage
 * aligning with the compact PublicPortfolioHeader, PublicPortfolioInfo,
 * and PublicCaseShowcase proportions in both Light Mode and Dark Mode.
 */
export default function PublicPortfolioSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading portfolio..."
      className="bg-base-100 min-h-screen pb-8 font-sans animate-pulse"
    >
      {/* 1. Profile Header Skeleton (Cover Banner + Overlapping Avatar + Identity & Stat Pills) */}
      <div className="bg-base-200 border-b border-neutral-light pb-4 shadow-sm">
        {/* Cover Banner */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="w-full h-36 sm:h-44 md:h-48 rounded-2xl bg-base-content/10 border border-neutral-light" />
        </div>

        {/* Overlapping Circular Avatar, Name, Clinic Subtitle & Trust Pills */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-5 -mt-10 sm:-mt-12 px-2 sm:px-4 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-base-100 bg-base-content/15 shadow-lg shrink-0" />
              <div className="pb-0.5 space-y-2 flex flex-col items-center sm:items-start">
                <div className="h-6 sm:h-7 w-48 sm:w-56 rounded-lg bg-base-content/15" />
                <div className="h-3.5 w-36 rounded-md bg-base-content/10" />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <div className="h-5 w-24 rounded-full bg-base-content/10" />
                  <div className="h-5 w-28 rounded-full bg-base-content/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Information Row + 3. Case Showcase Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Bio & Core Expertise Card */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="h-3 w-36 rounded bg-base-content/10 mb-3" />
              <div className="h-3.5 w-full rounded bg-base-content/10" />
              <div className="h-3.5 w-11/12 rounded bg-base-content/10" />
              <div className="h-3.5 w-3/4 rounded bg-base-content/10" />
              <div className="pt-4 mt-4 border-t border-neutral-light space-y-2.5">
                <div className="h-3 w-24 rounded bg-base-content/10" />
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4].map((chip) => (
                    <div
                      key={chip}
                      className="h-7 w-20 rounded-lg bg-base-100 border border-neutral-light"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Clinic Card */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-base-content/10 shrink-0" />
                <div className="h-4 w-36 rounded bg-base-content/15" />
              </div>
              <div className="space-y-2">
                <div className="h-10 w-full rounded-xl bg-base-content/15" />
                <div className="h-10 w-full rounded-xl bg-base-100 border border-neutral-light" />
                <div className="h-10 w-full rounded-xl bg-base-100 border border-neutral-light" />
              </div>
              <div className="pt-3 border-t border-neutral-light flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-base-100 border border-neutral-light shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 w-20 rounded bg-base-content/10" />
                  <div className="h-3.5 w-36 rounded bg-base-content/15" />
                  <div className="h-3 w-full rounded bg-base-content/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Showcase Skeleton */}
        <div className="pt-1 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-4 border-b border-neutral-light">
            <div className="space-y-1.5">
              <div className="h-7 w-40 rounded-lg bg-base-content/15" />
              <div className="h-3.5 w-52 rounded-md bg-base-content/10" />
            </div>
            <div className="h-6 w-24 rounded-full bg-base-content/10" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            {[1, 2, 3, 4, 5, 6].map((pill) => (
              <div
                key={pill}
                className={`h-8 rounded-xl border border-neutral-light ${
                  pill === 1 ? 'w-14 bg-base-content/15' : 'w-22 bg-base-200'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-base-200 border border-neutral-light rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-[4/3] bg-base-content/10 shrink-0" />
                <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3.5 sm:h-4 w-3/4 rounded-md bg-base-content/15" />
                    <div className="h-2.5 sm:h-3 w-full rounded bg-base-content/10" />
                  </div>
                  <div className="pt-2 sm:pt-3 border-t border-neutral-light/70 flex items-center justify-between">
                    <div className="h-2.5 sm:h-3 w-14 sm:w-16 rounded bg-base-content/10" />
                    <div className="h-2.5 sm:h-3 w-8 sm:w-10 rounded bg-base-content/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
