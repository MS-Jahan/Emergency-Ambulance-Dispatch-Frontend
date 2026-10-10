import { Badge } from '@/components/ui/badge'
import type { RequestStatus } from '@/types/api'

// Brand palette: amber pending, teal in flight, neutral done, red cancelled.
const PILL = 'rounded-full px-2.5 font-extrabold border-transparent'
const PENDING = `${PILL} bg-amber text-white`
const ACTIVE = `${PILL} bg-oxygen text-white`

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: PENDING },
  ASSIGNED: { label: 'Assigned', className: ACTIVE },
  EN_ROUTE_PICKUP: {
    label: 'En route to pickup',
    className: ACTIVE,
  },
  PICKED_UP: {
    label: 'Picked up',
    className: ACTIVE,
  },
  EN_ROUTE_HOSPITAL: {
    label: 'En route to hospital',
    className: ACTIVE,
  },
  COMPLETED: {
    label: 'Completed',
    className: `${PILL} bg-brand-soft text-brand`,
  },
  CANCELLED: { label: 'Cancelled', className: `${PILL} bg-muted text-slate` },
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: `${PILL} bg-muted text-slate`,
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
