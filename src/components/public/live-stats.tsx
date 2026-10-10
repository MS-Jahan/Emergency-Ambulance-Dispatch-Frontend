'use client'

import { usePublicStats } from '@/lib/hooks'

/** Real counts from GET /public/stats. Renders nothing until they load, so no invented numbers. */
export function LiveStats() {
  const { data } = usePublicStats()
  if (!data) return null
  const items = [
    { value: data.hospitals, label: 'hospitals in the directory' },
    { value: data.ambulancesAvailable, label: 'ambulances available now' },
    { value: data.requestsCompleted, label: 'trips completed' },
  ]
  return (
    <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((st) => (
        <div key={st.label} className="rounded-2xl border border-hairline bg-paper p-5">
          <dt className="font-heading text-3xl tabular-nums tracking-tight text-ink">{st.value}</dt>
          <dd className="text-sm text-slate">{st.label}</dd>
        </div>
      ))}
    </dl>
  )
}
