'use client'

import { Card } from '@/components/ui/card'

interface DonutSlice {
  label: string
  value: number
  color: string
}

export function StatusDonut({
  slices,
  centerLabel,
}: {
  slices: DonutSlice[]
  centerLabel?: string
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 140 140" className="h-36 w-36 flex-shrink-0 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="18"
          className="stroke-gauze"
        />
        {total > 0 &&
          slices
            .filter((s) => s.value > 0)
            .map((s) => {
              const length = (s.value / total) * circumference
              const dash = `${length} ${circumference - length}`
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  strokeWidth="18"
                  stroke={s.color}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              )
              offset += length
              return el
            })}
      </svg>
      <ul className="space-y-2 min-w-40">
        {centerLabel && (
          <li className="text-xs font-medium uppercase tracking-wide text-slate">
            {centerLabel}
          </li>
        )}
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate">{s.label}</span>
            <span className="ml-auto font-semibold text-ink tabular-nums">
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StatusDonutCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-5 border border-hairline">
      <p className="text-sm font-semibold text-ink mb-4">Requests by status</p>
      {children}
    </Card>
  )
}
