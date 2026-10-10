import { Skeleton } from '@/components/ui/skeleton'

export default function RequestDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Status timeline / line skeleton */}
      <div className="rounded-xl border border-hairline bg-paper p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-4 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Map & details grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-hairline bg-paper overflow-hidden">
            <Skeleton className="h-72 w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-hairline bg-paper p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="rounded-xl border border-hairline bg-paper p-5 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
