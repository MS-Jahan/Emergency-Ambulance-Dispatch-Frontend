'use client'

import { useEffect, useState } from 'react'
import { TripLine } from '@/components/trip-line'
import type { RequestStatus } from '@/types/api'

const DEMO_FLOW: RequestStatus[] = [
  'PENDING',
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'PICKED_UP',
  'EN_ROUTE_HOSPITAL',
  'COMPLETED',
]

const DEMO_COPY: Record<RequestStatus, { title: string; note: string }> = {
  PENDING: { title: 'Request received', note: 'Dispatchers see it instantly' },
  ASSIGNED: { title: 'Ambulance assigned', note: 'Nearest unit takes the trip' },
  EN_ROUTE_PICKUP: { title: 'On the way to you', note: 'Live position, live ETA' },
  PICKED_UP: { title: 'Patient picked up', note: 'Crew confirms on the app' },
  EN_ROUTE_HOSPITAL: { title: 'Rushing to hospital', note: 'Family can follow along' },
  COMPLETED: { title: 'Trip complete', note: 'Pay after arrival, get a receipt' },
  CANCELLED: { title: 'Request cancelled', note: 'Nothing to pay, start over any time' },
}

/**
 * Auto-plays a sample trip through the real status machine.
 * Used on the landing hero to show how a request progresses.
 */
export function TripLineDemo() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % (DEMO_FLOW.length + 1)),
      2200,
    )
    return () => clearInterval(id)
  }, [])

  const status = DEMO_FLOW[Math.min(step, DEMO_FLOW.length - 1)]
  const copy = DEMO_COPY[status]

  return (
    <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-slate">Live trip demo</span>
        <span className="text-xs text-slate tabular-nums">
          {String(Math.min(step + 1, DEMO_FLOW.length))}/{DEMO_FLOW.length}
        </span>
      </div>

      <TripLine status={status} />

      <div className="min-h-16">
        <p className="font-semibold text-ink">{copy.title}</p>
        <p className="text-sm text-slate">{copy.note}</p>
      </div>
    </div>
  )
}
