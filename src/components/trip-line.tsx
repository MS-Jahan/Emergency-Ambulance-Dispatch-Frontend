'use client'

import type { RequestStatus } from '@/types/api'
import { cn } from '@/lib/utils'

const STATUSES: RequestStatus[] = [
  'PENDING',
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
  'COMPLETED',
]

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  EN_ROUTE_PICKUP: 'En route',
  PICKED_UP: 'Picked up',
  EN_ROUTE_HOSPITAL: 'To hospital',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

interface TripLineProps {
  status: RequestStatus
  compact?: boolean
  vertical?: boolean
}

export function TripLine({ status, compact, vertical }: TripLineProps) {
  const currentIndex = Math.max(0, STATUSES.indexOf(status))
  const isCompleted = status === 'COMPLETED'
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className={cn('flex items-center gap-2', vertical && 'flex-col')}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal text-white">
          <span className="text-xs" aria-hidden>✕</span>
        </div>
        <span className={cn('text-xs font-bold text-slate', !vertical && 'truncate')}>
          Cancelled
        </span>
      </div>
    )
  }

  // Done = green, current = amber (pulses 3x then stops), upcoming = hairline.
  const segment = (idx: number) =>
    isCompleted || idx < currentIndex
      ? 'bg-oxygen'
      : idx === currentIndex
        ? 'bg-amber trip-dot-active'
        : 'bg-hairline'

  return (
    <ol
      aria-label="Trip progress"
      className={cn(
        vertical ? 'flex flex-col gap-2' : 'flex w-full items-start',
        !vertical && (compact ? 'gap-1' : 'gap-1.5'),
      )}
    >
      {STATUSES.map((s, idx) => {
        const reached = isCompleted || idx <= currentIndex
        return (
          <li
            key={s}
            aria-current={idx === currentIndex && !isCompleted ? 'step' : undefined}
            className={cn(vertical ? 'flex items-center gap-2' : 'flex-1 min-w-0')}
          >
            <span
              aria-hidden
              className={cn(
                'block rounded-full transition-colors',
                vertical ? 'h-3 w-3' : compact ? 'h-1.5' : 'h-2',
                segment(idx),
              )}
            />
            {!compact && (
              <span
                className={cn(
                  'text-xs font-bold',
                  vertical ? '' : 'mt-1.5 block truncate',
                  reached ? 'text-ink' : 'text-slate',
                )}
              >
                {STATUS_LABELS[s]}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
