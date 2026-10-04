import { Badge } from '@/components/ui/badge'
import type { RequestStatus } from '@/types/api'

// Brand palette: amber pending, teal in flight, neutral done, red cancelled.
const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: 'bg-amber/10 text-amber-700 dark:text-amber border-amber/30' },
  ASSIGNED: { label: 'Assigned', className: 'bg-oxygen/10 text-oxygen border-oxygen/30' },
  EN_ROUTE_PICKUP: {
    label: 'En route to pickup',
    className: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  },
  PICKED_UP: {
    label: 'Picked up',
    className: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  },
  EN_ROUTE_HOSPITAL: {
    label: 'En route to hospital',
    className: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-ink/5 text-ink border-hairline',
  },
  CANCELLED: { label: 'Cancelled', className: 'bg-signal/10 text-signal border-signal/30' },
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gauze text-slate border-hairline',
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
