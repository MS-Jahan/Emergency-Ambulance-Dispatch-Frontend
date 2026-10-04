'use client'

import { MapPin } from 'lucide-react'
import { TripLine } from '@/components/trip-line'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { EmergencyRequest, RequestStatus } from '@/types/api'

const STATUS_DOT: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-500',
  ASSIGNED: 'bg-amber-500',
  EN_ROUTE_PICKUP: 'bg-oxygen',
  PICKED_UP: 'bg-oxygen',
  EN_ROUTE_HOSPITAL: 'bg-oxygen',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
}

interface RequestCardProps {
  request: EmergencyRequest
  onClick?: () => void
  showMap?: boolean
  compact?: boolean
  className?: string
}

/**
 * One ambulance request as a row: status + address on the left,
 * assigned ambulance/driver in the middle, compact trip line on the right.
 * Used by the patient request list and the dispatch board.
 */
export function RequestCard({
  request,
  onClick,
  showMap,
  compact,
  className,
}: RequestCardProps) {
  const time = new Date(request.requestedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const body = (
    <>
      {/* Left: status + address */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              STATUS_DOT[request.status] ?? 'bg-slate',
            )}
            aria-hidden
          />
          <StatusBadge status={request.status} />
        </div>
        <p
          className={cn(
            'mt-1.5 font-medium text-ink',
            compact ? 'text-sm truncate' : 'line-clamp-2 text-sm sm:text-base',
          )}
        >
          {request.pickupAddress}
        </p>
        <p className="mt-0.5 text-xs text-slate">{time}</p>
      </div>

      {/* Middle: ambulance + driver (when assigned) */}
      <div className="hidden sm:block w-[180px] shrink-0 text-sm">
        {request.ambulance ? (
          <div className="space-y-0.5">
            <p className="font-medium text-ink">
              {request.ambulance.plateNumber}
            </p>
            <p className="text-xs text-slate truncate">
              {request.driver?.name ?? 'Driver unassigned'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate">
            {request.status === 'CANCELLED'
              ? 'Cancelled'
              : 'Awaiting assignment'}
          </p>
        )}
      </div>

      {/* Right: trip progress */}
      <div className="hidden md:block w-[120px] shrink-0">
        <TripLine status={request.status} compact />
      </div>

      {/* Optional map preview slot (dispatch board) */}
      {showMap && (
        <div className="hidden lg:flex h-14 w-20 shrink-0 items-center justify-center rounded border border-hairline bg-gauze text-slate">
          <MapPin className="h-4 w-4" />
        </div>
      )}
    </>
  )

  const shell = cn(
    'flex items-center gap-3 rounded-lg border border-hairline bg-paper',
    compact ? 'p-3' : 'p-4',
    onClick &&
      'cursor-pointer hover:border-ink/30 hover:shadow-md hover:-translate-y-px transition-all',
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, 'w-full text-left')}>
        {body}
      </button>
    )
  }
  return <div className={shell}>{body}</div>
}
