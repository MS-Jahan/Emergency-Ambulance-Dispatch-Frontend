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
 * Sized for gloved hands and glances — 64×32 track, unmistakable color.
 */
export function DriverStatusToggle({
  status,
  onChange,
  loading = false,
  subtext,
}: DriverStatusToggleProps) {
  const online = status !== 'OFFLINE'

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={online}
        aria-label={online ? 'Go offline' : 'Go on duty'}
        disabled={loading || status === 'ON_TRIP'}
        onClick={() => onChange(!online)}
        className={cn(
          'relative h-8 w-16 rounded-full transition-colors duration-200',
          'disabled:cursor-not-allowed disabled:opacity-60',
          online ? 'bg-emerald-500' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200',
            online ? 'translate-x-9' : 'translate-x-1',
          )}
        />
      </button>
      <p className="text-sm font-semibold text-ink">
        {loading ? 'Switching…' : online ? "You're Online" : "You're Offline"}
      </p>
      {subtext && <p className="text-xs text-slate">{subtext}</p>}
    </div>
  )
}
