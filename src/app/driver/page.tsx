'use client'

import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Phone, Power, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MotionCard } from '@/components/motion-card'
import { DriverActionButton } from '@/components/driver-action-button'
import { DriverStatusToggle } from '@/components/driver-status-toggle'
import { TripCard } from '@/components/trip-card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { cn } from '@/lib/utils'
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
import type { EmergencyRequest, RequestStatus } from '@/types/api'

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

const PHASES: { label: string; statuses: RequestStatus[] }[] = [
  { label: 'Assigned', statuses: ['ASSIGNED'] },
  { label: 'Pickup', statuses: ['EN_ROUTE_PICKUP', 'PICKED_UP'] },
  { label: 'Hospital', statuses: ['EN_ROUTE_HOSPITAL'] },
]

function PhasePills({ status }: { status: RequestStatus }) {
  const current = PHASES.findIndex((p) => p.statuses.includes(status))
  return (
    <ol className="flex gap-1.5 text-xs font-bold" aria-label="Trip progress">
      {PHASES.map((p, i) => (
        <li
          key={p.label}
          aria-current={i === current ? 'step' : undefined}
          className={cn(
            'flex-1 rounded-full px-2 py-1.5 text-center',
            i <= current
              ? 'bg-oxygen text-white'
              : 'border border-hairline bg-paper text-slate',
          )}
        >
          {p.label}
        </li>
      ))}
    </ol>
  )
}

function AssignmentCard({
  trip,
  onCall,
  onNavigate,
}: {
  trip: EmergencyRequest
  onCall?: () => void
  onNavigate: () => void
}) {
  const outline =
    'flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink text-sm font-bold text-ink transition-colors hover:bg-ink/5 disabled:opacity-50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
  return (
    <Card className="gap-3 border border-hairline p-5">
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={trip.priority} />
        <span className="text-xs font-semibold text-slate">
          Requested{' '}
          {new Date(trip.requestedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <h2 className="font-heading text-2xl font-normal leading-tight text-ink">
        {trip.patient?.name ?? 'Patient'}
      </h2>
      <p className="text-sm text-slate">
        {trip.pickupAddress || 'Pickup address on file'}
      </p>
      {trip.destinationHospital && (
        <p className="flex items-center gap-1.5 text-sm text-slate">
          <span className="h-2 w-2 shrink-0 rounded-full bg-oxygen" aria-hidden />
          <span className="truncate">To: {trip.destinationHospital.name}</span>
        </p>
      )}
      <div className="mt-1 flex gap-2.5">
        <button type="button" onClick={onCall} disabled={!onCall} className={outline}>
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </button>
        <button type="button" onClick={onNavigate} className={outline}>
          Navigate
          <ExternalLink className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </Card>
  )
}

function QuietCard({
  icon,
  title,
  text,
  refreshing,
  onRefresh,
}: {
  icon: string
  title: string
  text: string
  refreshing: boolean
  onRefresh: () => void
}) {
  return (
    <Card className="items-center gap-3 border border-dashed border-hairline px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <p className="font-heading text-xl text-ink">{title}</p>
      <p className="text-sm text-slate">{text}</p>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={refreshing}
        className="h-11 border-hairline px-5 text-ink"
      >
        <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        Refresh
      </Button>
    </Card>
  )
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
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <DriverStatusToggle
        status={status ?? 'OFFLINE'}
        onChange={toggleDuty}
        loading={updateStatus.isPending}
        subtext={
          onDuty && !gpsError
            ? `GPS sharing on · updated ${minutesSince(statusChangedAt, now)}`
            : `Updated ${minutesSince(statusChangedAt, now)}`
        }
      />
      {onDuty && gpsError && (
        <p role="alert" className="rounded-2xl bg-signal/10 px-4 py-2 text-center text-sm font-medium text-signal">
          {gpsError}
        </p>
      )}

      {onDuty ? (
        assigned.isLoading ? (
          <CardSkeleton />
        ) : active ? (
          <MotionCard duration={300} className="space-y-4">
            <AssignmentCard
              trip={active}
              onCall={active.patient?.phone ? callPatient : undefined}
              onNavigate={navigateToPickup}
            />
            <PhasePills status={active.status} />
            <DriverActionButton
              status={active.status}
              onClick={advance}
              loading={updateTripStatus.isPending}
            />
          </MotionCard>
        ) : (
          <QuietCard
            icon="🚑"
            title="No active trip"
            text="You'll get a notification when assigned."
            refreshing={assigned.isRefetching}
            onRefresh={() => assigned.refetch()}
          />
        )
      ) : (
        <QuietCard
          icon="🌙"
          title="You're offline"
          text="Toggle online to receive trips."
          refreshing={assigned.isRefetching}
          onRefresh={() => assigned.refetch()}
        />
      )}

      {/* Today's history — collapsible, out of the way until needed */}
      <details className="rounded-2xl border border-hairline bg-paper px-4 py-3">
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
