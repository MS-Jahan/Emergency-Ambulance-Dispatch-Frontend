'use client'

import { useFares } from '@/lib/hooks'
import type { AmbulanceType } from '@/types/api'

export function AmbulanceFareBadge({
  type,
  fallback = null,
  suffix = 'per trip',
}: {
  type: AmbulanceType
  fallback?: string | null
  suffix?: string
}) {
  const { data, isError } = useFares()

  if (isError) {
    if (!fallback) return null
    return (
      <span>
        {fallback}
        {suffix && <span className="ml-1 font-sans text-xs text-slate">{suffix}</span>}
      </span>
    )
  }

  const rate = data?.rates?.[type]
  if (rate == null) {
    if (!fallback) return null
    return (
      <span>
        {fallback}
        {suffix && <span className="ml-1 font-sans text-xs text-slate">{suffix}</span>}
      </span>
    )
  }

  return (
    <span>
      ${rate}
      {suffix && <span className="ml-1 font-sans text-xs text-slate">{suffix}</span>}
    </span>
  )
}
