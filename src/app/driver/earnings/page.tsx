'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Banknote,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Search,
  Star,
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
import { useDriverStats, useMyAssignedRequests } from '@/lib/hooks'
import type { EmergencyRequest } from '@/types/api'

// Fares mirror TRIP_RATES in the backend (src/lib/stripe.ts), in USD. The
// backend does not model a driver payout, so this page shows the trip fare
// patients are charged, not driver income.
const TRIP_FARE_USD: Record<string, number> = { BASIC: 15, ICU: 35, CARDIAC: 60 }

function calculatePayout(req: EmergencyRequest): number {
  return req.ambulance ? (TRIP_FARE_USD[req.ambulance.type] ?? 0) : 0
}

function EarningsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const priorityFilter = searchParams.get('priority') ?? 'ALL'

  const { data, isLoading } = useMyAssignedRequests(1, 100)
  const stats = useDriverStats()
  const allRequests = useMemo(() => data?.items ?? [], [data?.items])

  const completedRequests = useMemo(
    () => allRequests.filter((r) => r.status === 'COMPLETED'),
    [allRequests],
  )

  const totalEarnings = useMemo(() => {
    return completedRequests.reduce((sum, req) => sum + calculatePayout(req), 0)
  }, [completedRequests])

  const setQuery = (newQ: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (newQ.trim()) {
      sp.set('q', newQ)
    } else {
      sp.delete('q')
    }
    router.push(`/driver/earnings?${sp.toString()}`)
  }

  const setPriority = (p: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (!p || p === 'ALL') {
      sp.delete('priority')
    } else {
      sp.set('priority', p)
    }
    router.push(`/driver/earnings?${sp.toString()}`)
  }

  const filteredTrips = useMemo(() => {
    return completedRequests.filter((req) => {
      if (priorityFilter !== 'ALL' && req.priority !== priorityFilter) {
        return false
      }
      if (q.trim()) {
        const query = q.toLowerCase()
        const matchAddress = req.pickupAddress.toLowerCase().includes(query)
        const matchHospital =
          req.destinationHospital?.name.toLowerCase().includes(query) ?? false
        const matchId = req.id.toLowerCase().includes(query)
        if (!matchAddress && !matchHospital && !matchId) return false
      }
      return true
    })
  }, [completedRequests, priorityFilter, q])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ListSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-hairline bg-paper gap-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Fares paid</span>
            <Banknote className="h-4 w-4 text-oxygen" />
          </div>
          <p className="font-heading text-3xl font-normal text-ink tabular-nums">
            ${(stats.data?.fareTotal ?? totalEarnings).toLocaleString()}
          </p>
          <p className="text-xs text-slate">Paid fares on your trips</p>
        </Card>

        <Card className="p-5 border-hairline bg-paper gap-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Completed trips</span>
            <CheckCircle2 className="h-4 w-4 text-oxygen" />
          </div>
          <p className="font-heading text-3xl font-normal text-ink tabular-nums">
            {stats.data?.completedTrips ?? completedRequests.length}
          </p>
          <p className="text-xs text-slate">
            {allRequests.length} total assigned dispatches
          </p>
        </Card>

        <Card className="p-5 border-hairline bg-paper gap-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Active trips</span>
            <Clock className="h-4 w-4 text-amber" />
          </div>
          <p className="font-heading text-3xl font-normal text-ink tabular-nums">
            {stats.data?.activeTrips ?? allRequests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length}
          </p>
          <p className="text-xs text-slate">Assigned and not yet completed</p>
        </Card>

        <Card className="p-5 border-hairline bg-paper gap-1">
          <div className="flex items-center justify-between text-slate text-xs">
            <span>Average rating</span>
            <Star className="h-4 w-4 text-amber" />
          </div>
          <p className="font-heading text-3xl font-normal text-ink tabular-nums">
            {stats.data?.averageRating != null ? stats.data.averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-slate">
            {stats.data?.ratingCount
              ? `${stats.data.ratingCount} patient rating${stats.data.ratingCount === 1 ? '' : 's'}`
              : 'No ratings yet'}
          </p>
        </Card>
      </div>

      {/* Trips list with search & filter */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <h2 className="text-xl">
            Completed trips ({filteredTrips.length})
          </h2>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:w-60">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
                aria-hidden
              />
              <Input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pickup or hospital"
                className="h-10 bg-paper border-hairline text-ink pl-9 text-sm"
              />
            </div>

            <Select value={priorityFilter} onValueChange={setPriority}>
              <SelectTrigger className="w-40 h-10 bg-paper border-hairline text-ink text-sm">
                <SelectValue placeholder="Priority">
                  {priorityFilter === 'ALL'
                    ? 'All priorities'
                    : priorityFilter.charAt(0) + priorityFilter.slice(1).toLowerCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priorities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6 text-slate" />}
            title="No completed trips found"
            description={
              completedRequests.length === 0
                ? 'Your completed trips and their fares will appear here.'
                : 'No trips match the active search or priority filter.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {filteredTrips.map((req) => {
              const payout = calculatePayout(req)
              const formattedDate = new Date(
                req.completedAt || req.requestedAt,
              ).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <li key={req.id}>
                  <Card className="p-5 border-hairline bg-paper hover:border-brand/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-ink">
                            #{req.id.slice(0, 8)}
                          </span>
                          <PriorityBadge priority={req.priority} />
                          <span className="text-xs text-slate flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-ink flex items-start gap-1.5 pt-1">
                          <MapPin className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                          <span>{req.pickupAddress}</span>
                        </p>
                        {req.destinationHospital && (
                          <p className="text-xs text-slate flex items-center gap-1.5 pl-5">
                            <Compass className="h-3 w-3 text-oxygen shrink-0" />
                            To: {req.destinationHospital.name}
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline flex sm:flex-col items-center sm:items-end justify-between">
                        <span className="text-xs text-slate">Trip fare</span>
                        <span className="font-heading text-xl text-ink tabular-nums">
                          ${payout}
                        </span>
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function DriverEarningsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl">
            Earnings
          </h1>
          <p className="text-sm text-slate">
            Completed trips and the fares charged on them.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/driver" />}
          variant="outline"
          className="h-10 border-hairline self-start sm:self-auto"
        >
          Back to duty
        </Button>
      </div>

      <Suspense fallback={<ListSkeleton rows={4} />}>
        <EarningsContent />
      </Suspense>
    </div>
  )
}
