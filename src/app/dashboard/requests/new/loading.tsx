import { Skeleton } from '@/components/ui/skeleton'

export default function NewRequestLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-xl border border-hairline bg-paper p-6 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Map box */}
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Form fields */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
