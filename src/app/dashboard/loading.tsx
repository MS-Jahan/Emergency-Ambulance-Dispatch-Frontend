import { Skeleton } from '@/components/ui/skeleton'
import { ListSkeleton } from '@/components/shared/skeletons'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <ListSkeleton rows={5} />
    </div>
  )
}
