'use client'

import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { useAdminFeedback, useReportSummary } from '@/lib/hooks'

function Bars({
  items,
  format,
}: {
  items: { label: string; value: number | null }[]
  format: (v: number) => string
}) {
  const max = Math.max(1, ...items.map((i) => i.value ?? 0))
  return (
    <ul className="flex h-40 items-end gap-2" role="list">
      {items.map((i) => (
        <li key={i.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 h-full">
          <span className="text-[11px] tabular-nums text-slate">
            {i.value == null ? '—' : format(i.value)}
          </span>
          <span
            className="w-full rounded-t-lg bg-brand"
            style={{ height: `${((i.value ?? 0) / max) * 100}%`, minHeight: i.value ? 4 : 0 }}
            aria-hidden
          />
          <span className="text-[11px] text-slate">{i.label}</span>
        </li>
      ))}
    </ul>
  )
}

export function ReportInsights() {
  const summary = useReportSummary()
  const feedback = useAdminFeedback(1, 5)

  const days = summary.data?.perDay ?? []
  const label = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

  return (
    <section className="space-y-4" aria-label="Last 7 days">
      <h2 className="text-xl text-ink">Last 7 days</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-3 border-hairline bg-paper p-5">
          <h3 className="text-base text-ink">Requests per day</h3>
          <Bars
            items={days.map((d) => ({ label: label(d.date), value: d.requests }))}
            format={(v) => String(v)}
          />
        </Card>
        <Card className="gap-3 border-hairline bg-paper p-5">
          <h3 className="text-base text-ink">Response time (min)</h3>
          <Bars
            items={days.map((d) => ({ label: label(d.date), value: d.avgResponseMinutes }))}
            format={(v) => v.toFixed(1)}
          />
          <p className="text-xs text-slate">Request to assignment</p>
        </Card>
        <Card className="gap-3 border-hairline bg-paper p-5">
          <h3 className="text-base text-ink">Requests by ambulance type</h3>
          <Bars
            items={Object.entries(summary.data?.byAmbulanceType ?? {}).map(([k, v]) => ({
              label: k,
              value: v,
            }))}
            format={(v) => String(v)}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-3 border-hairline bg-paper p-5">
          <h3 className="text-base text-ink">Cancellation reasons</h3>
          {summary.data && summary.data.cancellationReasons.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {summary.data.cancellationReasons.slice(0, 5).map((r) => (
                <li key={r.reason} className="flex justify-between gap-3 text-ink">
                  <span className="truncate">{r.reason}</span>
                  <span className="tabular-nums text-slate">{r.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate">No cancellations in this period.</p>
          )}
        </Card>
        <Card className="gap-3 border-hairline bg-paper p-5">
          <h3 className="text-base text-ink">Recent feedback</h3>
          {feedback.data && feedback.data.items.length > 0 ? (
            <ul className="space-y-3">
              {feedback.data.items.map((f) => (
                <li key={f.id} className="space-y-0.5">
                  <p className="flex items-center gap-1 text-amber" aria-label={`${f.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < f.rating ? 'fill-current' : 'opacity-30'}`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-slate">{f.driver.name}</span>
                  </p>
                  {f.comment && <p className="text-sm text-ink">{f.comment}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Star className="h-6 w-6 text-slate" />}
              title="No feedback yet"
              description="Ratings appear here after patients review completed trips."
            />
          )}
        </Card>
      </div>
    </section>
  )
}
