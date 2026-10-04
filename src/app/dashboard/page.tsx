'use client'

import Link from 'next/link'
import { Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useMyRequests } from '@/lib/hooks'
import type { EmergencyRequest } from '@/types/api'

function RequestRow({ request }: { request: EmergencyRequest }) {
  return (
    <Link href={`/dashboard/requests/${request.id}`} className="block">
      <Card className="p-4 border border-hairline hover:border-ink/30 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink truncate">
              {request.pickupAddress}
            </p>
            <p className="text-xs text-slate mt-1">
              {new Date(request.requestedAt).toLocaleString()}
              {request.destinationHospital &&
                ` · → ${request.destinationHospital.name}`}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function PatientDashboardPage() {
  const { data, isLoading, isError, error } = useMyRequests(1, 20)
  const requests = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My requests</h1>
          <p className="text-sm text-slate mt-1">
            Track your ambulance requests in real time
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/requests/new" />}
          className="bg-signal text-white hover:bg-signal/90 hidden sm:inline-flex"
        >
          <Siren className="w-4 h-4 mr-2" />
          Request ambulance
        </Button>
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
            <Button
              render={<Link href="/dashboard/requests/new" />}
              className="bg-signal text-white hover:bg-signal/90"
            >
              Request ambulance
            </Button>
          }
        />
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </div>
      )}

      {/* Mobile floating action */}
      <div className="sm:hidden">
        <Button
          render={<Link href="/dashboard/requests/new" />}
          className="w-full bg-signal text-white hover:bg-signal/90 h-12 text-base"
        >
          <Siren className="w-5 h-5 mr-2" />
          Request ambulance
        </Button>
      </div>
    </div>
  )
}
