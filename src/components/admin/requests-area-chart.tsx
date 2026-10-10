'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import type { EmergencyRequest } from '@/types/api'

const DAYS = 14

interface DayPoint {
  label: string
  count: number
}

/**
 * Requests-per-day over the last 14 days. No backend time-series endpoint
 * exists, so the series is derived client-side from the admin request feed
 * (newest first, limit 100) bucketed by local calendar day.
 */
export function buildSeries(items: EmergencyRequest[], today: Date): DayPoint[] {
  const buckets = new Map<string, number>()
  const days: Date[] = []
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (DAYS - 1))
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
    buckets.set(d.toDateString(), 0)
  }
  for (const r of items) {
    const key = new Date(r.requestedAt).toDateString()
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return days.map((d) => ({
    label: d.toLocaleDateString([], { weekday: 'short', day: 'numeric' }),
    count: buckets.get(d.toDateString()) ?? 0,
  }))
}

export function RequestsAreaChart({ items }: { items: EmergencyRequest[] }) {
  // today lives in state so render stays pure; the series derives from it.
  const [today] = useState(() => new Date())
  const series = useMemo(() => buildSeries(items, today), [items, today])
  const empty = items.length === 0

  return (
    <Card className="p-5 border border-hairline">
      <h2 className="text-lg">Requests over time</h2>
      <p className="text-xs text-slate">Last 14 days</p>
      {empty ? (
        <div className="mt-6 flex h-56 items-center justify-center text-sm text-slate">
          No requests in this window yet.
        </div>
      ) : (
        <div className="mt-4 h-56" aria-label="Requests per day, last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="requestFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--slate)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--slate)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: 'var(--hairline)' }}
                formatter={(value) => [`${value} requests`, undefined]}
                contentStyle={{
                  background: 'var(--paper)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 12,
                  color: 'var(--ink)',
                }}
                labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--ink)' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--brand)"
                strokeWidth={2}
                fill="url(#requestFill)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--brand)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
