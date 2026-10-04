'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Ambulance,
  ArrowLeft,
  Check,
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
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { ListSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import {
  useCancelRequest,
  useRequestDetail,
  useRequestFeedback,
  useSubmitFeedback,
} from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { EmergencyRequest, RequestStatus } from '@/types/api'

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

function TripLine({ request }: { request: EmergencyRequest }) {
  if (request.status === 'CANCELLED') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Request cancelled</p>
        {request.cancelReason && (
          <p className="text-xs text-red-600 mt-1">
            Reason: {request.cancelReason}
          </p>
        )}
      </div>
    )
  }

  const current = stepIndex(request)

  return (
    <ol className="flex items-start">
      {TRIP_STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={`h-0.5 flex-1 ${
                  i === 0 ? 'opacity-0' : done || active ? 'bg-signal' : 'bg-hairline'
                }`}
              />
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? 'bg-signal text-white ring-4 ring-signal/20'
                    : done
                      ? 'bg-signal text-white'
                      : 'border border-hairline bg-gauze text-slate'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={`h-0.5 flex-1 ${
                  i === TRIP_STEPS.length - 1
                    ? 'opacity-0'
                    : done
                      ? 'bg-signal'
                      : 'bg-hairline'
                }`}
              />
            </div>
            <span
              className={`mt-1.5 text-center text-[11px] leading-tight ${
                active ? 'font-semibold text-ink' : 'text-slate'
              }`}
            >
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
    <Card className="p-4 border border-hairline">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-oxygen/10 text-oxygen">
          <Ambulance className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{request.driver.name}</p>
          <p className="text-xs text-slate">
            {request.ambulance
              ? `${request.ambulance.type} · ${request.ambulance.plateNumber}`
              : 'Ambulance on the way'}
          </p>
          {request.driver.phone && (
            <a
              href={`tel:${request.driver.phone}`}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-oxygen hover:underline"
            >
              <Phone className="h-3 w-3" /> {request.driver.phone}
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

function FeedbackForm({ requestId }: { requestId: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const submit = useSubmitFeedback()
  const existing = useRequestFeedback(requestId)
  const alreadySubmitted = (existing.data?.length ?? 0) > 0

  if (alreadySubmitted) {
    const fb = existing.data![0]
    return (
      <Card className="p-4 border border-hairline">
        <p className="text-sm font-medium text-ink">Your feedback</p>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < fb.rating ? 'fill-amber text-amber' : 'text-slate-300'
              }`}
            />
          ))}
        </div>
        {fb.comment && <p className="mt-1 text-sm text-slate">{fb.comment}</p>}
      </Card>
    )
  }

  const send = async () => {
    if (rating === 0) {
      toast.error('Pick a star rating first')
      return
    }
    try {
      await submit.mutateAsync({
        requestId,
        rating,
        comment: comment.trim() || undefined,
      })
      toast.success('Thanks for the feedback')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send feedback')
    }
  }

  return (
    <Card className="p-4 border border-hairline">
      <p className="text-sm font-medium text-ink">Rate your trip</p>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1
          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHover(value)}
              onClick={() => setRating(value)}
              className="cursor-pointer"
              aria-label={`Rate ${value} stars`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  value <= (hover || rating)
                    ? 'fill-amber text-amber'
                    : 'text-slate-300'
                }`}
              />
            </button>
          )
        })}
      </div>
      <Textarea
        placeholder="Anything to add? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mt-3 bg-paper border-hairline text-ink"
        rows={2}
      />
      <Button
        type="button"
        onClick={send}
        disabled={submit.isPending}
        className="mt-3 bg-ink text-paper hover:bg-slate-800"
      >
        {submit.isPending ? 'Sending...' : 'Send feedback'}
      </Button>
    </Card>
  )
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const request = useRequestDetail(id, {
    refetchInterval: (query) =>
      ACTIVE_STATUSES.includes(query.state.data?.status as RequestStatus)
        ? 5000
        : false,
  })
  const cancel = useCancelRequest()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  if (request.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <ListSkeleton rows={4} />
      </div>
    )
  }

  if (request.isError || !request.data) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<X className="h-6 w-6 text-slate" />}
          title="Request not found"
          description="It may have been removed or you may not have access."
        />
      </div>
    )
  }

  const req = request.data
  const cancellable = ['PENDING', 'ASSIGNED', 'EN_ROUTE_PICKUP'].includes(
    req.status,
  )

  const doCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Tell us why you are cancelling')
      return
    }
    try {
      await cancel.mutateAsync({ id: req.id, reason: cancelReason.trim() })
      toast.success('Request cancelled')
      setCancelOpen(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
          className="text-slate hover:bg-gauze"
          aria-label="Back to requests"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-ink truncate">
            {req.pickupAddress || 'Ambulance request'}
          </h1>
          <p className="text-xs text-slate">
            {new Date(req.requestedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={req.status} />
        <PriorityBadge priority={req.priority} />
      </div>

      <Card className="p-5 border border-hairline">
        <TripLine request={req} />
      </Card>

      <DriverCard request={req} />

      <Card className="p-5 border border-hairline space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            Pickup
          </p>
          <p className="text-sm text-ink mt-0.5">
            {req.pickupAddress || '—'}
          </p>
          <p className="text-xs text-slate tabular-nums">
            {req.pickupLat.toFixed(5)}, {req.pickupLng.toFixed(5)}
          </p>
        </div>
        <div className="border-t border-hairline pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            Destination
          </p>
          <p className="text-sm text-ink mt-0.5">
            {req.destinationHospital
              ? `${req.destinationHospital.name}${req.destinationHospital.address ? ` · ${req.destinationHospital.address}` : ''}`
              : 'To be decided'}
          </p>
        </div>
      </Card>

      {cancellable && (
        <Button
          variant="outline"
          onClick={() => setCancelOpen(true)}
          className="w-full border-red-200 text-signal hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" /> Cancel request
        </Button>
      )}

      {req.status === 'COMPLETED' && (
        <FeedbackForm requestId={req.id} />
      )}

      {req.statusLogs && req.statusLogs.length > 0 && (
        <Card className="p-5 border border-hairline">
          <p className="text-sm font-semibold text-ink mb-3">Status history</p>
          <ol className="space-y-3">
            {req.statusLogs.map((log) => (
              <li key={log.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-signal" />
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
        </Card>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
            <DialogDescription>
              The assigned unit will be released. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for cancelling"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            className="bg-paper border-hairline text-ink"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              className="border-hairline text-ink hover:bg-gauze"
            >
              Keep request
            </Button>
            <Button
              onClick={doCancel}
              disabled={cancel.isPending}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {cancel.isPending ? 'Cancelling...' : 'Cancel request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
