import React from 'react';

/**
 * PublicPortfolioSkeleton — Loading state for the public portfolio page.
 */
export default function PublicPortfolioSkeleton() {
  return (
    <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] min-h-screen pb-2 font-sans animate-pulse">
      {/* Banner Skeleton */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="w-full h-40 sm:h-64 bg-gray-200 dark:bg-gray-800 rounded-br-[80px] sm:rounded-br-[160px] sm:rounded-tl-[40px]" />
      </div>

      {/* Identity Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-12 sm:-mt-16">
        <div className="flex flex-col sm:flex-row items-end gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gray-300 dark:bg-gray-700 border-[6px] border-[#F3F2EF] dark:border-[#1A1A1A]" />
          <div className="space-y-3 pb-4">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
          </div>
        </div>
      </div>

      {/* Bio & Contact Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="space-y-4">
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-3xl" />
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
