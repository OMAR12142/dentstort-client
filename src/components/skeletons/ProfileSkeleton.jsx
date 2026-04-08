import Card from '../Card';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="animate-pulse bg-base-200 border-transparent shadow-none">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
           <div className="flex items-center gap-4">
             <div className="skeleton w-14 h-14 rounded-lg bg-base-300 shrink-0 border-0 shadow-none"></div>
             <div className="space-y-2">
               <div className="skeleton h-6 w-48 bg-base-300 rounded-lg border-0 shadow-none"></div>
               <div className="flex gap-2">
                 <div className="skeleton h-4 w-16 bg-base-300 rounded-full border-0 shadow-none"></div>
                 <div className="skeleton h-4 w-24 bg-base-300 rounded-full border-0 shadow-none"></div>
               </div>
             </div>
           </div>
           <div className="flex gap-2">
             <div className="skeleton h-8 w-32 bg-base-300 rounded-lg border-0 shadow-none"></div>
             <div className="skeleton h-8 w-28 bg-base-300 rounded-lg border-0 shadow-none"></div>
           </div>
        </div>
        <div className="mt-4 flex gap-2">
           <div className="skeleton h-6 w-20 bg-base-300 rounded-full border-0 shadow-none"></div>
           <div className="skeleton h-6 w-24 bg-base-300 rounded-full border-0 shadow-none"></div>
        </div>
      </Card>

      {/* Timeline Section Title */}
      <div className="skeleton h-6 w-40 bg-base-300 rounded-lg mb-2 border-0 shadow-none"></div>
      
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex gap-4">
            <div className="flex flex-col items-center mt-6">
              <div className="w-3 h-3 rounded-full bg-base-300 shrink-0 border-0 shadow-none" />
              {i !== 3 && <div className="w-0.5 bg-base-300/50 flex-1 mt-2" />}
            </div>
            <Card className="flex-1 animate-pulse bg-base-200 border-transparent shadow-none">
              <div className="flex justify-between mb-4">
                 <div className="skeleton h-5 w-32 bg-base-300 rounded-lg border-0 shadow-none"></div>
                 <div className="flex gap-2">
                    <div className="skeleton h-6 w-6 bg-base-300 rounded border-0 shadow-none"></div>
                    <div className="skeleton h-6 w-6 bg-base-300 rounded border-0 shadow-none"></div>
                 </div>
              </div>
              <div className="skeleton h-4 w-3/4 bg-base-300 rounded-lg mb-2 border-0 shadow-none"></div>
              <div className="skeleton h-4 w-1/2 bg-base-300 rounded-lg mb-4 border-0 shadow-none"></div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[1, 2, 3, 4].map(j => (
                   <div key={j} className="h-16 bg-base-300 rounded-lg border-0 shadow-none"></div>
                 ))}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
