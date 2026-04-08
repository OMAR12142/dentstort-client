import Card from '../Card';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 bg-base-300 rounded-lg border-0 shadow-none"></div>
        <div className="skeleton h-4 w-64 bg-base-300 rounded-lg border-0 shadow-none"></div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-base-200 border-transparent shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton w-11 h-11 rounded-lg bg-base-300 border-0 shadow-none"></div>
              <div className="skeleton w-16 h-6 rounded-full bg-base-300 border-0 shadow-none"></div>
            </div>
            <div className="skeleton h-8 w-32 bg-base-300 rounded-lg mb-2 border-0 shadow-none"></div>
            <div className="skeleton h-4 w-24 bg-base-300 rounded-lg border-0 shadow-none"></div>
          </Card>
        ))}
      </div>

      {/* Chart Block / Upcoming */}
      <Card className="animate-pulse bg-base-200 border-transparent shadow-none min-h-[300px] flex flex-col justify-center items-center">
        <div className="skeleton h-8 w-1/3 bg-base-300 rounded-lg mb-8 max-w-[200px] border-0 shadow-none"></div>
        <div className="space-y-4 w-full flex flex-col items-center">
           <div className="skeleton h-4 w-3/4 max-w-md bg-base-300 rounded-lg border-0 shadow-none"></div>
           <div className="skeleton h-4 w-2/3 max-w-sm bg-base-300 rounded-lg border-0 shadow-none"></div>
           <div className="skeleton h-4 w-1/2 max-w-xs bg-base-300 rounded-lg border-0 shadow-none"></div>
        </div>
      </Card>
    </div>
  );
}
