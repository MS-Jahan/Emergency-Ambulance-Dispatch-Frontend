'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Crosshair, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { useCreateRequest, useHospitals } from '@/lib/hooks'
import { useRequestWizard } from '@/lib/store'
import { ApiError } from '@/lib/api'
import type { RequestPriority } from '@/types/api'

const MapPicker = dynamic(() => import('@/components/request/map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-lg border border-hairline bg-gauze animate-pulse" />
  ),
})

const STEPS = ['Location', 'Details', 'Review'] as const

export default function NewRequestPage() {
  const router = useRouter()
  const wizard = useRequestWizard()
  const hospitals = useHospitals()
  const createRequest = useCreateRequest()
  const [locating, setLocating] = useState(false)

  const canNext =
    wizard.step === 1
      ? wizard.pickupLat != null && wizard.pickupLng != null
      : true

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        wizard.setPickupLocation(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      () => {
        toast.error('Could not get your location. Pick on the map instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const submit = async () => {
    if (wizard.pickupLat == null || wizard.pickupLng == null) return
    try {
      const request = await createRequest.mutateAsync({
        pickupAddress: wizard.pickupAddress,
        pickupLat: wizard.pickupLat,
        pickupLng: wizard.pickupLng,
        priority: wizard.priority,
        destinationHospitalId: wizard.hospitalId ?? undefined,
      })
      wizard.reset()
      toast.success('Ambulance requested')
      router.push(`/dashboard/requests/${request.id}`)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Could not submit request',
      )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Request ambulance</h1>
        <p className="text-sm text-slate mt-1">
          Three quick steps — we dispatch the nearest available unit
        </p>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1
          const active = wizard.step === n
          const done = wizard.step > n
          return (
            <li key={label} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => done && wizard.setStep(n as 1 | 2 | 3)}
                className={`flex items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                    active || done
                      ? 'bg-signal text-white'
                      : 'bg-gauze text-slate border border-hairline'
                  }`}
                >
                  {n}
                </span>
                <span
                  className={`text-sm ${active ? 'font-semibold text-ink' : 'text-slate'}`}
                >
                  {label}
                </span>
              </button>
              {n < STEPS.length && (
                <span
                  className={`flex-1 h-px ${done ? 'bg-signal' : 'bg-hairline'}`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <Card className="p-6 border border-hairline">
        {wizard.step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-ink">
                Pickup location
              </Label>
              <p className="text-xs text-slate mt-0.5 mb-2">
                Tap the map to drop the pin, or use your current location
              </p>
              <MapPicker
                lat={wizard.pickupLat}
                lng={wizard.pickupLng}
                onPick={(lat, lng) => wizard.setPickupLocation(lat, lng)}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={useMyLocation}
              disabled={locating}
              className="border-hairline text-ink hover:bg-gauze"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              {locating ? 'Locating...' : 'Use my location'}
            </Button>

            <div>
              <Label htmlFor="pickupAddress" className="text-sm font-medium text-ink">
                Pickup address
              </Label>
              <Input
                id="pickupAddress"
                placeholder="House 12, Road 5, Dhanmondi, Dhaka"
                value={wizard.pickupAddress}
                onChange={(e) => wizard.setPickupAddress(e.target.value)}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
            </div>

            {wizard.pickupLat != null && wizard.pickupLng != null && (
              <p className="text-xs text-slate tabular-nums">
                Pinned at {wizard.pickupLat.toFixed(5)},{' '}
                {wizard.pickupLng.toFixed(5)}
              </p>
            )}
          </div>
        )}

        {wizard.step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-ink">Priority</Label>
              <p className="text-xs text-slate mt-0.5 mb-2">
                Higher priority dispatches first
              </p>
              <Select
                value={wizard.priority}
                onValueChange={(v) => wizard.setPriority(v as RequestPriority)}
              >
                <SelectTrigger className="w-full bg-paper border-hairline text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-ink">
                Destination hospital <span className="text-slate font-normal">(optional)</span>
              </Label>
              <p className="text-xs text-slate mt-0.5 mb-2">
                Leave empty and choose later with the crew if unsure
              </p>
              <Select
                value={wizard.hospitalId ?? 'none'}
                onValueChange={(v) =>
                  wizard.setHospitalId(v === 'none' ? null : v)
                }
              >
                <SelectTrigger className="w-full bg-paper border-hairline text-ink">
                  <SelectValue placeholder="No hospital selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No hospital selected</SelectItem>
                  {(hospitals.data?.items ?? []).map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {wizard.step === 3 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-signal flex-shrink-0" />
                <p className="text-sm font-medium text-ink">
                  {wizard.pickupAddress || 'No address given'}
                </p>
              </div>
              {wizard.pickupLat != null && wizard.pickupLng != null && (
                <p className="text-xs text-slate tabular-nums ml-6">
                  {wizard.pickupLat.toFixed(5)}, {wizard.pickupLng.toFixed(5)}
                </p>
              )}
              <div className="ml-6">
                <PriorityBadge priority={wizard.priority} />
              </div>
              <p className="text-sm text-slate ml-6">
                Destination:{' '}
                {wizard.hospitalId
                  ? (hospitals.data?.items ?? []).find(
                      (h) => h.id === wizard.hospitalId,
                    )?.name ?? 'Selected hospital'
                  : 'To be decided'}
              </p>
            </div>
            <p className="text-xs text-slate border-t border-hairline pt-3">
              Submitting alerts dispatch immediately. Payment happens after the
              trip completes.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6 pt-4 border-t border-hairline">
          <Button
            type="button"
            variant="outline"
            onClick={() => wizard.setStep((wizard.step - 1) as 1 | 2 | 3)}
            disabled={wizard.step === 1}
            className="border-hairline text-ink hover:bg-gauze"
          >
            Back
          </Button>
          {wizard.step < 3 ? (
            <Button
              type="button"
              onClick={() => wizard.setStep((wizard.step + 1) as 1 | 2 | 3)}
              disabled={!canNext}
              className="bg-ink text-paper hover:bg-slate-800"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={createRequest.isPending}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {createRequest.isPending ? 'Submitting...' : 'Submit request'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
