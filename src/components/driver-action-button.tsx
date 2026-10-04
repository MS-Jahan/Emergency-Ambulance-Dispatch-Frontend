'use client'

import { Loader2, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/types/api'

/** Next action label per current trip status. */
const ACTION_LABEL: Partial<Record<RequestStatus, string>> = {
  ASSIGNED: 'Start driving to pickup',
  EN_ROUTE_PICKUP: 'Patient picked up',
  PICKED_UP: 'Drive to hospital',
  EN_ROUTE_HOSPITAL: 'Complete trip',
}

interface DriverActionButtonProps {
  status: RequestStatus
  onClick: () => void
  loading?: boolean
  className?: string
}

/**
 * The driver's one big action: advance the trip to its next status.
 * 64px tall, signal red — reachable and readable at a glance while driving.
 */
export function DriverActionButton({
  status,
  onClick,
  loading = false,
  className,
}: DriverActionButtonProps) {
  const label = ACTION_LABEL[status] ?? 'Advance trip'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex h-16 w-full items-center justify-center gap-2 rounded-xl',
        'bg-signal text-base font-semibold text-white',
        'shadow-lg shadow-signal/25 transition-transform',
        'hover:bg-signal/90 active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <Navigation className="h-5 w-5" aria-hidden />
      )}
      {loading ? 'Updating…' : label}
    </button>
  )
}
