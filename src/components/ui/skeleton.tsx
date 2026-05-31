export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-100 rounded-xl ${className || ''}`} />
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6">
          <Skeleton className="w-24 h-4 mb-4" />
          <Skeleton className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}

export function LinksSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="p-4 border-b border-zinc-100 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-48 h-3" />
          </div>
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <Skeleton className="w-40 h-5 mb-6" />
      <Skeleton className="w-full h-72" />
    </div>
  );
}
