import { Badge } from '@/components/ui/badge'
import type { RequestStatus } from '@/types/api'

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  ASSIGNED: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 border-blue-200' },
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
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
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
