'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Flame,
  Search,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import {
  useAdminRequests,
  useAuditLogs,
  useDashboardStats,
} from '@/lib/hooks'

function ReportsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const statusFilter = searchParams.get('status') ?? 'ALL'

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: requestsData, isLoading: reqLoading } = useAdminRequests(1, 100)

  const requests = useMemo(() => requestsData?.items ?? [], [requestsData?.items])

  const setQuery = (val: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (val.trim()) {
      sp.set('q', val)
    } else {
      sp.delete('q')
    }
    router.push(`/admin/reports?${sp.toString()}`)
  }

  const setStatus = (val: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (!val || val === 'ALL') {
      sp.delete('status')
    } else {
      sp.set('status', val)
    }
    router.push(`/admin/reports?${sp.toString()}`)
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
      if (q.trim()) {
        const query = q.toLowerCase()
        const matchId = r.id.toLowerCase().includes(query)
        const matchAddress = r.pickupAddress.toLowerCase().includes(query)
        const matchHospital =
          r.destinationHospital?.name.toLowerCase().includes(query) ?? false
        if (!matchId && !matchAddress && !matchHospital) return false
      }
      return true
    })
  }, [requests, statusFilter, q])

  // Priorities breakdown
  const priorityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, NORMAL: 0 }
    for (const r of requests) {
      if (r.priority in counts) {
        counts[r.priority as keyof typeof counts] += 1
      }
    }
    return counts
  }, [requests])

  const exportCsv = () => {
    const headers = [
      'Incident ID',
      'Priority',
      'Status',
      'Pickup Address',
      'Destination Hospital',
      'Requested At',
      'Completed At',
    ]
    const rows = filteredRequests.map((r) => [
      `"${r.id}"`,
      `"${r.priority}"`,
      `"${r.status}"`,
      `"${r.pickupAddress.replace(/"/g, '""')}"`,
      `"${(r.destinationHospital?.name ?? 'Unassigned').replace(/"/g, '""')}"`,
      `"${r.requestedAt}"`,
      `"${r.completedAt ?? ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `rapidaid-incident-report-${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (statsLoading || reqLoading) {
    return <ListSkeleton rows={5} />
  }

  const totalReqs = stats?.requests.total ?? requests.length
  const completedReqs = stats?.requests.completed ?? 0
  const cancelledReqs = stats?.requests.cancelled ?? 0
  const completionRate =
    totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0
  const cancellationRate =
    totalReqs > 0 ? Math.round((cancelledReqs / totalReqs) * 100) : 0

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gap-1 border-hairline bg-paper p-5">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Total incidents</span>
            <Activity className="h-4 w-4 text-brand" />
          </div>
          <p className="font-heading text-3xl text-ink tabular-nums">
            {totalReqs}
          </p>
          <p className="text-xs text-slate">All requests on record</p>
        </Card>

        <Card className="gap-1 border-hairline bg-paper p-5">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Completion rate</span>
            <CheckCircle2 className="h-4 w-4 text-oxygen" />
          </div>
          <p className="font-heading text-3xl text-ink tabular-nums">
            {completionRate}%
          </p>
          <p className="text-xs text-slate">
            {completedReqs} completed trips
          </p>
        </Card>

        <Card className="gap-1 border-hairline bg-paper p-5">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Cancellation rate</span>
            <XCircle className="h-4 w-4 text-slate" />
          </div>
          <p className="font-heading text-3xl text-ink tabular-nums">
            {cancellationRate}%
          </p>
          <p className="text-xs text-slate">
            {cancelledReqs} cancelled
          </p>
        </Card>

        <Card className="gap-1 border-hairline bg-paper p-5">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Fleet available</span>
            <Ambulance className="h-4 w-4 text-oxygen" />
          </div>
          <p className="font-heading text-3xl text-ink tabular-nums">
            {stats?.ambulances.available ?? 0} / {stats?.ambulances.total ?? 0}
          </p>
          <p className="text-xs text-slate">Units ready to dispatch</p>
        </Card>
      </div>

      {/* Priority Distribution */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-1 border-l-4 border-l-signal border-hairline bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-signal uppercase tracking-wider">
              Critical
            </span>
            <Flame className="h-4 w-4 text-signal" />
          </div>
          <p className="font-heading text-2xl text-ink tabular-nums">
            {priorityCounts.CRITICAL} {priorityCounts.CRITICAL === 1 ? 'incident' : 'incidents'}
          </p>
          <p className="text-xs text-slate">Life-threatening</p>
        </Card>

        <Card className="gap-1 border-l-4 border-l-amber border-hairline bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              High
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          </div>
          <p className="font-heading text-2xl text-ink tabular-nums">
            {priorityCounts.HIGH} {priorityCounts.HIGH === 1 ? 'incident' : 'incidents'}
          </p>
          <p className="text-xs text-slate">Urgent</p>
        </Card>

        <Card className="gap-1 border-l-4 border-l-oxygen border-hairline bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-oxygen uppercase tracking-wider">
              Normal
            </span>
            <Clock className="h-4 w-4 text-oxygen" />
          </div>
          <p className="font-heading text-2xl text-ink tabular-nums">
            {priorityCounts.NORMAL} {priorityCounts.NORMAL === 1 ? 'incident' : 'incidents'}
          </p>
          <p className="text-xs text-slate">Standard</p>
        </Card>
      </div>

      {/* Incident Log & Export */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl">
              Incident registry
            </h2>
            <p className="text-xs text-slate">
              Filtered records ({filteredRequests.length} of {requests.length})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
                aria-hidden
              />
              <Input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ID, pickup, hospital"
                className="h-10 bg-paper border-hairline text-ink pl-9 text-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-40 h-10 bg-paper border-hairline text-ink text-sm">
                <SelectValue placeholder="Status">
                  {statusFilter === 'ALL'
                    ? 'All statuses'
                    : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase().replaceAll('_', ' ')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="EN_ROUTE_PICKUP">En Route Pickup</SelectItem>
                <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                <SelectItem value="EN_ROUTE_HOSPITAL">En Route Hospital</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={exportCsv}
              size="sm"
              variant="outline"
              disabled={filteredRequests.length === 0}
              className="h-10 gap-1.5 border-hairline px-4 text-ink hover:bg-muted"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="h-6 w-6 text-slate" />}
            title="No matching reports"
            description="Adjust your search query or status filter to see incident entries."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="bg-gauze border-b border-hairline text-xs uppercase tracking-wide text-slate font-semibold">
                <tr>
                  <th className="py-3 px-4">Incident</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pickup</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-ink">
                      #{req.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate">
                      {req.pickupAddress}
                    </td>
                    <td className="py-3 px-4 text-ink">
                      {req.destinationHospital?.name ?? (
                        <span className="text-slate italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate tabular-nums whitespace-nowrap">
                      {new Date(req.requestedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1>Reports</h1>
          <p className="mt-1 text-sm text-slate">
            Incident volume, outcomes and exportable records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/admin/dispatch" />}
            className="h-10 px-5"
          >
            Dispatch board
          </Button>
        </div>
      </div>

      <Suspense fallback={<ListSkeleton rows={5} />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}
