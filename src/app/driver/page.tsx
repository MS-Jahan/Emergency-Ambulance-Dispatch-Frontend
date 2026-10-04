'use client'

import { useEffect, useRef, useState } from 'react'
import { Power, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MotionCard } from '@/components/motion-card'
import { DriverActionButton } from '@/components/driver-action-button'
import { DriverStatusToggle } from '@/components/driver-status-toggle'
import { TripCard } from '@/components/trip-card'
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

function minutesSince(ts: number, now: number): string {
  const mins = Math.max(0, Math.floor((now - ts) / 60000))
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  return `${mins} min ago`
}

export default function DriverPage() {
  const profile = useMyDriverProfile()
  const assigned = useMyAssignedRequests(1, 20)
  const updateStatus = useUpdateDriverStatus()
  const updateLocation = useUpdateDriverLocation()
  const updateTripStatus = useUpdateRequestStatus()

  const [gpsError, setGpsError] = useState<string | null>(null)
  const lastSent = useRef(0)
  // Clock + "last status change" live in state so renders stay pure;
  // the interval re-renders to keep "X min ago" honest.
  const [now, setNow] = useState(() => Date.now())
  const [statusChangedAt, setStatusChangedAt] = useState(() => Date.now())
  const lastStatus = useRef<string | undefined>(undefined)

  const status = profile.data?.status
  const onDuty = status !== 'OFFLINE' && status !== undefined

  useEffect(() => {
    if (lastStatus.current !== status) {
      lastStatus.current = status
      setStatusChangedAt(Date.now())
    }
  }, [status])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

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

  const toggleDuty = async (online: boolean) => {
    if (!status) return
    const target = online ? 'AVAILABLE' : 'OFFLINE'
    try {
      await updateStatus.mutateAsync(target)
      toast.success(online ? 'You are on duty' : 'You are offline')
      setStatusChangedAt(Date.now())
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not change duty')
    }
  }

  if (profile.isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={<Power className="h-6 w-6 text-slate" />}
          title="No driver profile"
          description="This account has no driver profile assigned. Contact dispatch."
        />
      </div>
    )
  }

  const items = assigned.data?.items ?? []
  const active = items.find(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED',
  )
  const past = items
    .filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED')
    .filter((r) => {
      // "Today" only: same local calendar day as now.
      const day = new Date(r.completedAt ?? r.requestedAt).toDateString()
      return day === new Date().toDateString()
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.requestedAt).getTime() -
        new Date(a.completedAt ?? a.requestedAt).getTime(),
    )

  const advance = async () => {
    if (!active) return
    const next = NEXT_STATUS[active.status]
    if (!next) return
    try {
      await updateTripStatus.mutateAsync({ id: active.id, status: next })
      toast.success(`Trip marked ${next.replaceAll('_', ' ').toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update trip')
    }
  }

  const navigateToPickup = () => {
    if (!active) return
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${active.pickupLat},${active.pickupLng}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const callPatient = () => {
    if (!active?.patient?.phone) return
    window.location.assign(`tel:${active.patient.phone}`)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      {/* Duty toggle — top center */}
      <DriverStatusToggle
        status={status ?? 'OFFLINE'}
        onChange={toggleDuty}
        loading={updateStatus.isPending}
        subtext={
          onDuty && !gpsError
            ? `Last updated: ${minutesSince(statusChangedAt, now)} · sharing location`
            : `Last updated: ${minutesSince(statusChangedAt, now)}`
        }
      />
      {onDuty && gpsError && (
        <p className="text-center text-xs text-signal">{gpsError}</p>
      )}

      {onDuty ? (
        assigned.isLoading ? (
          <CardSkeleton />
        ) : active ? (
          <MotionCard duration={300} className="space-y-3">
            <TripCard
              trip={active}
              isActive
              onCall={active.patient?.phone ? callPatient : undefined}
              onNavigate={navigateToPickup}
            />
            <DriverActionButton
              status={active.status}
              onClick={advance}
              loading={updateTripStatus.isPending}
            />
          </MotionCard>
        ) : (
          <Card className="flex flex-col items-center gap-3 border border-dashed border-hairline px-6 py-12 text-center">
            <span className="text-6xl" aria-hidden>
              🚗
            </span>
            <p className="text-lg font-semibold text-ink">No active trip</p>
            <p className="text-sm text-slate">
              You&apos;ll get a notification when assigned.
            </p>
            <Button
              variant="outline"
              onClick={() => assigned.refetch()}
              disabled={assigned.isRefetching}
              className="h-12 border-hairline text-ink hover:bg-gauze"
            >
              <RefreshCw
                className={`h-4 w-4 ${assigned.isRefetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </Card>
        )
      ) : (
        <Card className="flex flex-col items-center gap-3 border border-dashed border-hairline px-6 py-12 text-center">
          <span className="text-6xl" aria-hidden>
            🌙
          </span>
          <p className="text-lg font-semibold text-ink">You&apos;re Offline</p>
          <p className="text-sm text-slate">
            Toggle online to receive trips.
          </p>
          <Button
            variant="outline"
            onClick={() => assigned.refetch()}
            disabled={assigned.isRefetching}
            className="h-12 border-hairline text-ink hover:bg-gauze"
          >
            <RefreshCw
              className={`h-4 w-4 ${assigned.isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </Card>
      )}

      {/* Today's history — collapsible, out of the way until needed */}
      <details className="rounded-lg border border-hairline bg-paper px-4 py-3">
        <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
          Today&apos;s trips{' '}
          <span className="font-normal text-slate">({past.length})</span>
        </summary>
        {past.length === 0 ? (
          <p className="mt-3 text-sm text-slate">No trips completed today.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {past.slice(0, 10).map((r) => (
              <TripCard key={r.id} trip={r} />
            ))}
          </div>
        )}
      </details>

      <p className="text-center text-xs text-slate">
        {profile.data.ambulance
          ? `${profile.data.ambulance.type} · ${profile.data.ambulance.plateNumber}`
          : 'No ambulance assigned'}
      </p>
    </div>
  )
}
