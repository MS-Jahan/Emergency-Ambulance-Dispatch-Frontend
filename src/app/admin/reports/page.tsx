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
        <Card className="p-4 border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Total Logged Incidents</span>
            <Activity className="h-4 w-4 text-ink" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
            {totalReqs}
          </p>
          <p className="text-[11px] text-slate">Across all response districts</p>
        </Card>

        <Card className="p-4 border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Successful Deliveries</span>
            <CheckCircle2 className="h-4 w-4 text-oxygen" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
            {completionRate}%
          </p>
          <p className="text-[11px] text-slate">
            {completedReqs} completed emergency trips
          </p>
        </Card>

        <Card className="p-4 border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Cancellation Rate</span>
            <XCircle className="h-4 w-4 text-signal" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
            {cancellationRate}%
          </p>
          <p className="text-[11px] text-slate">
            {cancelledReqs} withdrawn by caller/admin
          </p>
        </Card>

        <Card className="p-4 border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Fleet Availability</span>
            <Ambulance className="h-4 w-4 text-amber" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
            {stats?.ambulances.available ?? 0} / {stats?.ambulances.total ?? 0}
          </p>
          <p className="text-[11px] text-slate">Units ready for immediate dispatch</p>
        </Card>
      </div>

      {/* Priority Distribution */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-signal border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-signal uppercase tracking-wider">
              Critical
            </span>
            <Flame className="h-4 w-4 text-signal" />
          </div>
          <p className="text-xl font-bold text-ink tabular-nums">
            {priorityCounts.CRITICAL} incidents
          </p>
          <p className="text-xs text-slate">Immediate life-threat protocol</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber uppercase tracking-wider">
              High Priority
            </span>
            <AlertTriangle className="h-4 w-4 text-amber" />
          </div>
          <p className="text-xl font-bold text-ink tabular-nums">
            {priorityCounts.HIGH} incidents
          </p>
          <p className="text-xs text-slate">Urgent trauma or cardiac transport</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-oxygen border-hairline bg-paper space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-oxygen uppercase tracking-wider">
              Normal
            </span>
            <Clock className="h-4 w-4 text-oxygen" />
          </div>
          <p className="text-xl font-bold text-ink tabular-nums">
            {priorityCounts.NORMAL} incidents
          </p>
          <p className="text-xs text-slate">Standard non-acute transit</p>
        </Card>
      </div>

      {/* Incident Log & Export */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-ink">
              Incident Registry & Audit Trail
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
                className="h-9 bg-paper border-hairline text-ink pl-8 text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-36 h-9 bg-paper border-hairline text-ink text-xs">
                <SelectValue placeholder="Status" />
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
              className="h-9 border-hairline gap-1.5 text-xs text-ink hover:bg-muted"
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
          <div className="rounded-xl border border-hairline bg-paper overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gauze border-b border-hairline text-slate font-medium">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pickup Location</th>
                  <th className="py-3 px-4">Hospital Destination</th>
                  <th className="py-3 px-4">Timestamp</th>
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
                      <span className="font-semibold text-ink">
                        {req.status}
                      </span>
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
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Operational Reports & Analytics
          </h1>
          <p className="text-sm text-slate">
            System performance KPIs, incident volume breakdown, and exportable audit records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/admin/dispatch" />}
            size="sm"
            className="bg-signal text-white hover:bg-signal/90 text-xs h-9"
          >
            Live Dispatch Board
          </Button>
        </div>
      </div>

      <Suspense fallback={<ListSkeleton rows={5} />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}
