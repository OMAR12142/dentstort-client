export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-base-200 rounded-lg p-4 sm:p-6 space-y-4 border border-neutral-light shadow-none"
        >
          <div className="skeleton shadow-none border-0 h-4 bg-base-300 rounded-full w-3/4" />
          <div className="skeleton shadow-none border-0 h-3 bg-base-300 rounded-full w-1/2" />
          <div className="skeleton shadow-none border-0 h-3 bg-base-300 rounded-full w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="skeleton shadow-none border-0 h-3 bg-base-300 rounded-full w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TimelineSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 sm:gap-6">
          <div className="skeleton shadow-none border-0 w-3 h-3 rounded-full bg-base-300 mt-2 shrink-0" />
          <div className="flex-1 bg-base-200 rounded-lg p-4 sm:p-6 space-y-3 border border-neutral-light shadow-none">
            <div className="skeleton shadow-none border-0 h-4 bg-base-300 rounded-full w-1/3" />
            <div className="skeleton shadow-none border-0 h-3 bg-base-300 rounded-full w-2/3" />
            <div className="skeleton shadow-none border-0 h-3 bg-base-300 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
