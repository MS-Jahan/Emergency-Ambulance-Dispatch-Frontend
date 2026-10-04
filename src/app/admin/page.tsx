'use client'

import Link from 'next/link'
import {
  Ambulance,
  ArrowRight,
  Banknote,
  ClipboardList,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusDonut, StatusDonutCard } from '@/components/shared/status-donut'
import { RequestsAreaChart } from '@/components/admin/requests-area-chart'
import { StatGridSkeleton, ListSkeleton } from '@/components/shared/skeletons'
import { useAdminRequests, useDashboardStats } from '@/lib/hooks'

export default function AdminDashboardPage() {
  const stats = useDashboardStats()
  const pending = useAdminRequests(1, 5, { status: 'PENDING' })
  const recent = useAdminRequests(1, 200)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">Overview</h1>
          <p className="text-sm text-slate mt-1">
            Live fleet and request activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/admin/resources" />}
            variant="outline"
            className="border-hairline text-ink"
          >
            Resources
          </Button>
          <Button
            render={<Link href="/admin/dispatch" />}
            className="bg-signal text-white hover:bg-signal/90"
          >
            Dispatch board <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {stats.isLoading ? (
        <StatGridSkeleton />
      ) : stats.data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Patients"
            value={stats.data.users.patients}
            hint={`${stats.data.users.drivers} drivers`}
            icon={<Users className="h-5 w-5" />}
            accent="ink"
          />
          <StatCard
            label="Ambulances available"
            value={stats.data.ambulances.available}
            hint={`of ${stats.data.ambulances.total} total`}
            icon={<Ambulance className="h-5 w-5" />}
            accent="oxygen"
          />
          <StatCard
            label="Pending requests"
            value={stats.data.requests.pending}
            hint={`${stats.data.requests.total} all time`}
            icon={<ClipboardList className="h-5 w-5" />}
            accent="signal"
          />
          <StatCard
            label="Revenue collected"
            value={`৳${stats.data.revenue.paidTotal.toLocaleString()}`}
            hint={`${stats.data.requests.completed} trips completed`}
            icon={<Banknote className="h-5 w-5" />}
            accent="amber"
          />
        </div>
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
                  color: '#E9A21B',
                },
                {
                  label: 'In progress',
                  value: Math.max(
                    0,
                    stats.data.requests.total -
                      stats.data.requests.pending -
                      stats.data.requests.completed -
                      stats.data.requests.cancelled,
                  ),
                  color: '#14B8A6',
                },
                {
                  label: 'Completed',
                  value: stats.data.requests.completed,
                  color: '#0E8C86',
                },
                {
                  label: 'Cancelled',
                  value: stats.data.requests.cancelled,
                  color: '#E0312B',
                },
              ]}
            />
          ) : (
            <div className="h-36 w-36 rounded-full bg-gauze animate-pulse" />
          )}
        </StatusDonutCard>
      </div>

      <Card className="p-5 border border-hairline">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink">
            Waiting for dispatch
          </p>
          <Link
            href="/admin/dispatch"
            className="text-xs font-medium text-oxygen hover:underline"
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-hairline p-3 hover:bg-gauze/50 transition-colors"
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
