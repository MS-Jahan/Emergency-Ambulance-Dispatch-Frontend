'use client'

import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Loader2,
  Siren,
  SquareStack,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
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

export default function PatientDashboardPage() {
  const router = useRouter()
  const { data, isLoading, isError, error } = useMyRequests(1, 20)
  const requests = data?.items ?? []

  const total = data?.meta.total ?? requests.length
  const completed = requests.filter((r) => r.status === 'COMPLETED').length
  const active = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length
  const cancelled = requests.filter((r) => r.status === 'CANCELLED').length

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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Recent requests</h2>
        </div>

        {isLoading && <ListSkeleton rows={5} />}

        {isError && (
          <EmptyState
            icon="⚠️"
            title="Could not load requests"
            description={error instanceof Error ? error.message : 'Please try again.'}
          />
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <EmptyState
            icon="🚑"
            title="No requests yet"
            description="When you need an ambulance, start a request and track it live."
            action={
              <button
                type="button"
                onClick={startRequest}
                className="inline-flex h-12 items-center rounded-lg border border-ink px-6 font-medium text-ink transition-colors hover:bg-ink/5"
              >
                Request ambulance
              </button>
            }
          />
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onClick={() => router.push(`/dashboard/requests/${request.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
