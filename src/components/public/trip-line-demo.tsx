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

  const progress = Math.min(step, DEMO_FLOW.length - 1) / (DEMO_FLOW.length - 1)

  return (
    <div className="bg-paper border border-hairline rounded-3xl p-4 sm:p-5 space-y-5">
      <div
        className="relative overflow-hidden rounded-2xl border border-hairline bg-gauze"
        role="img"
        aria-label="Illustration of an ambulance following a route to a hospital"
      >
        <svg viewBox="0 0 400 200" className="block w-full h-auto" aria-hidden>
          <path
            d="M30 165 C 110 165, 120 60, 200 85 S 310 140, 370 35"
            fill="none"
            className="stroke-hairline"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d="M30 165 C 110 165, 120 60, 200 85 S 310 140, 370 35"
            fill="none"
            className="stroke-brand"
            strokeWidth="3" strokeDasharray="7 8"
            strokeLinecap="round"
          />
          <circle cx="30" cy="165" r="9" className="fill-oxygen" />
          <circle cx="370" cy="35" r="9" className="fill-signal" />
          <circle
            r="11"
            className="fill-brand stroke-paper"
            strokeWidth="3"
            style={{
              offsetPath: "path('M30 165 C 110 165, 120 60, 200 85 S 310 140, 370 35')",
              offsetDistance: `${progress * 100}%`,
              transition: 'offset-distance 1.8s ease-in-out',
            }}
          />
        </svg>
        <span className="absolute left-3 top-3 rounded-full border border-amber/50 bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink">
          Demo
        </span>
        <span className="absolute right-3 bottom-3 rounded-full bg-paper px-3 py-1 text-xs font-medium tabular-nums text-slate border border-hairline">
          Step {Math.min(step + 1, DEMO_FLOW.length)} of {DEMO_FLOW.length}
        </span>
      </div>

      <TripLine status={status} />

      <div className="min-h-14 px-1">
        <p className="font-heading text-xl text-ink">{copy.title}</p>
        <p className="text-sm text-slate">{copy.note}</p>
      </div>
    </div>
  )
}
