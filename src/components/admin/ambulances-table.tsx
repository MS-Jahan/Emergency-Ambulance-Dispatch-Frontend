'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ambulance, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import {
  useAdminAmbulances,
  useCreateAmbulance,
  useDeleteAmbulance,
  useHospitals,
  useUpdateAmbulance,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { Ambulance as AmbulanceRow } from '@/types/api'

const TYPES = ['BASIC', 'ICU', 'CARDIAC'] as const
const STATUSES = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'] as const

const ambulanceSchema = z.object({
  plateNumber: z
    .string()
    .min(4, 'Plate number must be at least 4 characters')
    .max(20, 'Plate number cannot exceed 20 characters'),
  type: z.enum(['BASIC', 'ICU', 'CARDIAC']),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'MAINTENANCE']).optional(),
  homeHospitalId: z.string().optional(),
})

type AmbulanceFormData = z.infer<typeof ambulanceSchema>

// Brand palette: teal available, amber on trip, red maintenance.
const STATUS_PILL: Record<string, string> = {
  AVAILABLE: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  ON_TRIP: 'bg-amber/10 text-amber-700 dark:text-amber-300 border-amber/30',
  MAINTENANCE: 'bg-signal/10 text-signal border-signal/30',
}

const TYPE_PILL: Record<string, string> = {
  BASIC: 'bg-ink/5 text-ink border-hairline',
  ICU: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  CARDIAC: 'bg-signal/10 text-signal border-signal/30',
}

function AmbulanceForm({
  initial,
  onSubmit,
  pending,
  submitLabel,
}: {
  initial?: AmbulanceRow
  onSubmit: (data: {
    plateNumber?: string
    type: string
    homeHospitalId?: string | null
    status?: string
  }) => Promise<void>
  pending: boolean
  submitLabel: string
}) {
  const hospitals = useHospitals()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AmbulanceFormData>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      plateNumber: initial?.plateNumber ?? '',
      type: (initial?.type as 'BASIC' | 'ICU' | 'CARDIAC') ?? 'BASIC',
      status: (initial?.status as 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE') ?? 'AVAILABLE',
      homeHospitalId: initial?.homeHospitalId ?? 'none',
    },
  })

  // Watch selected values for controlled Radix/Base Select components
  const selectedType = watch('type')
  const selectedStatus = watch('status')
  const selectedHospital = watch('homeHospitalId')

  const onFormSubmit = (data: AmbulanceFormData) => {
    return onSubmit({
      ...(initial ? {} : { plateNumber: data.plateNumber.toUpperCase() }),
      type: data.type,
      ...(initial ? { status: data.status } : {}),
      homeHospitalId:
        data.homeHospitalId === 'none' || !data.homeHospitalId
          ? null
          : data.homeHospitalId,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="plate" className="text-sm font-medium text-ink">
          Plate number
        </Label>
        <Input
          id="plate"
          placeholder="DHK-1234"
          disabled={!!initial}
          {...register('plateNumber', {
            onChange: (e) => {
              setValue('plateNumber', e.target.value.toUpperCase())
            },
          })}
          className="mt-1 bg-paper border-hairline text-ink"
        />
        {errors.plateNumber && (
          <p className="mt-1 text-xs text-signal">{errors.plateNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-ink">Type</Label>
          <Select
            value={selectedType}
            onValueChange={(v) =>
              setValue('type', (v ?? 'BASIC') as 'BASIC' | 'ICU' | 'CARDIAC')
            }
          >
            <SelectTrigger className="mt-1 w-full bg-paper border-hairline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {initial && (
          <div>
            <Label className="text-sm font-medium text-ink">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) =>
                setValue(
                  'status',
                  (v ?? 'AVAILABLE') as 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE',
                )
              }
            >
              <SelectTrigger className="mt-1 w-full bg-paper border-hairline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replaceAll('_', ' ').toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium text-ink">Home hospital</Label>
        <Select
          value={selectedHospital ?? 'none'}
          onValueChange={(v) => setValue('homeHospitalId', v ?? 'none')}
        >
          <SelectTrigger className="mt-1 w-full bg-paper border-hairline">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {(hospitals.data?.items ?? []).map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {pending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}

export function AmbulancesTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type') ?? 'all'

  const ambulances = useAdminAmbulances()
  const create = useCreateAmbulance()
  const update = useUpdateAmbulance()
  const remove = useDeleteAmbulance()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<AmbulanceRow | null>(null)
  const [deleting, setDeleting] = useState<AmbulanceRow | null>(null)

  const items = useMemo(
    () => ambulances.data?.items ?? [],
    [ambulances.data],
  )
  const total = ambulances.data?.meta.total ?? items.length
  const rows = useMemo(
    () =>
      typeFilter === 'all'
        ? items
        : items.filter((a) => a.type === typeFilter),
    [items, typeFilter],
  )

  const setType = (val: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (val === 'all') {
      sp.delete('type')
    } else {
      sp.set('type', val)
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  const doDelete = async () => {
    if (!deleting) return
    try {
      await remove.mutateAsync(deleting.id)
      toast.success('Ambulance removed')
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <p className="text-sm text-slate">
          Ambulances ({total} total)
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={(v) => setType(v ?? 'all')}>
            <SelectTrigger className="w-32 bg-paper border-hairline" aria-label="Filter by type">
              <SelectValue>
                {typeFilter === 'all' ? 'All types' : typeFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Add ambulance
          </Button>
        </div>
      </div>

      {ambulances.isLoading ? (
        <ListSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Ambulance className="h-6 w-6 text-slate" />}
          title={typeFilter === 'all' ? 'No ambulances' : `No ${typeFilter} units`}
          description={
            typeFilter === 'all'
              ? 'Add the first unit to start dispatching.'
              : 'Try a different type filter.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hairline bg-paper">
          <Table>
            <TableHeader>
              <TableRow className="border-hairline hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-wide text-slate">Plate</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate">Status</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wide text-slate sm:table-cell">Home hospital</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-slate">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id} className="border-hairline">
                  <TableCell className="px-4 py-3 font-mono text-sm font-bold text-ink">
                    {a.plateNumber}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_PILL[a.type] ?? 'bg-gauze text-slate border-hairline'}`}
                    >
                      {a.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[a.status] ?? 'bg-gauze text-slate border-hairline'}`}
                    >
                      {a.status.replaceAll('_', ' ').toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate sm:table-cell">
                    {a.homeHospital?.name ?? 'No base'}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <span className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${a.plateNumber}`}
                        onClick={() => setEditing(a)}
                        className="text-slate hover:bg-gauze"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${a.plateNumber}`}
                        onClick={() => setDeleting(a)}
                        className="text-signal hover:bg-signal/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {creating && (
        <Dialog open onOpenChange={(v) => !v && setCreating(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add ambulance</DialogTitle>
              <DialogDescription>Register a new unit</DialogDescription>
            </DialogHeader>
            <AmbulanceForm
              pending={create.isPending}
              submitLabel="Create"
              onSubmit={async (data) => {
                await create.mutateAsync({
                  plateNumber: data.plateNumber!,
                  type: data.type,
                  ...(data.homeHospitalId && {
                    homeHospitalId: data.homeHospitalId,
                  }),
                })
                toast.success('Ambulance added')
                setCreating(false)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {editing && (
        <Dialog open onOpenChange={(v) => !v && setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editing.plateNumber}</DialogTitle>
              <DialogDescription>Plate cannot be changed</DialogDescription>
            </DialogHeader>
            <AmbulanceForm
              initial={editing}
              pending={update.isPending}
              submitLabel="Save"
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: editing.id,
                  type: data.type,
                  status: data.status,
                  homeHospitalId: data.homeHospitalId,
                })
                toast.success('Ambulance updated')
                setEditing(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {deleting?.plateNumber}?</DialogTitle>
            <DialogDescription>
              The unit is hidden from dispatch. History is kept.
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
