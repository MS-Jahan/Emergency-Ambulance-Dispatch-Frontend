'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Siren,
  SquareStack,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuickActionButton } from '@/components/quick-action-button'
import { RequestCard } from '@/components/request-card'
import { EmptyState } from '@/components/shared/empty-state'
import { StatCard } from '@/components/shared/stat-card'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useMyRequests } from '@/lib/hooks'
import type { RequestStatus } from '@/types/api'

const ACTIVE_STATUSES: RequestStatus[] = [
  'PENDING',
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All requests' },
  { value: 'ACTIVE', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function PatientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') ?? 'ALL'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = 10

  const { data, isLoading, isError, error } = useMyRequests(page, limit)
  const allRequests = data?.items ?? []

  const total = data?.meta.total ?? allRequests.length
  const totalPages = data?.meta.totalPages ?? Math.max(1, Math.ceil(total / limit))

  const completed = allRequests.filter((r) => r.status === 'COMPLETED').length
  const active = allRequests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length
  const cancelled = allRequests.filter((r) => r.status === 'CANCELLED').length

  const filteredRequests = allRequests.filter((r) => {
    if (statusFilter === 'ACTIVE') return ACTIVE_STATUSES.includes(r.status)
    if (statusFilter === 'COMPLETED') return r.status === 'COMPLETED'
    if (statusFilter === 'CANCELLED') return r.status === 'CANCELLED'
    return true
  })

  const setStatus = (val: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('page', '1')
    if (!val || val === 'ALL') {
      sp.delete('status')
    } else {
      sp.set('status', val)
    }
    router.push(`/dashboard?${sp.toString()}`)
  }

  const setPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('page', String(p))
    router.push(`/dashboard?${sp.toString()}`)
  }

  const startRequest = () => router.push('/dashboard/requests/new')

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-0 rounded-xl bg-gradient-to-br from-oxygen to-ink p-8 text-paper sm:p-10">
        <div className="max-w-xl space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            You&apos;re safe. We&apos;re here 24/7.
          </h1>
          <p className="text-paper/80">
            Request an ambulance in seconds. Track it live until you arrive.
          </p>
          <div className="pt-2 sm:max-w-sm">
            <QuickActionButton
              label="Request now"
              icon={<Siren className="h-5 w-5" aria-hidden />}
              onClick={startRequest}
            />
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={total}
          icon={<SquareStack className="h-4 w-4" aria-hidden />}
          accent="ink"
        />
        <StatCard
          label="Completed trips"
          value={completed}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          accent="oxygen"
        />
        <StatCard
          label="In progress"
          value={active}
          icon={<Loader2 className="h-4 w-4" aria-hidden />}
          accent="amber"
        />
        <StatCard
          label="Cancelled"
          value={cancelled}
          icon={<XCircle className="h-4 w-4" aria-hidden />}
          accent="signal"
        />
      </div>

      {/* Recent requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-ink">My requests</h2>
          <Select value={statusFilter} onValueChange={setStatus}>
            <SelectTrigger className="w-40 bg-paper border-hairline text-ink" aria-label="Filter status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && <ListSkeleton rows={5} />}

        {isError && (
          <EmptyState
            icon="⚠️"
            title="Could not load requests"
            description={error instanceof Error ? error.message : 'Please try again.'}
          />
        )}

        {!isLoading && !isError && filteredRequests.length === 0 && (
          <EmptyState
            icon="🚑"
            title={statusFilter === 'ALL' ? 'No requests yet' : 'No matching requests'}
            description={
              statusFilter === 'ALL'
                ? 'When you need an ambulance, start a request and track it live.'
                : 'Try changing the status filter above.'
            }
            action={
              statusFilter === 'ALL' ? (
                <button
                  type="button"
                  onClick={startRequest}
                  className="inline-flex h-12 items-center rounded-lg border border-ink px-6 font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  Request ambulance
                </button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !isError && filteredRequests.length > 0 && (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onClick={() => router.push(`/dashboard/requests/${request.id}`)}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-hairline pt-4 text-sm text-slate">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="border-hairline text-ink"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="border-hairline text-ink"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default function PatientDashboardPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={6} />}>
      <PatientDashboardContent />
    </Suspense>
  )
}
