'use client'

import { useEffect, useState } from 'react'
import { RadioTower } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { RequestRow } from '@/components/admin/request-row'
import { RequestDetailSheet } from '@/components/admin/request-detail-sheet'
import { CardSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { useAdminRequests } from '@/lib/hooks'
import type { EmergencyRequest } from '@/types/api'

const IN_PROGRESS: EmergencyRequest['status'][] = [
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
]

const CLOSED: EmergencyRequest['status'][] = ['COMPLETED', 'CANCELLED']

interface Column {
  title: string
  dot: string
  rows: EmergencyRequest[]
}

/**
 * Live dispatch board: three columns (pending / in progress / closed),
 * 5s polling, click a card for the dispatch detail sheet.
 */
export default function DispatchBoardPage() {
  const board = useAdminRequests(1, 100, undefined, { refetchInterval: 5000 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pulseId, setPulseId] = useState<string | null>(null)

  const pulseRow = (id: string) => {
    setPulseId(id)
    setTimeout(() => setPulseId((cur) => (cur === id ? null : cur)), 1000)
  }

  // Parent-owned clock: RequestRow re-renders its wait label on this tick
  // without owning timers itself.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const items = board.data?.items ?? []
  const columns: Column[] = [
    {
      title: 'Pending',
      dot: 'bg-amber',
      rows: items.filter((r) => r.status === 'PENDING'),
    },
    {
      title: 'In Progress',
      dot: 'bg-oxygen',
      rows: items.filter((r) => IN_PROGRESS.includes(r.status)),
    },
    {
      title: 'Completed',
      dot: 'bg-slate-300',
      rows: items.filter((r) => CLOSED.includes(r.status)),
    },
  ]
  const selected = selectedId ? items.find((r) => r.id === selectedId) : undefined

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dispatch board</h1>
          <p className="text-sm text-slate mt-1">
            Live queue — refreshes every 5 seconds
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate">
          <RadioTower className="h-3.5 w-3.5 text-signal" />
          {columns[0].rows.length} waiting · {columns[1].rows.length} active
        </span>
      </div>

      {board.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : board.isError ? (
        <EmptyState
          icon={<RadioTower className="h-6 w-6 text-slate" />}
          title="Could not load board"
          description="Try refreshing the page."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 items-start">
          {columns.map((col) => (
            <section
              key={col.title}
              aria-label={`${col.title} requests`}
              className="flex flex-col min-w-0"
            >
              <div className="sticky top-14 z-20 flex items-center justify-between bg-gauze py-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} aria-hidden />
                  {col.title} ({col.rows.length})
                </h2>
              </div>
              <div className="mt-1 max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto pr-1">
                {col.rows.length === 0 ? (
                  <Card className="p-4 border border-dashed border-hairline">
                    <p className="text-sm text-slate text-center">Empty</p>
                  </Card>
                ) : (
                  col.rows.map((r) => (
                    <RequestRow
                      key={r.id}
                      request={r}
                      now={now}
                      pulsing={r.id === pulseId}
                      onClick={() => setSelectedId(r.id)}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <RequestDetailSheet
          request={selected}
          onClose={() => setSelectedId(null)}
          onAction={pulseRow}
        />
      )}
    </div>
  )
}
