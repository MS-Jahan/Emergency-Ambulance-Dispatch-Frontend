import { Skeleton } from '@/components/ui/skeleton'
import { StatGridSkeleton } from '@/components/shared/skeletons'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <StatGridSkeleton count={4} />
    </div>
  )
}
