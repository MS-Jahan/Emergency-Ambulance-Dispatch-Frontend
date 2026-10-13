'use client'

import { toast } from 'sonner'
import {
  AlertCircle,
  Ambulance,
  Building2,
  Gauge,
  IdCard,
  MapPin,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DetailSkeleton } from '@/components/shared/skeletons'
import { AccountProfile } from '@/components/profile/account-profile'
import {
  useMyDriverProfile,
  useUpdateDriverAmbulanceStatus,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'

export default function DriverProfilePage() {
  const { data: profile, isLoading } = useMyDriverProfile()
  const updateAmbulanceStatus = useUpdateDriverAmbulanceStatus()

  const handleToggleAmbulanceStatus = async () => {
    if (!profile?.ambulance) return
    const current = profile.ambulance.status
    const nextStatus = current === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE'
    try {
      await updateAmbulanceStatus.mutateAsync({ status: nextStatus })
      toast.success(
        nextStatus === 'MAINTENANCE'
          ? 'Ambulance marked in maintenance'
          : 'Ambulance marked available for dispatch',
      )
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Failed to update ambulance status',
      )
    }
  }

  if (isLoading || !profile) {
    return <DetailSkeleton />
  }

  const ambulance = profile.ambulance

  const statusBadge = (
    <span
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
        profile.status === 'AVAILABLE'
          ? 'border border-oxygen/20 bg-oxygen/10 text-oxygen'
          : profile.status === 'ON_TRIP'
            ? 'border border-amber/30 bg-amber/15 text-amber'
            : 'border border-slate/20 bg-slate/10 text-slate'
      }`}
    >
      <Gauge className="h-3 w-3" />
      {profile.status.replaceAll('_', ' ')}
    </span>
  )

  return (
    <AccountProfile
      subtitle="Your contact details, licence and assigned ambulance."
      requirePhone
      badge={statusBadge}
      extra={
        <>
          {/* Assigned Ambulance Unit */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-oxygen" />
                <h3 className="text-base">
                  Assigned ambulance
                </h3>
              </div>
              {ambulance ? (
                <span className="text-xs font-semibold text-oxygen bg-oxygen/10 px-3 py-1 rounded-full">
                  Assigned
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate bg-slate/10 px-3 py-1 rounded-full">
                  No vehicle
                </span>
              )}
            </div>

            {ambulance ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="p-3 bg-gauze rounded-2xl border border-hairline space-y-1">
                    <span className="text-slate block">Plate</span>
                    <span className="font-mono font-bold text-ink text-sm">
                      {ambulance.plateNumber}
                    </span>
                  </div>

                  <div className="p-3 bg-gauze rounded-2xl border border-hairline space-y-1">
                    <span className="text-slate block">Type</span>
                    <span className="font-semibold text-ink text-sm">
                      {ambulance.type}
                    </span>
                  </div>

                  <div className="p-3 bg-gauze rounded-2xl border border-hairline space-y-1">
                    <span className="text-slate block">Status</span>
                    <span
                      className={`inline-block font-semibold text-xs px-2 py-0.5 rounded-full ${
                        ambulance.status === 'MAINTENANCE'
                          ? 'bg-amber/15 text-amber'
                          : ambulance.status === 'ON_TRIP'
                          ? 'bg-signal/15 text-signal'
                          : 'bg-oxygen/15 text-oxygen'
                      }`}
                    >
                      {ambulance.status}
                    </span>
                  </div>

                  <div className="p-3 bg-gauze rounded-2xl border border-hairline space-y-1 sm:col-span-3">
                    <span className="text-slate flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Home hospital
                    </span>
                    <span className="font-medium text-ink">
                      {ambulance.homeHospital?.name ?? 'Not set'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleAmbulanceStatus}
                  disabled={
                    ambulance.status === 'ON_TRIP' ||
                    updateAmbulanceStatus.isPending
                  }
                  className="w-full text-xs h-9 flex items-center justify-center gap-1.5"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  {ambulance.status === 'ON_TRIP'
                    ? 'Vehicle on active trip'
                    : ambulance.status === 'MAINTENANCE'
                    ? 'Mark vehicle available'
                    : 'Report vehicle maintenance'}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate">
                Contact your dispatch supervisor to pair your profile with an
                emergency ambulance vehicle.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-base flex items-center gap-1.5">
              <IdCard className="h-4 w-4 text-brand" /> Licence
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate block">Licence number</span>
                <span className="font-mono font-semibold text-ink text-sm">
                  {profile.licenseNumber}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" /> Location
            </h3>

            {profile.currentLat && profile.currentLng ? (
              <div className="space-y-1 text-xs">
                <p className="text-slate">Latest reported position:</p>
                <p className="font-mono text-ink tabular-nums font-semibold">
                  {profile.currentLat.toFixed(5)}, {profile.currentLng.toFixed(5)}
                </p>
                <p className="text-xs text-slate pt-1">
                  Shared automatically while you are online.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-slate">
                <AlertCircle className="h-4 w-4 text-amber shrink-0 mt-0.5" />
                <span>
                  No location reported yet. Go online on the duty screen to share
                  your location with dispatchers.
                </span>
              </div>
            )}
          </Card>
        </>
      }
    />
  )
}
