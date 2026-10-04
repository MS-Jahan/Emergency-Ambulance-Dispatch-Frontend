'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Navigation, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { CardSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import {
  useMyAssignedRequests,
  useMyDriverProfile,
  useUpdateDriverLocation,
  useUpdateDriverStatus,
  useUpdateRequestStatus,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { RequestStatus } from '@/types/api'

const LOCATION_INTERVAL_MS = 10_000

// Next trip status each current status moves to.
const NEXT_STATUS: Partial<Record<RequestStatus, RequestStatus>> = {
  ASSIGNED: 'EN_ROUTE_PICKUP',
  EN_ROUTE_PICKUP: 'PICKED_UP',
  PICKED_UP: 'EN_ROUTE_HOSPITAL',
  EN_ROUTE_HOSPITAL: 'COMPLETED',
}

const NEXT_LABEL: Partial<Record<RequestStatus, string>> = {
  ASSIGNED: 'Start heading to pickup',
  EN_ROUTE_PICKUP: 'Patient picked up',
  PICKED_UP: 'Head to hospital',
  EN_ROUTE_HOSPITAL: 'Complete trip',
}

const STATUS_TONE: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ON_TRIP: 'bg-blue-100 text-blue-800 border-blue-200',
  OFFLINE: 'bg-gauze text-slate border-hairline',
}

function ActiveTripCard() {
  const assigned = useMyAssignedRequests(1, 20)
  const updateStatus = useUpdateRequestStatus()

  const active = assigned.data?.items.find(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED',
  )

  if (assigned.isLoading) return <CardSkeleton />
  if (!active) {
    return (
      <Card className="p-5 border border-dashed border-hairline">
        <p className="text-sm text-slate">
          No active trip. New assignments appear here automatically.
        </p>
      </Card>
    )
  }

  const next = NEXT_STATUS[active.status]

  const advance = async () => {
    if (!next) return
    try {
      await updateStatus.mutateAsync({ id: active.id, status: next })
      toast.success(`Trip marked ${next.replaceAll('_', ' ').toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update trip')
    }
  }

  return (
    <Card className="p-5 border border-hairline space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StatusBadge status={active.status} />
          <PriorityBadge priority={active.priority} />
        </div>
        <Link
          href={`/dashboard/requests/${active.id}`}
          className="text-xs font-medium text-oxygen hover:underline"
        >
          Details →
        </Link>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">
          {active.pickupAddress || 'Pickup'}
        </p>
        {active.destinationHospital && (
          <p className="text-sm text-slate mt-0.5">
            → {active.destinationHospital.name}
          </p>
        )}
      </div>
      {next && (
        <Button
          onClick={advance}
          disabled={updateStatus.isPending}
          className="w-full bg-signal text-white hover:bg-signal/90"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {updateStatus.isPending
            ? 'Updating...'
            : NEXT_LABEL[active.status] ?? 'Advance trip'}
        </Button>
      )}
    </Card>
  )
}

export default function DriverPage() {
  const profile = useMyDriverProfile()
  const updateStatus = useUpdateDriverStatus()
  const updateLocation = useUpdateDriverLocation()
  const [gpsError, setGpsError] = useState<string | null>(null)
  const lastSent = useRef(0)

  const status = profile.data?.status
  const onDuty = status !== 'OFFLINE' && status !== undefined

  // Stream GPS while on duty; throttle network writes to 10s.
  useEffect(() => {
    if (!onDuty || !navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null)
        const now = Date.now()
        if (now - lastSent.current < LOCATION_INTERVAL_MS) return
        lastSent.current = now
        updateLocation.mutate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => setGpsError('Location unavailable — enable GPS to be dispatched'),
      { enableHighAccuracy: true, maximumAge: 5000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDuty])

  const toggleDuty = async () => {
    if (!status) return
    const target = status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE'
    try {
      await updateStatus.mutateAsync(target)
      toast.success(target === 'AVAILABLE' ? 'You are on duty' : 'You are offline')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not change duty')
    }
  }

  if (profile.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<Power className="h-6 w-6 text-slate" />}
          title="No driver profile"
          description="This account has no driver profile assigned. Contact dispatch."
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Duty header */}
      <Card className="p-5 border border-hairline">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-ink">
              {profile.data.user.name}
            </p>
            <p className="text-xs text-slate">
              {profile.data.ambulance
                ? `${profile.data.ambulance.type} · ${profile.data.ambulance.plateNumber}`
                : 'No ambulance assigned'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_TONE[status ?? 'OFFLINE']}`}
            >
              {(status ?? 'OFFLINE').replaceAll('_', ' ').toLowerCase()}
            </span>
            <Button
              onClick={toggleDuty}
              disabled={updateStatus.isPending || status === 'ON_TRIP'}
              variant={onDuty ? 'outline' : 'default'}
              className={
                onDuty
                  ? 'border-red-200 text-signal hover:bg-red-50'
                  : 'bg-ink text-paper hover:bg-slate-800'
              }
            >
              <Power className="h-4 w-4 mr-2" />
              {status === 'ON_TRIP'
                ? 'On trip'
                : onDuty
                  ? 'Go offline'
                  : 'Go on duty'}
            </Button>
          </div>
        </div>
        {onDuty && (
          <>
            <Separator className="my-4 bg-hairline" />
            <div className="flex items-center gap-2 text-xs text-slate">
              <MapPin className="h-3.5 w-3.5 text-oxygen" />
              {gpsError
                ? gpsError
                : 'Sharing location with dispatch every 10 seconds'}
            </div>
          </>
        )}
      </Card>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate mb-2">
          Active trip
        </h2>
        <ActiveTripCard />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate mb-2">
          Recent assignments
        </h2>
        <AssignedList />
      </div>
    </div>
  )
}

function AssignedList() {
  const assigned = useMyAssignedRequests(1, 20)
  const past = assigned.data?.items.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED',
  )

  if (assigned.isLoading) return <CardSkeleton />
  if (!past?.length) {
    return (
      <Card className="p-4 border border-dashed border-hairline">
        <p className="text-sm text-slate">No past trips yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {past.slice(0, 5).map((r) => (
        <Link key={r.id} href={`/dashboard/requests/${r.id}`} className="block">
          <Card className="p-3 border border-hairline hover:bg-gauze/50 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">
                  {r.pickupAddress || 'Pickup'}
                </p>
                <p className="text-xs text-slate">
                  {r.completedAt
                    ? new Date(r.completedAt).toLocaleString()
                    : new Date(r.requestedAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
