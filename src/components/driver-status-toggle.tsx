'use client'

import { cn } from '@/lib/utils'
import type { DriverStatus } from '@/types/api'

interface DriverStatusToggleProps {
  status: DriverStatus
  onChange: (online: boolean) => void
  loading?: boolean
  /** e.g. "Last updated: 2 min ago" */
  subtext?: string
}

/**
 * The driver's primary control: one large switch for duty status.
 * Label on the left, 64x34 track on the right, sized for gloved hands.
 */
export function DriverStatusToggle({
  status,
  onChange,
  loading = false,
  subtext,
}: DriverStatusToggleProps) {
  const online = status !== 'OFFLINE'
  const label = loading
    ? 'Switching…'
    : status === 'ON_TRIP'
      ? 'On trip'
      : online
        ? 'Online'
        : 'Offline'

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-lg font-extrabold text-ink">{label}</p>
        {subtext && <p className="text-sm text-slate">{subtext}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={online}
        aria-label={online ? 'Go offline' : 'Go on duty'}
        disabled={loading || status === 'ON_TRIP'}
        onClick={() => onChange(!online)}
        className={cn(
          'relative h-[34px] w-16 shrink-0 rounded-full transition-colors duration-200',
          'outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
          'disabled:cursor-not-allowed disabled:opacity-60',
          online ? 'bg-oxygen' : 'bg-slate',
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-1 h-[26px] w-[26px] rounded-full bg-white shadow transition-transform duration-200',
            online ? 'translate-x-[34px]' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
