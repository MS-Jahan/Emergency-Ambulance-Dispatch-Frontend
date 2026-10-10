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

const STATUS_COPY: Record<
  RequestStatus,
  { label: string; headline: string }
> = {
  PENDING: { label: 'Pending', headline: 'Finding the nearest ambulance' },
  ASSIGNED: { label: 'Assigned', headline: 'An ambulance has been assigned' },
  EN_ROUTE_PICKUP: { label: 'En route to pickup', headline: 'Ambulance is on its way to you' },
  PICKED_UP: { label: 'Picked up', headline: 'You are on board' },
  EN_ROUTE_HOSPITAL: { label: 'En route to hospital', headline: 'Heading to the hospital' },
  COMPLETED: { label: 'Completed', headline: 'Trip complete' },
  CANCELLED: { label: 'Cancelled', headline: 'Request cancelled' },
}

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

  const activeRequest = allRequests.find((r) => ACTIVE_STATUSES.includes(r.status))
  const activeStep = activeRequest
    ? ACTIVE_STATUSES.indexOf(activeRequest.status) + 1
    : 0

  // Page numbers: a small window around the current page.
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  )

  return (
    <div className="space-y-6">
      <h1>My requests</h1>

      {/* Active trip banner (only when a request is in progress) */}
      {activeRequest && (
        <section
          aria-label="Active trip"
          className="flex flex-col gap-4 rounded-3xl bg-brand p-6 text-brand-foreground sm:flex-row sm:items-center sm:p-7"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Active &middot; {STATUS_COPY[activeRequest.status].label}
            </p>
            <p className="font-heading text-2xl sm:text-3xl">
              {STATUS_COPY[activeRequest.status].headline}
            </p>
            <p className="mt-1 line-clamp-1 text-sm opacity-90">
              {activeRequest.pickupAddress}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-brand-foreground/30"
              role="progressbar"
              aria-label="Trip progress"
              aria-valuemin={0}
              aria-valuemax={ACTIVE_STATUSES.length}
              aria-valuenow={activeStep}
            >
              <div
                className="h-full rounded-full bg-brand-foreground"
                style={{ width: `${(activeStep / ACTIVE_STATUSES.length) * 100}%` }}
              />
            </div>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/requests/${activeRequest.id}`)}
            className="h-12 shrink-0 bg-paper px-7 text-base font-bold text-ink hover:bg-paper/90"
          >
            Open trip
          </Button>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        {/* History */}
        <section className="order-2 min-w-0 space-y-3 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-heading text-3xl font-normal">History</h2>
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-44 border-hairline text-ink" aria-label="Filter status">
                <SelectValue>
                  {(v: string) => STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v}
                </SelectValue>
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

              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="flex flex-wrap items-center gap-2 pt-2"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="size-9 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {pageNumbers.map((n, idx) => (
                    <span key={n} className="flex items-center gap-2">
                      {idx > 0 && n - pageNumbers[idx - 1] > 1 && (
                        <span className="text-slate" aria-hidden>
                          &hellip;
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant={n === page ? 'default' : 'outline'}
                        onClick={() => setPage(n)}
                        aria-label={`Page ${n}`}
                        aria-current={n === page ? 'page' : undefined}
                        className="size-9 rounded-full font-bold"
                      >
                        {n}
                      </Button>
                    </span>
                  ))}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="size-9 rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              )}
            </div>
          )}
        </section>

        {/* Side column: request button first on phones, stats last */}
        <QuickActionButton
          label="Request ambulance"
          icon={<Siren className="h-6 w-6" aria-hidden />}
          onClick={startRequest}
          className="order-1 h-16 text-xl sm:h-[72px] lg:order-none lg:col-start-2 lg:row-start-1"
        />
        <aside className="order-3 lg:order-none lg:col-start-2 lg:row-start-2">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total requests"
              value={total}
              icon={<SquareStack className="h-4 w-4" aria-hidden />}
              accent="ink"
            />
            <StatCard
              label="Completed"
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
        </aside>
      </div>
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
