import Card from '../Card';

export default function PatientsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="skeleton h-12 w-full bg-base-300 rounded-lg border-0 shadow-none"></div>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="skeleton h-8 w-24 bg-base-300 rounded-lg border-0 shadow-none"></div>
             <div className="skeleton h-8 w-36 bg-base-300 rounded-lg border-0 shadow-none"></div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
             <div className="skeleton h-10 w-32 bg-base-300 rounded-lg border-0 shadow-none"></div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-light pb-2 overflow-hidden">
         {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-6 w-20 bg-base-300 rounded-lg border-0 shadow-none"></div>)}
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse bg-base-200 border-transparent shadow-none flex flex-col justify-between min-h-[220px]">
             <div className="flex items-start justify-between mb-4">
               <div className="flex-1 space-y-2 pr-4">
                 <div className="skeleton h-5 w-3/4 bg-base-300 rounded-lg border-0 shadow-none"></div>
                 <div className="skeleton h-4 w-1/2 bg-base-300 rounded-lg border-0 shadow-none"></div>
               </div>
               <div className="skeleton w-12 h-12 rounded-lg bg-base-300 shrink-0 border-0 shadow-none"></div>
             </div>
             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-base-300/50 mb-4">
                 <div>
                    <div className="skeleton h-3 w-8 bg-base-300 rounded mb-1 border-0 shadow-none"></div>
                    <div className="skeleton h-4 w-16 bg-base-300 rounded border-0 shadow-none"></div>
                 </div>
             </div>
             <div className="flex gap-2">
                <div className="skeleton h-8 flex-1 bg-base-300 rounded-lg border-0 shadow-none"></div>
                <div className="skeleton h-8 flex-1 bg-base-300 rounded-lg border-0 shadow-none"></div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
