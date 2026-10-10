'use client'

import { FieldError } from '@/components/shared/field-error'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Crosshair, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MotionCard } from '@/components/motion-card'
import { QuickActionButton } from '@/components/quick-action-button'
import { RequestWizardStep } from '@/components/request-wizard-step'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { useCreateRequest, useFares, useHospitals } from '@/lib/hooks'
import { useRequestWizard } from '@/lib/store'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AMBULANCE_FARES, type AmbulanceType, type RequestPriority } from '@/types/api'

const stepOneSchema = z.object({
  pickupAddress: z
    .string()
    .min(5, 'Pickup address must be at least 5 characters (road, house or area)'),
})

type StepOneData = z.infer<typeof stepOneSchema>

const stepTwoSchema = z.object({
  requestedAmbulanceType: z.enum(['BASIC', 'ICU', 'CARDIAC']).optional().nullable(),
  patientName: z.string().trim().max(80, 'Patient name must be 80 characters or less').optional().or(z.literal('')),
  patientAge: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number(val)
      return Number.isInteger(num) && num >= 0 && num <= 120
    }, 'Age must be an integer between 0 and 120'),
  callbackPhone: z
    .string()
    .trim()
    .max(20, 'Callback phone must be 20 characters or less')
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length >= 7, 'Phone number must be at least 7 characters'),
  notes: z.string().trim().max(500, 'Notes must be 500 characters or less').optional().or(z.literal('')),
})

type StepTwoData = z.infer<typeof stepTwoSchema>

const MapPicker = dynamic(() => import('@/components/request/map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-2xl border border-hairline bg-gauze animate-pulse" />
  ),
})

const PRIORITY_OPTIONS: {
  value: RequestPriority
  label: string
  note: string
  dot: string
}[] = [
  {
    value: 'CRITICAL',
    label: 'Critical',
    note: 'Life-threatening',
    dot: 'bg-signal',
  },
  {
    value: 'HIGH',
    label: 'High',
    note: 'Serious but stable',
    dot: 'bg-amber',
  },
  {
    value: 'NORMAL',
    label: 'Normal',
    note: 'Non-emergency',
    dot: 'bg-oxygen',
  },
]

const AMBULANCE_TYPE_OPTIONS: {
  value: AmbulanceType
  label: string
  note: string
  fare: number
}[] = [
  {
    value: 'BASIC',
    label: 'Basic',
    note: 'Standard transport with oxygen support',
    fare: AMBULANCE_FARES.BASIC,
  },
  {
    value: 'ICU',
    label: 'ICU',
    note: 'Intensive care with ventilator & monitor',
    fare: AMBULANCE_FARES.ICU,
  },
  {
    value: 'CARDIAC',
    label: 'Cardiac',
    note: 'Advanced life support & defibrillator',
    fare: AMBULANCE_FARES.CARDIAC,
  },
]

const HEADINGS: Record<1 | 2 | 3, string> = {
  1: 'Where are you?',
  2: 'How urgent?',
  3: 'Review & confirm',
}

export default function NewRequestPage() {
  const router = useRouter()
  const wizard = useRequestWizard()
  const hospitals = useHospitals()
  const createRequest = useCreateRequest()
  const faresQuery = useFares()
  const fares = faresQuery.data?.rates ?? AMBULANCE_FARES
  const [locating, setLocating] = useState(false)

  const step = wizard.step as 1 | 2 | 3
  const hasPin = wizard.pickupLat != null && wizard.pickupLng != null
  const hospitalName = wizard.hospitalId
    ? (hospitals.data?.items ?? []).find((h) => h.id === wizard.hospitalId)
        ?.name ?? 'Selected hospital'
    : null

  const stepOneForm = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    values: {
      pickupAddress: wizard.pickupAddress,
    },
  })

  const stepTwoForm = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
    values: {
      requestedAmbulanceType: wizard.requestedAmbulanceType,
      patientName: wizard.patientName,
      patientAge: wizard.patientAge != null ? String(wizard.patientAge) : '',
      callbackPhone: wizard.callbackPhone,
      notes: wizard.notes,
    },
  })

  const selectedAmbulanceType = stepTwoForm.watch('requestedAmbulanceType')

  const go = (n: 1 | 2 | 3) => wizard.setStep(n)

  const handleNextStep = async () => {
    if (step === 1) {
      if (!hasPin) {
        toast.error('Please select a pickup point on the map or use your current location')
        return
      }
      const valid = await stepOneForm.trigger()
      if (!valid) return
      wizard.setPickupAddress(stepOneForm.getValues('pickupAddress'))
      go(2)
      return
    }
    if (step === 2) {
      const valid = await stepTwoForm.trigger()
      if (!valid) return
      const values = stepTwoForm.getValues()
      wizard.setRequestedAmbulanceType(values.requestedAmbulanceType ?? null)
      wizard.setPatientName(values.patientName?.trim() ?? '')
      wizard.setPatientAge(values.patientAge ? Number(values.patientAge) : null)
      wizard.setCallbackPhone(values.callbackPhone?.trim() ?? '')
      wizard.setNotes(values.notes?.trim() ?? '')
      go(3)
    }
  }

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
    const { pickupLat, pickupLng } = wizard
    if (pickupLat == null || pickupLng == null) return
    try {
      const request = await createRequest.mutateAsync({
        pickupAddress: wizard.pickupAddress,
        pickupLat,
        pickupLng,
        priority: wizard.priority,
        destinationHospitalId: wizard.hospitalId ?? undefined,
        requestedAmbulanceType: wizard.requestedAmbulanceType ?? undefined,
        patientName: wizard.patientName.trim() || undefined,
        patientAge: wizard.patientAge != null ? wizard.patientAge : undefined,
        callbackPhone: wizard.callbackPhone.trim() || undefined,
        notes: wizard.notes.trim() || undefined,
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

  const footer = (
    <div className="grid grid-cols-2 gap-3">
      <QuickActionButton
        label="Back"
        variant="outline"
        onClick={() => go((step - 1) as 1 | 2 | 3)}
        disabled={step === 1 || createRequest.isPending}
        className="sm:h-14"
      />
      {step < 3 ? (
        <QuickActionButton
          label={step === 1 ? 'Next' : 'Review'}
          variant="brand"
          onClick={handleNextStep}
          disabled={step === 1 && !hasPin}
        />
      ) : (
        <QuickActionButton
          label={createRequest.isPending ? 'Submitting...' : 'Confirm'}
          onClick={submit}
          loading={createRequest.isPending}
        />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <MotionCard key={step} duration={300}>
        <RequestWizardStep
          stepNumber={step}
          totalSteps={3}
          heading={HEADINGS[step]}
          footer={footer}
        >
          {step === 1 && (
            <div className="space-y-4">
              <MapPicker
                lat={wizard.pickupLat}
                lng={wizard.pickupLng}
                onPick={(lat, lng) => wizard.setPickupLocation(lat, lng)}
              />

              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline disabled:opacity-60"
              >
                <Crosshair className="h-4 w-4" aria-hidden />
                {locating ? 'Locating...' : 'Use my current location'}
              </button>

              <div className="space-y-1.5">
                <Label htmlFor="pickupAddress" className="text-sm font-bold text-ink">
                  Pickup address
                </Label>
                <Input
                  id="pickupAddress"
                  placeholder="House 12, Road 5, Dhanmondi, Dhaka"
                  {...stepOneForm.register('pickupAddress', {
                    onChange: (e) => wizard.setPickupAddress(e.target.value),
                  })}
                  className="h-12 border-hairline text-ink"
                />
                {stepOneForm.formState.errors.pickupAddress && (
                  <FieldError>
                    {stepOneForm.formState.errors.pickupAddress.message}
                  </FieldError>
                )}
              </div>

              {hasPin && (
                <p className="text-xs text-slate tabular-nums">
                  Pinned at {wizard.pickupLat!.toFixed(5)},{' '}
                  {wizard.pickupLng!.toFixed(5)}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-sm font-bold text-ink mb-2">
                  Priority
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const selected = wizard.priority === opt.value
                    return (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-2 transition-colors',
                          selected
                            ? 'border-brand bg-brand-soft'
                            : 'border-hairline hover:border-brand',
                          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:border-brand',
                        )}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={opt.value}
                          checked={selected}
                          onChange={() => wizard.setPriority(opt.value)}
                          className="sr-only"
                        />
                        <span className={cn('h-3 w-3 rounded-full shrink-0', opt.dot)} aria-hidden />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-ink">{opt.label}</span>
                          <span className="block text-xs text-slate">{opt.note}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold text-ink mb-2">
                  Ambulance Type <span className="text-slate font-normal">(optional)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {AMBULANCE_TYPE_OPTIONS.map((opt) => {
                    const selected = selectedAmbulanceType === opt.value
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          const next = selected ? null : opt.value
                          stepTwoForm.setValue('requestedAmbulanceType', next, { shouldValidate: true })
                          wizard.setRequestedAmbulanceType(next)
                        }}
                        className={cn(
                          'flex flex-col justify-between p-3.5 rounded-2xl border-2 text-left transition-colors',
                          selected
                            ? 'border-brand bg-brand-soft'
                            : 'border-hairline hover:border-brand',
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-ink">{opt.label}</span>
                            <span className="font-mono text-xs font-bold text-brand">${fares[opt.value]}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate">{opt.note}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="space-y-4">
                <p className="text-sm font-bold text-ink">
                  Patient Details <span className="text-slate font-normal">(optional)</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="patientName" className="text-xs font-semibold text-slate">
                      Patient Name
                    </Label>
                    <Input
                      id="patientName"
                      placeholder="Defaults to account name"
                      {...stepTwoForm.register('patientName', {
                        onChange: (e) => wizard.setPatientName(e.target.value),
                      })}
                      className="h-11 border-hairline text-ink"
                    />
                    {stepTwoForm.formState.errors.patientName && (
                      <FieldError>{stepTwoForm.formState.errors.patientName.message}</FieldError>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="patientAge" className="text-xs font-semibold text-slate">
                      Patient Age
                    </Label>
                    <Input
                      id="patientAge"
                      type="number"
                      min={0}
                      max={120}
                      placeholder="e.g. 45"
                      {...stepTwoForm.register('patientAge', {
                        onChange: (e) =>
                          wizard.setPatientAge(e.target.value ? Number(e.target.value) : null),
                      })}
                      className="h-11 border-hairline text-ink"
                    />
                    {stepTwoForm.formState.errors.patientAge && (
                      <FieldError>{stepTwoForm.formState.errors.patientAge.message}</FieldError>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="callbackPhone" className="text-xs font-semibold text-slate">
                    Callback Phone
                  </Label>
                  <Input
                    id="callbackPhone"
                    type="tel"
                    placeholder="Defaults to account phone"
                    {...stepTwoForm.register('callbackPhone', {
                      onChange: (e) => wizard.setCallbackPhone(e.target.value),
                    })}
                    className="h-11 border-hairline text-ink"
                  />
                  {stepTwoForm.formState.errors.callbackPhone && (
                    <FieldError>{stepTwoForm.formState.errors.callbackPhone.message}</FieldError>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold text-slate">
                    Medical Notes / Instructions
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Symptoms, access codes, or medical instructions (max 500 characters)"
                    rows={3}
                    {...stepTwoForm.register('notes', {
                      onChange: (e) => wizard.setNotes(e.target.value),
                    })}
                    className="border-hairline text-ink"
                  />
                  {stepTwoForm.formState.errors.notes && (
                    <FieldError>{stepTwoForm.formState.errors.notes.message}</FieldError>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-ink">
                  Destination hospital{' '}
                  <span className="text-slate font-normal">(optional)</span>
                </Label>
                <Select
                  value={wizard.hospitalId ?? 'none'}
                  onValueChange={(v) =>
                    wizard.setHospitalId(v === 'none' ? null : v)
                  }
                >
                  <SelectTrigger className="w-full h-12 border-hairline text-ink">
                    <SelectValue>
                      {(v: string) =>
                        v === 'none'
                          ? 'No hospital selected'
                          : ((hospitals.data?.items ?? []).find((h) => h.id === v)?.name ?? 'Selected hospital')
                      }
                    </SelectValue>
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
                <p className="text-xs text-slate">
                  Unsure? Leave it empty and decide with the crew.
                </p>
              </div>

              <p className="text-xs text-slate">
                Fare depends on ambulance type and distance — you pay only
                after arrival.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Map thumbnail */}
                <div className="flex h-32 w-full shrink-0 flex-col items-center justify-center gap-1 rounded-2xl sm:h-[160px] sm:w-[160px] border border-hairline bg-gauze text-slate">
                  <MapPin className="h-6 w-6 text-brand" aria-hidden />
                  {hasPin && (
                    <span className="px-2 text-center text-[10px] tabular-nums">
                      {wizard.pickupLat!.toFixed(4)}, {wizard.pickupLng!.toFixed(4)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 space-y-2">
                  <p className="font-bold text-ink line-clamp-2">
                    {wizard.pickupAddress || 'No address given'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={wizard.priority} />
                    {wizard.requestedAmbulanceType && (
                      <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {wizard.requestedAmbulanceType} (${fares[wizard.requestedAmbulanceType]})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate">
                    Destination: {hospitalName ?? 'To be decided'}
                  </p>
                  {(wizard.patientName || wizard.patientAge || wizard.callbackPhone) && (
                    <p className="text-xs text-slate">
                      Patient: {wizard.patientName || 'Account holder'}
                      {wizard.patientAge != null ? ` (${wizard.patientAge} yrs)` : ''}
                      {wizard.callbackPhone ? ` · Phone: ${wizard.callbackPhone}` : ''}
                    </p>
                  )}
                  {wizard.notes && (
                    <p className="rounded-xl bg-gauze p-2.5 text-xs text-ink line-clamp-3">
                      <span className="font-semibold text-slate">Notes: </span>
                      {wizard.notes}
                    </p>
                  )}
                </div>
              </div>

              <p className="border-t border-hairline pt-4 text-sm text-slate">
                Submitting alerts dispatch immediately.{' '}
                <span className="font-medium text-ink">
                  Pay after arrival.
                </span>
              </p>
            </div>
          )}
        </RequestWizardStep>
      </MotionCard>
    </div>
  )
}
