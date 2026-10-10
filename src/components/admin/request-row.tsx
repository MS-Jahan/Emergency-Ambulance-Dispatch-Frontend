'use client'

import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { EmergencyRequest } from '@/types/api'

const TERMINAL: EmergencyRequest['status'][] = ['COMPLETED', 'CANCELLED']

export function driverInitials(name?: string): string {
  if (!name) return '?'
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

/** Minutes between two timestamps, humanized ('just now', '4 min'). */
export function waitLabel(requestedAt: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(requestedAt).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min'
  if (mins >= 1440) return `${Math.floor(mins / 1440)} d`
  if (mins >= 60) return `${Math.floor(mins / 60)} h`
  return `${mins} min`
}

interface RequestRowProps {
  request: EmergencyRequest
  /** Parent-owned clock so this component stays pure. */
  now: number
  onClick: () => void
  /** Flash once — set after a dispatch action touched this row. */
  pulsing?: boolean
  /** Highlighted as the board's current selection. */
  selected?: boolean
}

/**
 * Compact board card: priority + patient + address | wait time |
 * assigned unit footer. Whole card is one click target for the detail sheet.
 */
export function RequestRow({ request, now, onClick, pulsing, selected }: RequestRowProps) {
  const terminal = TERMINAL.includes(request.status)

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Request from ${request.patient?.name ?? 'Patient'}`}
      className={cn(
        'rounded-2xl border border-hairline bg-gauze p-4 text-left cursor-pointer',
        'transition-all hover:border-brand/40 hover:shadow-sm hover:-translate-y-0.5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        selected && 'border-brand ring-2 ring-brand/30',
        pulsing && 'row-pulse',
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
        <p className="text-sm font-bold text-ink truncate">
          {request.patient?.name ?? 'Patient'}
        </p>
        <p className="line-clamp-2 text-xs text-slate">
          {request.pickupAddress || 'Pickup address on file'}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          {terminal ? (
            <span className="text-xs text-slate">
              {new Date(request.completedAt ?? request.requestedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate">
              <Clock className="h-3 w-3" aria-hidden />
              waiting {waitLabel(request.requestedAt, now)}
            </span>
          )}
          {request.ambulance && (
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">
                {driverInitials(request.driver?.name)}
              </span>
              <span className="truncate font-mono text-xs text-slate">
                {request.ambulance.plateNumber}
              </span>
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
