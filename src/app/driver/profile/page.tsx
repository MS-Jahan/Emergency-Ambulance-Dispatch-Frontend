'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  AlertCircle,
  Ambulance,
  Building2,
  Gauge,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DetailSkeleton } from '@/components/shared/skeletons'
import { ChangePasswordCard } from '@/components/auth/change-password-card'
import {
  useMyDriverProfile,
  useUpdateDriverAmbulanceStatus,
  useUpdateProfile,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(10, 'Valid phone number is required (at least 10 digits)')
    .max(15, 'Phone number too long'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function DriverProfilePage() {
  const { data: profile, isLoading } = useMyDriverProfile()
  const updateProfile = useUpdateProfile()
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

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.user?.name ?? '',
      phone: profile?.user?.phone ?? '',
    },
  })

  const onSubmit = async (values: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(values)
      toast.success('Driver profile updated successfully')
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Failed to update profile',
      )
    }
  }

  if (isLoading || !profile) {
    return <DetailSkeleton />
  }

  const ambulance = profile.ambulance

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">
          Profile
        </h1>
        <p className="text-sm text-slate">
          Your contact details, licence and assigned ambulance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-hairline bg-paper gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand font-heading text-lg">
                  {profile.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl">
                    {profile.user.name}
                  </h2>
                  <p className="text-xs text-slate flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {profile.user.email}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                  profile.status === 'AVAILABLE'
                    ? 'bg-oxygen/10 text-oxygen border border-oxygen/20'
                    : profile.status === 'ON_TRIP'
                      ? 'bg-amber/15 text-amber border border-amber/30'
                      : 'bg-slate/10 text-slate border border-slate/20'
                }`}
              >
                <Gauge className="h-3 w-3" />
                {profile.status.replaceAll('_', ' ')}
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dp-name" className="text-sm font-medium text-ink">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate" />
                    <Input
                      id="dp-name"
                      {...register('name')}
                      className="pl-9 h-11 bg-paper border-hairline text-ink text-sm"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-signal">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dp-phone" className="text-sm font-medium text-ink">
                    Contact phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate" />
                    <Input
                      id="dp-phone"
                      {...register('phone')}
                      className="pl-9 h-11 bg-paper border-hairline text-ink text-sm"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-signal">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfile.isPending}
                  className="h-10 px-5"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Assigned Ambulance Unit */}
          <Card className="p-6 border-hairline bg-paper space-y-4">
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
        </div>

        {/* Verification & License Details */}
        <div className="space-y-6">
          <ChangePasswordCard />

          <Card className="p-5 border-hairline bg-paper space-y-4">
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

          <Card className="p-5 border-hairline bg-paper space-y-3">
            <h3 className="text-base flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" /> Location
            </h3>

            {profile.currentLat && profile.currentLng ? (
              <div className="space-y-1 text-xs">
                <p className="text-slate">Latest reported position:</p>
                <p className="font-mono text-ink tabular-nums font-semibold">
                  {profile.currentLat.toFixed(5)}, {profile.currentLng.toFixed(5)}
                </p>
                <p className="text-[11px] text-slate pt-1">
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
        </div>
      </div>
    </div>
  )
}
