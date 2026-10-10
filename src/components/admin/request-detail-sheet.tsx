'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ambulance, Loader2, MapPin, Phone, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { driverInitials } from '@/components/admin/request-row'
import {
  useAssignAmbulance,
  useCancelRequest,
  useNearbyAmbulances,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { EmergencyRequest } from '@/types/api'

const cancelSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be at least 3 characters'),
})
type CancelFormData = z.infer<typeof cancelSchema>

function CancelRequestForm({
  onCancel,
  onKeep,
  pending,
}: {
  onCancel: (reason: string) => Promise<void>
  onKeep: () => void
  pending: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: '' },
  })

  return (
    <Card className="space-y-3 p-4 border-signal/40">
      <p className="text-sm font-semibold text-signal">Cancel this request?</p>
      <form onSubmit={handleSubmit((d) => onCancel(d.reason))} className="space-y-3">
        <div>
          <Input
            placeholder="Reason (e.g. duplicate request)"
            aria-label="Cancellation reason"
            {...register('reason')}
            className="bg-paper border-hairline text-ink"
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-signal">{errors.reason.message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onKeep}
            className="border-hairline text-ink hover:bg-gauze"
          >
            Keep request
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="bg-signal text-white hover:bg-signal/90"
          >
            {pending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            Confirm cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

interface RequestDetailSheetProps {
  request: EmergencyRequest
  onClose: () => void
  /** Fired after a successful mutation — the board pulses that row. */
  onAction?: (id: string) => void
}

/**
 * Side sheet (40% desktop, full-width mobile) for dispatching one request:
 * patient info, nearby units with one-click assign, reassign, cancel.
 */
export function RequestDetailSheet({ request, onClose, onAction }: RequestDetailSheetProps) {
  const [reassigning, setReassigning] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const nearby = useNearbyAmbulances(
    { lat: request.pickupLat, lng: request.pickupLng, radiusKm: 10 },
    {
      enabled:
        !!request.pickupLat &&
        !!request.pickupLng &&
        (!request.ambulanceId || reassigning),
    },
  )
  const assign = useAssignAmbulance()
  const cancel = useCancelRequest()

  // Escape closes; page scroll locked while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const doAssign = async (ambulanceId: string) => {
    try {
      await assign.mutateAsync({ requestId: request.id, ambulanceId })
      toast.success('Ambulance assigned')
      onAction?.(request.id)
      setReassigning(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Assign failed')
    }
  }

  const doCancel = async (reasonText: string) => {
    try {
      await cancel.mutateAsync({ id: request.id, reason: reasonText })
      toast.success('Request cancelled')
      onAction?.(request.id)
      onClose()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Cancel failed')
    }
  }

  const terminal = request.status === 'COMPLETED' || request.status === 'CANCELLED'
  const showNearby = reassigning || !request.ambulanceId

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Request details">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
      />

      <div className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-hairline bg-paper shadow-xl sm:w-[40%] sm:max-w-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-slate">{request.id}</p>
            <p className="mt-1 flex items-center gap-2">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="text-slate hover:bg-gauze"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <p className="text-sm font-bold text-ink">{request.patient?.name ?? 'Patient'}</p>
            {request.patient?.phone && (
              <a
                href={`tel:${request.patient.phone}`}
                className="mt-1 flex w-fit items-center gap-1.5 text-sm text-oxygen hover:underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {request.patient.phone}
              </a>
            )}
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate">
              <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden />
              {request.pickupAddress || 'Pickup address on file'}
            </p>
          </section>

          {request.destinationHospital && (
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-slate">Hospital</p>
              <p className="mt-1 text-sm text-ink">{request.destinationHospital.name}</p>
            </section>
          )}

          {/* Assigned unit — with reassign affordance */}
          {request.ambulance && !showNearby && (
            <Card className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                  {driverInitials(request.driver?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-ink">
                    {request.ambulance.plateNumber}
                  </p>
                  <p className="truncate text-xs text-slate">
                    {request.driver?.name ?? 'Unassigned driver'} · {request.ambulance.type}
                  </p>
                </div>
              </div>
              {!terminal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReassigning(true)}
                  disabled={assign.isPending}
                  className="border-hairline text-ink hover:bg-gauze"
                >
                  Reassign
                </Button>
              )}
            </Card>
          )}

          {/* Nearby units — assign / reassign target list */}
          {showNearby && !terminal && (
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-slate">
                {reassigning ? 'Reassign to unit' : 'Nearby ambulances'}
              </p>
              {nearby.isLoading ? (
                <div className="mt-2">
                  <CardSkeleton />
                </div>
              ) : (nearby.data?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={<Ambulance className="h-6 w-6 text-slate" />}
                  title="No units nearby"
                  description="No available ambulances within 10 km of this pickup."
                />
              ) : (
                <ul className="mt-2 space-y-2">
                  {[...nearby.data!]
                    .sort((a, b) => a.distanceKm - b.distanceKm)
                    .map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-hairline p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {a.plateNumber}
                          <span className="ml-2 font-normal text-slate">{a.type}</span>
                        </p>
                        <p className="truncate text-xs text-slate">
                          {a.homeHospital?.name ?? 'Base'} — {a.distanceKm} km
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => doAssign(a.id)}
                        disabled={assign.isPending}
                        className="bg-oxygen text-paper hover:bg-oxygen/90"
                      >
                        {assign.isPending && (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        )}
                        Assign
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Cancel — inline reason form */}
          {cancelling && (
            <CancelRequestForm
              onCancel={doCancel}
              onKeep={() => setCancelling(false)}
              pending={cancel.isPending}
            />
          )}
        </div>

        {/* Footer actions */}
        {!terminal && !cancelling && (
          <div className="flex items-center justify-between gap-3 border-t border-hairline px-5 py-3">
            {request.ambulance ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReassigning((v) => !v)}
                className="border-hairline text-ink hover:bg-gauze"
              >
                {showNearby ? 'Back to unit' : 'Reassign'}
              </Button>
            ) : (
              <span className="text-xs text-slate">Awaiting assignment</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelling(true)}
              disabled={cancel.isPending}
              className="border-signal/50 text-signal hover:bg-signal/10"
            >
              Cancel request
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
