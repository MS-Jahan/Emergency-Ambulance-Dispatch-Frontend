'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Hospital, MapPin, Phone, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import {
  useAdminAmbulances,
  useCreateHospital,
  useDeleteHospital,
  useHospitals,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { Hospital as HospitalRow } from '@/types/api'

const hospitalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(4, 'Address must be at least 4 characters'),
  lat: z.number().min(-90, 'Valid latitude required (-90 to 90)').max(90, 'Valid latitude required (-90 to 90)'),
  lng: z.number().min(-180, 'Valid longitude required (-180 to 180)').max(180, 'Valid longitude required (-180 to 180)'),
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
})

type HospitalFormData = z.infer<typeof hospitalSchema>

function HospitalForm({
  onSubmit,
  pending,
}: {
  onSubmit: (data: {
    name: string
    address: string
    lat: number
    lng: number
    phone: string
  }) => Promise<void>
  pending: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      address: '',
      lat: 23.8103,
      lng: 90.4125,
      phone: '',
    },
  })

  const onFormSubmit = (data: HospitalFormData) => {
    return onSubmit({
      name: data.name.trim(),
      address: data.address.trim(),
      lat: Number(data.lat),
      lng: Number(data.lng),
      phone: data.phone.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="h-name" className="text-sm font-medium text-ink">
          Name
        </Label>
        <Input
          id="h-name"
          placeholder="Square General Hospital"
          {...register('name')}
          className="mt-1 bg-paper border-hairline text-ink"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-signal">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="h-addr" className="text-sm font-medium text-ink">
          Address
        </Label>
        <Input
          id="h-addr"
          placeholder="123 Road, Dhaka"
          {...register('address')}
          className="mt-1 bg-paper border-hairline text-ink"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-signal">{errors.address.message}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="h-lat" className="text-sm font-medium text-ink">
            Lat
          </Label>
          <Input
            id="h-lat"
            placeholder="23.81"
            inputMode="decimal"
            {...register('lat', { valueAsNumber: true })}
            className="mt-1 bg-paper border-hairline text-ink"
          />
          {errors.lat && (
            <p className="mt-1 text-xs text-signal">{errors.lat.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="h-lng" className="text-sm font-medium text-ink">
            Lng
          </Label>
          <Input
            id="h-lng"
            placeholder="90.41"
            inputMode="decimal"
            {...register('lng', { valueAsNumber: true })}
            className="mt-1 bg-paper border-hairline text-ink"
          />
          {errors.lng && (
            <p className="mt-1 text-xs text-signal">{errors.lng.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="h-phone" className="text-sm font-medium text-ink">
            Phone
          </Label>
          <Input
            id="h-phone"
            placeholder="+880..."
            {...register('phone')}
            className="mt-1 bg-paper border-hairline text-ink"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-signal">{errors.phone.message}</p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-ink text-paper hover:bg-ink/90"
      >
        {pending ? 'Saving...' : 'Create hospital'}
      </Button>
    </form>
  )
}

export function HospitalsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const hospitals = useHospitals()
  const ambulances = useAdminAmbulances()
  const create = useCreateHospital()
  const remove = useDeleteHospital()

  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<HospitalRow | null>(null)

  const items = useMemo(() => {
    const list = hospitals.data?.items ?? []
    if (!q.trim()) return list
    const lower = q.toLowerCase()
    return list.filter(
      (h) =>
        h.name.toLowerCase().includes(lower) ||
        h.address.toLowerCase().includes(lower),
    )
  }, [hospitals.data?.items, q])

  const setQ = (val: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (val.trim()) {
      sp.set('q', val)
    } else {
      sp.delete('q')
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  // Units based at each hospital, counted client-side from the fleet feed.
  const fleetByHospital = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of ambulances.data?.items ?? []) {
      if (a.homeHospitalId)
        counts.set(a.homeHospitalId, (counts.get(a.homeHospitalId) ?? 0) + 1)
    }
    return counts
  }, [ambulances.data])

  const doDelete = async () => {
    if (!deleting) return
    try {
      await remove.mutateAsync(deleting.id)
      toast.success('Hospital removed')
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <p className="text-sm text-slate">Hospitals ({items.length})</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hospitals"
              aria-label="Search hospitals"
              className="h-9 w-44 pl-8 bg-paper border-hairline text-ink"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="bg-signal text-white hover:bg-signal/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Add hospital
          </Button>
        </div>
      </div>

      {hospitals.isLoading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Hospital className="h-6 w-6 text-slate" />}
          title="No hospitals"
          description="Add the first hospital so dispatches have a destination."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h.id}>
              <Card className="p-3 border border-hairline transition-colors hover:border-ink/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{h.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden />
                      {h.address}
                    </p>
                  </div>
                  <span className="inline-flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${h.name}`}
                      onClick={() => setDeleting(h)}
                      className="text-signal hover:bg-signal/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-oxygen hover:underline"
                    >
                      <Phone className="h-3 w-3" aria-hidden />
                      {h.phone}
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-slate">
                    {fleetByHospital.get(h.id) ?? 0} unit
                    {(fleetByHospital.get(h.id) ?? 0) === 1 ? '' : 's'} based here
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <Dialog open onOpenChange={(v) => !v && setCreating(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add hospital</DialogTitle>
              <DialogDescription>A dispatch destination</DialogDescription>
            </DialogHeader>
            <HospitalForm
              pending={create.isPending}
              onSubmit={async (data) => {
                await create.mutateAsync(data)
                toast.success('Hospital added')
                setCreating(false)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {deleting?.name}?</DialogTitle>
            <DialogDescription>
              Requests can no longer target this hospital.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Keep
            </Button>
            <Button
              onClick={doDelete}
              disabled={remove.isPending}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {remove.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
