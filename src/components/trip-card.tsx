'use client'

import Link from 'next/link'
import { Check, ExternalLink, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { cn } from '@/lib/utils'
import type { EmergencyRequest } from '@/types/api'

const TRIP_STEPS: { status: string; label: string }[] = [
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'EN_ROUTE_PICKUP', label: 'To pickup' },
  { status: 'PICKED_UP', label: 'Picked up' },
  { status: 'EN_ROUTE_HOSPITAL', label: 'To hospital' },
  { status: 'COMPLETED', label: 'Done' },
]

interface TripCardProps {
  trip: EmergencyRequest
  /** Big active-trip presentation vs compact history row. */
  isActive?: boolean
  onCall?: () => void
  onNavigate?: () => void
}

/** Compact horizontal trip line for the active card. */
function MiniTripLine({ status }: { status: EmergencyRequest['status'] }) {
  const current = TRIP_STEPS.findIndex((s) => s.status === status)

  return (
    <ol className="flex items-start" aria-label="Trip progress">
      {TRIP_STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  'h-0.5 flex-1',
                  i === 0 ? 'opacity-0' : done || active ? 'bg-signal' : 'bg-hairline',
                )}
              />
              <span
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  active
                    ? 'bg-signal text-white ring-4 ring-signal/20 animate-pulse'
                    : done
                      ? 'bg-signal text-white'
                      : 'border border-hairline bg-gauze text-slate',
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'h-0.5 flex-1',
                  i === TRIP_STEPS.length - 1
                    ? 'opacity-0'
                    : done
                      ? 'bg-signal'
                      : 'bg-hairline',
                )}
              />
            </div>
            <span
              className={cn(
                'mt-1 text-center text-[10px] leading-tight',
                active ? 'font-semibold text-ink' : 'text-slate',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function TripCard({ trip, isActive = false, onCall, onNavigate }: TripCardProps) {
  const patient = trip.patient?.name ?? 'Patient'

  if (!isActive) {
    // History row: time, patient, status, detail link.
    return (
      <Link href={`/dashboard/requests/${trip.id}`} className="block">
        <Card className="border border-hairline p-3 transition-colors hover:bg-gauze/50">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{patient}</p>
              <p className="text-xs text-slate">
                {new Date(trip.completedAt ?? trip.requestedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' · '}
                {trip.pickupAddress || 'Pickup'}
              </p>
            </div>
            <StatusBadge status={trip.status} />
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="w-full space-y-4 border border-hairline p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-ink">{patient}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate">
            {trip.pickupAddress || 'Pickup address on file'}
          </p>
        </div>
        <PriorityBadge priority={trip.priority} />
      </div>

      <MiniTripLine status={trip.status} />

      {trip.destinationHospital && (
        <p className="flex items-center gap-1.5 text-sm text-slate">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-oxygen" aria-hidden />
          <span className="truncate">To: {trip.destinationHospital.name}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCall}
          disabled={!onCall}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-hairline bg-paper text-sm font-medium text-ink transition-colors hover:bg-gauze disabled:opacity-50"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call patient
        </button>
        <button
          type="button"
          onClick={onNavigate}
          disabled={!onNavigate}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-oxygen text-sm font-semibold text-paper transition-colors hover:bg-oxygen/90 disabled:opacity-50"
        >
          Navigate
          <ExternalLink className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </Card>
  )
}
