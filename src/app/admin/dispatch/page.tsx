'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambulance, Loader2, RadioTower } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import {
  useAdminRequests,
  useAssignAmbulance,
  useNearbyAmbulances,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { EmergencyRequest } from '@/types/api'

const ACTIVE: EmergencyRequest['status'][] = [
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
]

function AssignDialog({
  request,
  onClose,
}: {
  request: EmergencyRequest
  onClose: () => void
}) {
  const nearby = useNearbyAmbulances(
    { lat: request.pickupLat, lng: request.pickupLng, radiusKm: 10 },
    { enabled: !!request.pickupLat && !!request.pickupLng },
  )
  const assign = useAssignAmbulance()
  const [ambulanceId, setAmbulanceId] = useState<string | null>(null)

  const confirm = async () => {
    if (!ambulanceId) return
    try {
      await assign.mutateAsync({ requestId: request.id, ambulanceId })
      toast.success('Ambulance assigned')
      onClose()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Assign failed')
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign ambulance</DialogTitle>
          <DialogDescription>
            Available units within 10 km of {request.pickupAddress || 'pickup'}
          </DialogDescription>
        </DialogHeader>

        {nearby.isLoading ? (
          <CardSkeleton />
        ) : (nearby.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Ambulance className="h-6 w-6 text-slate" />}
            title="No units nearby"
            description="No available ambulances within 10 km. Widen coverage or wait."
          />
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {nearby.data!.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setAmbulanceId(a.id)}
                  className={`w-full flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                    ambulanceId === a.id
                      ? 'border-oxygen bg-oxygen/5'
                      : 'border-hairline hover:bg-gauze/50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-ink">
                      {a.type} · {a.plateNumber}
                    </span>
                    <span className="block text-xs text-slate">
                      {a.homeHospital?.name ?? 'Base'} — {a.distanceKm} km away
                    </span>
                  </span>
                  <span
                    className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                      ambulanceId === a.id
                        ? 'border-oxygen bg-oxygen'
                        : 'border-slate/40'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={!ambulanceId || assign.isPending}
            className="bg-ink text-paper hover:bg-slate-800"
          >
            {assign.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RequestCard({
  r,
  onAssign,
}: {
  r: EmergencyRequest
  onAssign: (r: EmergencyRequest) => void
}) {
  return (
    <Card className="p-3 border border-hairline space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={r.status} />
          <PriorityBadge priority={r.priority} />
        </div>
        <Link
          href={`/dashboard/requests/${r.id}`}
          className="text-xs font-medium text-oxygen hover:underline"
        >
          Details →
        </Link>
      </div>
      <p className="text-sm text-ink truncate">{r.pickupAddress || 'Pickup'}</p>
      <p className="text-xs text-slate">
        {new Date(r.requestedAt).toLocaleTimeString()}
      </p>
      {r.status === 'PENDING' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full border-oxygen text-oxygen hover:bg-oxygen hover:text-white"
          onClick={() => onAssign(r)}
        >
          Assign
        </Button>
      )}
    </Card>
  )
}

export default function DispatchBoardPage() {
  const board = useAdminRequests(1, 100, undefined, { refetchInterval: 5000 })
  const [assigning, setAssigning] = useState<EmergencyRequest | null>(null)

  const items = board.data?.items ?? []
  const pending = items.filter((r) => r.status === 'PENDING')
  const active = items.filter((r) => ACTIVE.includes(r.status))
  const closed = items.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED',
  )

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
          {pending.length} waiting · {active.length} active
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
          {(
            [
              ['Waiting', pending, 'amber'],
              ['On the road', active, 'oxygen'],
              ['Closed', closed, 'gauze'],
            ] as const
          ).map(([title, rows]) => (
            <section key={title} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate">
                  {title}
                </h2>
                <span className="text-xs text-slate tabular-nums">
                  {rows.length}
                </span>
              </div>
              {rows.length === 0 ? (
                <Card className="p-4 border border-dashed border-hairline">
                  <p className="text-sm text-slate text-center">Empty</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {rows.map((r) => (
                    <RequestCard key={r.id} r={r} onAssign={setAssigning} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {assigning && (
        <AssignDialog request={assigning} onClose={() => setAssigning(null)} />
      )}
    </div>
  )
}
