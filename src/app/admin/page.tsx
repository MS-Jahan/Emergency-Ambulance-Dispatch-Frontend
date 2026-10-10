'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusDonut, StatusDonutCard } from '@/components/shared/status-donut'
import { RequestsAreaChart } from '@/components/admin/requests-area-chart'
import { StatGridSkeleton, ListSkeleton } from '@/components/shared/skeletons'
import { useAdminRequests, useDashboardStats } from '@/lib/hooks'
import { cn } from '@/lib/utils'

function KpiTile({
  label,
  value,
  tone = 'ink',
}: {
  label: string
  value: string | number
  tone?: 'ink' | 'amber' | 'oxygen' | 'slate'
}) {
  const toneClass = {
    ink: 'text-ink',
    amber: 'text-amber-700 dark:text-amber-300',
    oxygen: 'text-oxygen dark:text-emerald-400',
    slate: 'text-slate',
  }[tone]
  return (
    <Card className="gap-1 border border-hairline p-5">
      <p className={cn('font-heading text-4xl leading-none tabular-nums', toneClass)}>
        {value}
      </p>
      <p className="text-sm text-slate">{label}</p>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const stats = useDashboardStats()
  const pending = useAdminRequests(1, 5, { status: 'PENDING' })
  const recent = useAdminRequests(1, 100)
  const inProgress = stats.data
    ? Math.max(
        0,
        stats.data.requests.total -
          stats.data.requests.pending -
          stats.data.requests.completed -
          stats.data.requests.cancelled,
      )
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Overview</h1>
          <p className="mt-1 text-sm text-slate">
            Live fleet and request activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/admin/resources" />}
            variant="outline"
            className="h-10 border-hairline px-5 text-ink"
          >
            Resources
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/dispatch" />}
            className="h-10 px-5"
          >
            Dispatch board <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {stats.data && stats.data.requests.pending > 0 && (
        <Link
          href="/admin/dispatch"
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-amber px-5 py-3 font-bold text-white hover:bg-amber/90"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          {stats.data.requests.pending} request
          {stats.data.requests.pending === 1 ? '' : 's'} waiting for dispatch
        </Link>
      )}

      {stats.isLoading ? (
        <StatGridSkeleton />
      ) : stats.data ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <KpiTile label="Total" value={stats.data.requests.total} />
            <KpiTile label="Pending" value={stats.data.requests.pending} tone="amber" />
            <KpiTile label="Active" value={inProgress} />
            <KpiTile label="Completed" value={stats.data.requests.completed} tone="oxygen" />
            <KpiTile label="Cancelled" value={stats.data.requests.cancelled} tone="slate" />
            <KpiTile
              label={`Ambulances free of ${stats.data.ambulances.total}`}
              value={stats.data.ambulances.available}
              tone="oxygen"
            />
          </div>
          <p className="text-sm text-slate">
            Revenue collected{' '}
            <span className="font-semibold text-ink">
              ${stats.data.revenue.paidTotal.toLocaleString()}
            </span>{' '}
            · {stats.data.users.patients} patients · {stats.data.users.drivers} drivers
          </p>
        </>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RequestsAreaChart items={recent.data?.items ?? []} />
        </div>
        <StatusDonutCard>
          {stats.data ? (
            <StatusDonut
              centerLabel="All requests"
              slices={[
                {
                  label: 'Pending',
                  value: stats.data.requests.pending,
                  color: 'var(--amber)',
                },
                {
                  label: 'In progress',
                  value: inProgress,
                  color: 'var(--slate)',
                },
                {
                  label: 'Completed',
                  value: stats.data.requests.completed,
                  color: 'var(--oxygen)',
                },
                {
                  label: 'Cancelled',
                  value: stats.data.requests.cancelled,
                  color: 'var(--hairline)',
                },
              ]}
            />
          ) : (
            <div className="h-36 w-36 rounded-full bg-gauze animate-pulse" />
          )}
        </StatusDonutCard>
      </div>

      <Card className="border border-hairline p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl">Waiting for dispatch</h2>
          <Link
            href="/admin/dispatch"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Open board →
          </Link>
        </div>
        {pending.isLoading ? (
          <ListSkeleton rows={3} />
        ) : (pending.data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-slate py-6 text-center">
            Nothing pending. Queue is clear.
          </p>
        ) : (
          <ul className="space-y-2">
            {pending.data!.items.map((r) => (
              <li key={r.id}>
                <Link
                  href="/admin/dispatch"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-gauze p-3 hover:border-brand/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">
                      {r.patient?.name ?? 'Patient'}
                    </p>
                    <p className="text-xs text-slate truncate">
                      {r.pickupAddress || 'Pickup location'} ·{' '}
                      {new Date(r.requestedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={r.priority} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
