'use client'

import { Check } from 'lucide-react'
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

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-500',
  ASSIGNED: 'bg-amber-500',
  EN_ROUTE_PICKUP: 'bg-oxygen-500',
  PICKED_UP: 'bg-oxygen-500',
  EN_ROUTE_HOSPITAL: 'bg-oxygen-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
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
      <div
        className={cn('flex items-center gap-2', vertical && 'flex-col')}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
          <span className="text-xs" aria-hidden>✕</span>
        </div>
        <span className={cn('text-xs font-medium text-slate-500', !vertical && 'truncate')}>
          Cancelled
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        vertical ? 'flex-col h-full' : 'w-full',
        compact ? 'gap-0.5' : 'gap-2',
      )}
    >
      {STATUSES.map((s, idx) => {
        const isDone = idx < currentIndex
        const isCurrent = idx === currentIndex
        const color = isDone || isCurrent ? STATUS_COLORS[s] : 'bg-slate-200 dark:bg-slate-700'

        return (
          <div key={s} className={vertical ? 'w-full' : 'flex-1'}>
            <div className="flex items-center gap-1 min-h-fit">
              {/* Dot */}
              <div
                aria-hidden
                className={cn(
                  'flex-shrink-0 w-2 h-2 rounded-full transition-all',
                  color,
                  isCurrent && 'trip-dot-active w-3 h-3',
                )}
              />

              {/* Line to next */}
              {idx < STATUSES.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 transition-colors',
                    isDone || isCurrent ? 'bg-slate-400 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700',
                    vertical && 'hidden',
                    compact && 'mx-0',
                  )}
                />
              )}

              {/* Label */}
              {!compact && (
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isDone || isCurrent
                      ? 'text-ink dark:text-paper'
                      : 'text-slate-400 dark:text-slate-600',
                  )}
                >
                  {STATUS_LABELS[s]}
                </span>
              )}
            </div>
          </div>
        )
      })}

      {isCompleted && (
        <div className="flex items-center gap-1 flex-1">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Done</span>
        </div>
      )}
    </div>
  )
}
