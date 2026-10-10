'use client'

import { useState } from 'react'
import { Ambulance, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/shared/skeletons'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { useAssignAmbulance, useNearbyAmbulances } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { EmergencyRequest } from '@/types/api'

interface AssignPanelProps {
  /** Selected request; the panel only assigns while it is PENDING. */
  request?: EmergencyRequest
  onAssigned: (id: string) => void
  onOpenDetails: (id: string) => void
}

/**
 * Board side panel: nearby ambulances for the selected pending request,
 * ranked by distance, with 'Assign nearest' and per-row Assign.
 */
export function AssignPanel({ request, onAssigned, onOpenDetails }: AssignPanelProps) {
  const pending = request?.status === 'PENDING'
  const [filterByType, setFilterByType] = useState(true)

  const activeTypeFilter =
    filterByType && request?.requestedAmbulanceType
      ? request.requestedAmbulanceType
      : undefined

  const nearby = useNearbyAmbulances(
    {
      lat: request?.pickupLat ?? 0,
      lng: request?.pickupLng ?? 0,
      radiusKm: 10,
      type: activeTypeFilter,
    },
    { enabled: !!request && pending && !!request.pickupLat && !!request.pickupLng },
  )
  const assign = useAssignAmbulance()

  const ranked = [...(nearby.data ?? [])].sort((a, b) => a.distanceKm - b.distanceKm)

  const doAssign = async (ambulanceId: string) => {
    if (!request) return
    try {
      await assign.mutateAsync({ requestId: request.id, ambulanceId })
      toast.success('Ambulance assigned')
      onAssigned(request.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Assign failed')
    }
  }

  return (
    <aside
      aria-label="Assign ambulance"
      className="rounded-3xl border border-hairline bg-paper p-4 xl:sticky xl:top-4"
    >
      <h2 className="text-base font-extrabold text-ink">Assign</h2>

      {!request || !pending ? (
        <p className="mt-3 rounded-2xl border border-dashed border-hairline p-4 text-center text-sm text-slate">
          Select a pending request to see nearby ambulances.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-ink">
                {request.patientName || request.patient?.name || 'Patient'}
              </p>
              <PriorityBadge priority={request.priority} />
            </div>
            {request.requestedAmbulanceType && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  Requested: {request.requestedAmbulanceType}
                </span>
                <button
                  type="button"
                  onClick={() => setFilterByType((prev) => !prev)}
                  className="text-xs text-slate underline hover:text-ink"
                >
                  {filterByType ? 'Show all types' : `Filter ${request.requestedAmbulanceType}`}
                </button>
              </div>
            )}
            <p className="flex items-start gap-1.5 text-xs text-slate">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              {request.pickupAddress || 'Pickup address on file'}
            </p>
            {request.notes && (
              <p className="rounded-xl bg-gauze p-2 text-xs text-ink line-clamp-2">
                <span className="font-semibold text-slate">Notes: </span>
                {request.notes}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenDetails(request.id)}
              className="-ml-2 h-7 text-xs text-brand hover:bg-brand-soft"
            >
              Open full details
            </Button>
          </div>

          <Button
            onClick={() => ranked[0] && doAssign(ranked[0].id)}
            disabled={assign.isPending || ranked.length === 0}
            className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {assign.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />}
            Assign nearest
            {ranked[0] ? ` (${ranked[0].distanceKm} km)` : ''}
          </Button>

          <section aria-label="Nearby ambulances">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">
              {activeTypeFilter ? `${activeTypeFilter} units nearby` : 'Nearby, closest first'}
            </p>
            {nearby.isLoading ? (
              <div className="mt-2">
                <CardSkeleton />
              </div>
            ) : nearby.isError ? (
              <p className="mt-2 text-sm text-signal">Could not load nearby ambulances.</p>
            ) : ranked.length === 0 ? (
              <div className="mt-2 rounded-2xl border border-dashed border-hairline p-4 text-center text-sm text-slate">
                <Ambulance className="mx-auto h-4 w-4 shrink-0" aria-hidden />
                <p className="mt-1">
                  No available {activeTypeFilter ? `${activeTypeFilter} ` : ''}ambulances within 10 km.
                </p>
                {activeTypeFilter && (
                  <button
                    type="button"
                    onClick={() => setFilterByType(false)}
                    className="mt-2 text-xs font-bold text-brand hover:underline"
                  >
                    View all ambulance types
                  </button>
                )}
              </div>
            ) : (
              <ul className="mt-2 space-y-2">
                {ranked.map((a, i) => {
                  const mismatch =
                    request.requestedAmbulanceType && a.type !== request.requestedAmbulanceType
                  return (
                    <li key={a.id}>
                      <div className="flex flex-row items-center justify-between gap-3 rounded-2xl border border-hairline bg-gauze p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            <span className="font-mono">{a.plateNumber}</span>
                            <span className="ml-2 font-normal text-slate">{a.type}</span>
                            {mismatch && (
                              <span className="ml-2 rounded bg-amber/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                                differs
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate">
                            {a.distanceKm} km
                            {i === 0 ? ' · nearest' : ''} · {a.driver?.name ?? a.status.toLowerCase().replace(/_/g, ' ')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => doAssign(a.id)}
                          disabled={assign.isPending}
                          aria-label={`Assign ${a.plateNumber}`}
                          className="border-hairline text-ink hover:bg-paper"
                        >
                          Assign
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </aside>
  )
}
