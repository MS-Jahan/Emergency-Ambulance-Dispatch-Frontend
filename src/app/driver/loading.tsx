import { Skeleton } from '@/components/ui/skeleton'
import { CardSkeleton } from '@/components/shared/skeletons'

export default function DriverLoading() {
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-[34px] w-16 rounded-full" />
      </div>
      <CardSkeleton />
      <Skeleton className="h-[76px] w-full rounded-full" />
    </div>
  )
}
