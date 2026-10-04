'use client'

import { useState } from 'react'
import { Hospital as HospitalIcon, Plus, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useCreateHospital, useDeleteHospital, useHospitals } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { Hospital } from '@/types/api'

const initialForm = { name: '', address: '', lat: '', lng: '', phone: '' }

export function HospitalsTable() {
  const hospitals = useHospitals()
  const create = useCreateHospital()
  const remove = useDeleteHospital()

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [deleting, setDeleting] = useState<Hospital | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lat = Number(form.lat)
    const lng = Number(form.lng)
    if (!form.name.trim() || !form.address.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Fill every field — lat/lng must be numbers')
      return
    }
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        address: form.address.trim(),
        lat,
        lng,
        phone: form.phone.trim(),
      })
      toast.success('Hospital added')
      setForm(initialForm)
      setCreating(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Create failed')
    }
  }

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">Hospital destinations</p>
        <Button
          size="sm"
          onClick={() => setCreating(true)}
          className="bg-ink text-paper hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 mr-1" /> Add hospital
        </Button>
      </div>

      {hospitals.isLoading ? (
        <ListSkeleton rows={5} />
      ) : (hospitals.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<HospitalIcon className="h-6 w-6 text-slate" />}
          title="No hospitals"
          description="Add hospitals so patients can pick destinations."
        />
      ) : (
        <Card className="border border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-hairline">
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitals.data!.items.map((h) => (
                <TableRow key={h.id} className="border-hairline">
                  <TableCell className="font-medium text-ink">{h.name}</TableCell>
                  <TableCell className="text-slate max-w-52 truncate">
                    {h.address}
                  </TableCell>
                  <TableCell className="text-slate">{h.phone}</TableCell>
                  <TableCell className="text-slate tabular-nums text-xs">
                    {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${h.name}`}
                      onClick={() => setDeleting(h)}
                      className="text-signal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={creating} onOpenChange={(v) => !v && setCreating(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add hospital</DialogTitle>
            <DialogDescription>
              Coordinates pin it on the map and power nearby search
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="h-name" className="text-sm font-medium text-ink">
                Name
              </Label>
              <Input
                id="h-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <div>
              <Label htmlFor="h-addr" className="text-sm font-medium text-ink">
                Address
              </Label>
              <Input
                id="h-addr"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="h-lat" className="text-sm font-medium text-ink">
                  Latitude
                </Label>
                <Input
                  id="h-lat"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="23.8103"
                  className="mt-1 bg-paper border-hairline text-ink"
                />
              </div>
              <div>
                <Label htmlFor="h-lng" className="text-sm font-medium text-ink">
                  Longitude
                </Label>
                <Input
                  id="h-lng"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  placeholder="90.4125"
                  className="mt-1 bg-paper border-hairline text-ink"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="h-phone" className="text-sm font-medium text-ink">
                Phone
              </Label>
              <Input
                id="h-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+8802XXXXXXXX"
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <Button
              type="submit"
              disabled={create.isPending}
              className="w-full bg-ink text-paper hover:bg-slate-800"
            >
              {create.isPending ? 'Saving...' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {deleting?.name}?</DialogTitle>
            <DialogDescription>
              It disappears from patient destination lists.
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
