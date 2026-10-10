import { Skeleton } from '@/components/ui/skeleton'

export default function DriverEarningsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Top metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border border-hairline rounded-xl bg-paper space-y-2"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex justify-between items-center gap-4">
        <Skeleton className="h-6 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Trips cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border border-hairline rounded-xl bg-paper flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
