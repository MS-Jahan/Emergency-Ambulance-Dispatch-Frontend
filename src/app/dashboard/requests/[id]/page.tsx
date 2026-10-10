'use client'

import { FieldError } from '@/components/shared/field-error'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Ambulance,
  ArrowLeft,
  Check,
  ExternalLink,
  Navigation,
  Phone,
  Star,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { MotionCard } from '@/components/motion-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { ListSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCancelRequest,
  useInitiatePayment,
  useRequestDetail,
  useRequestFeedback,
  useSubmitFeedback,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { EmergencyRequest, RequestStatus } from '@/types/api'

const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Please select a star rating (1-5)').max(5),
  comment: z.string().max(500).optional(),
})
type FeedbackFormData = z.infer<typeof feedbackSchema>

const cancelSchema = z.object({
  reason: z.string().min(3, 'Please provide a cancellation reason (min 3 chars)'),
})
type CancelFormData = z.infer<typeof cancelSchema>

const ACTIVE_STATUSES: RequestStatus[] = [
  'PENDING',
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
]

const TRIP_STEPS: { status: RequestStatus; label: string }[] = [
  { status: 'PENDING', label: 'Requested' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'EN_ROUTE_PICKUP', label: 'On the way' },
  { status: 'PICKED_UP', label: 'Picked up' },
  { status: 'EN_ROUTE_HOSPITAL', label: 'To hospital' },
  { status: 'COMPLETED', label: 'Completed' },
]

function stepIndex(request: EmergencyRequest): number {
  if (request.status === 'CANCELLED') return -1
  return TRIP_STEPS.findIndex((s) => s.status === request.status)
}

function formatElapsed(ms: number): string {
  const mins = Math.max(0, Math.floor(ms / 60000))
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  if (hrs < 24) return `${hrs} h ${rem} min`
  return `${Math.floor(hrs / 24)} d ${hrs % 24} h`
}

function TripLine({ request }: { request: EmergencyRequest }) {
  if (request.status === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-signal/40 bg-signal/10 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <X className="h-4 w-4 text-signal" aria-hidden /> Request cancelled
        </p>
        {request.cancelReason && (
          <p className="mt-1 text-xs text-slate">
            Reason: {request.cancelReason}
          </p>
        )}
      </div>
    )
  }

  const current = stepIndex(request)
  const finished = request.status === 'COMPLETED'

  // Done = green, current = amber (pulses 3x then stops), upcoming = hairline.
  return (
    <ol aria-label="Trip progress" className="grid grid-cols-6 gap-1.5 sm:gap-2">
      {TRIP_STEPS.map((step, i) => {
        const done = finished || i < current
        const active = !finished && i === current
        return (
          <li
            key={step.status}
            aria-current={active ? 'step' : undefined}
            className="min-w-0"
          >
            <span
              aria-hidden
              className={`block h-2 rounded-full ${
                done
                  ? 'bg-oxygen'
                  : active
                    ? 'bg-amber trip-dot-active'
                    : 'bg-hairline'
              }`}
            />
            <span
              className={`mt-2 block text-center text-[11px] leading-tight sm:text-xs ${
                done || active ? 'font-bold text-ink' : 'text-slate'
              }`}
            >
              {done && <Check className="mx-auto mb-0.5 h-3 w-3 text-oxygen" aria-hidden />}
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function DriverCard({ request }: { request: EmergencyRequest }) {
  if (!request.driver) return null
  return (
    <Card className="rounded-2xl p-5 border border-hairline">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Ambulance className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg text-ink">{request.driver.name}</p>
          <p className="text-xs text-slate">
            {request.ambulance
              ? `${request.ambulance.type} · ${request.ambulance.plateNumber}`
              : 'Ambulance on the way'}
          </p>
          {request.driver.phone && (
            <a
              href={`tel:${request.driver.phone}`}
              className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
            >
              <Phone className="h-3 w-3" /> {request.driver.phone}
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

function PayNowCard({ requestId }: { requestId: string }) {
  const initiate = useInitiatePayment()

  const pay = async () => {
    try {
      const { checkoutUrl } = await initiate.mutateAsync(requestId)
      window.location.assign(checkoutUrl)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Could not start payment',
      )
    }
  }

  return (
    <Card className="rounded-2xl p-5 border border-hairline space-y-3">
      <div>
        <p className="font-heading text-lg text-ink">Trip complete</p>
        <p className="text-xs text-slate mt-0.5">
          Settle the fare online — the amount is calculated after arrival.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={pay}
          disabled={initiate.isPending}
          className="h-11 flex-1"
        >
          {initiate.isPending ? 'Starting...' : 'Pay now'}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={
            <a href="/dashboard/payments" />
          }
          className="h-11 flex-1"
        >
          Payment history
        </Button>
      </div>
    </Card>
  )
}

function FeedbackForm({ requestId }: { requestId: string }) {
  const [hover, setHover] = useState(0)
  const submit = useSubmitFeedback()
  const existing = useRequestFeedback(requestId)
  const alreadySubmitted = (existing.data?.length ?? 0) > 0

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  })

  const currentRating = watch('rating')

  if (alreadySubmitted) {
    const fb = existing.data![0]
    return (
      <Card className="rounded-2xl p-5 border border-hairline">
        <p className="font-heading text-lg text-ink">Your feedback</p>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < fb.rating ? 'fill-amber text-amber' : 'text-slate'
              }`}
            />
          ))}
        </div>
        {fb.comment && <p className="mt-1 text-sm text-slate">{fb.comment}</p>}
      </Card>
    )
  }

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      await submit.mutateAsync({
        requestId,
        rating: data.rating,
        comment: data.comment?.trim() || undefined,
      })
      toast.success('Thanks for the feedback')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send feedback')
    }
  }

  return (
    <Card className="rounded-2xl p-5 border border-hairline">
      <p className="font-heading text-lg text-ink">Rate your trip</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onClick={() => setValue('rating', value, { shouldValidate: true })}
                className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={`Rate ${value} stars`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    value <= (hover || currentRating)
                      ? 'fill-amber text-amber'
                      : 'text-slate'
                  }`}
                />
              </button>
            )
          })}
        </div>
        {errors.rating && (
          <FieldError>{errors.rating.message}</FieldError>
        )}
        <Textarea
          placeholder="Anything to add? (optional)"
          {...register('comment')}
          className="mt-3 rounded-2xl border-hairline text-ink"
          rows={2}
        />
        {errors.comment && (
          <FieldError>{errors.comment.message}</FieldError>
        )}
        <Button
          type="submit"
          disabled={submit.isPending}
          className="mt-3 h-11 px-6"
        >
          {submit.isPending ? 'Sending...' : 'Send feedback'}
        </Button>
      </form>
    </Card>
  )
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const request = useRequestDetail(id, {
    refetchInterval: (query) =>
      ACTIVE_STATUSES.includes(query.state.data?.status as RequestStatus)
        ? 5000
        : false,
  })
  const cancel = useCancelRequest()
  const [cancelOpen, setCancelOpen] = useState(false)

  if (request.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <ListSkeleton rows={4} />
      </div>
    )
  }

  if (request.isError || !request.data) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          icon={<X className="h-8 w-8 text-slate" />}
          title="Trip not found"
          description="This emergency request either does not exist or belongs to another account."
          action={
            <Button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  const req = request.data
  const cancellable = ['PENDING', 'ASSIGNED', 'EN_ROUTE_PICKUP'].includes(
    req.status,
  )

  // Elapsed time: live for active trips, frozen at completion/cancellation.
  const startedAt = new Date(req.requestedAt).getTime()
  const endedAt = req.completedAt ? new Date(req.completedAt).getTime() : null
  const elapsedMs = (endedAt ?? now) - startedAt
  const elapsedLabel =
    req.status === 'COMPLETED'
      ? `Completed in ${formatElapsed(elapsedMs)}`
      : req.status === 'CANCELLED'
        ? `Cancelled after ${formatElapsed(elapsedMs)}`
        : `Elapsed ${formatElapsed(elapsedMs)}`

  const doCancel = async (reason: string) => {
    try {
      await cancel.mutateAsync({ id: req.id, reason: reason.trim() })
      toast.success('Request cancelled')
      setCancelOpen(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel')
    }
  }

  return (
    <>
      {/* Sticky bar — stays visible while the trip line scrolls by */}
      <div className="sticky top-14 z-20 -mx-4 mb-5 flex items-center gap-3 border-b border-hairline bg-gauze/95 px-4 py-2.5 backdrop-blur sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:border sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
          className="text-slate"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-base text-ink">
            {req.pickupAddress || 'Ambulance request'}
          </h1>
          <p className="text-xs text-slate tabular-nums">{elapsedLabel}</p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={req.priority} />
          <span className="text-xs text-slate">
            Requested {new Date(req.requestedAt).toLocaleString()}
          </span>
        </div>

        <MotionCard duration={300}>
          <Card className="rounded-2xl p-5 border border-hairline">
            <TripLine request={req} />
          </Card>
        </MotionCard>

        <DriverCard request={req} />

        <Card className="rounded-2xl p-5 border border-hairline space-y-3">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Navigation className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">
                Pickup
              </p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {req.pickupAddress || '—'}
              </p>
              <p className="text-xs text-slate tabular-nums">
                {req.pickupLat.toFixed(5)}, {req.pickupLng.toFixed(5)}
              </p>
            </div>
          </div>
          <div className="border-t border-hairline pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">
              Destination
            </p>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-ink mt-0.5 min-w-0">
                {req.destinationHospital
                  ? `${req.destinationHospital.name}${req.destinationHospital.address ? ` · ${req.destinationHospital.address}` : ''}`
                  : 'To be decided'}
              </p>
              {req.destinationHospital && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${req.destinationHospital.lat},${req.destinationHospital.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 text-xs font-bold text-brand hover:underline"
                >
                  Navigate <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </Card>

        {cancellable && (
          <Button
            variant="outline"
            onClick={() => setCancelOpen(true)}
            className="h-12 w-full border-2 border-signal! text-ink hover:bg-signal hover:text-white"
          >
            <X className="h-4 w-4 text-signal group-hover/button:text-white" aria-hidden /> Cancel request
          </Button>
        )}

        {req.status === 'COMPLETED' && <PayNowCard requestId={req.id} />}

        {req.status === 'COMPLETED' && <FeedbackForm requestId={req.id} />}

        {req.statusLogs && req.statusLogs.length > 0 && (
          <details className="rounded-2xl border border-hairline bg-paper px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
              Status history{' '}
              <span className="font-normal text-slate">
                ({req.statusLogs.length})
              </span>
            </summary>
            <ol className="mt-3 space-y-3">
              {[...req.statusLogs]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((log) => (
                  <li key={log.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
                    <div>
                      <p className="text-sm text-ink">
                        {log.toStatus.replaceAll('_', ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-slate">
                        {new Date(log.createdAt).toLocaleString()}
                        {log.note ? ` — ${log.note}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
          </details>
        )}

        <CancelModal
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onConfirm={doCancel}
          pending={cancel.isPending}
        />
      </div>
    </>
  )
}

function CancelModal({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  pending: boolean
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: '' },
  })

  const onSubmit = async (data: CancelFormData) => {
    await onConfirm(data.reason)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this request?</DialogTitle>
          <DialogDescription>
            The assigned unit will be released. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Textarea
              placeholder="Reason for cancelling (min 3 characters)"
              {...register('reason')}
              rows={3}
              className="border-hairline text-ink rounded-2xl"
            />
            {errors.reason && (
              <FieldError>{errors.reason.message}</FieldError>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              >
              Keep request
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {pending ? 'Cancelling...' : 'Cancel request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
