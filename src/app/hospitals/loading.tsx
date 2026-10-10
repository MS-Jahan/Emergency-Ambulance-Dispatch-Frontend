import { Skeleton } from '@/components/ui/skeleton'

export default function HospitalsLoading() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <div className="h-16 border-b border-hairline bg-paper/80" />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Nearby strip skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid gap-3 lg:grid-cols-5 sm:grid-cols-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-hairline bg-paper p-4 space-y-3"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Directory filter & grid skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Skeleton className="h-7 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-60" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-paper border border-hairline rounded-xl p-5 space-y-3"
              >
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
