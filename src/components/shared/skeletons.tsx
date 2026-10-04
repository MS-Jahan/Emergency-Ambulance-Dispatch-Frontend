import { Skeleton } from '@/components/ui/skeleton'

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-hairline bg-paper p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-hairline bg-paper p-4 flex items-center justify-between"
        >
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-hairline bg-paper p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  )
}
