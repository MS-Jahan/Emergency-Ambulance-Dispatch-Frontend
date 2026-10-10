import type { Metadata } from 'next'
import { Activity, HeartPulse, Stethoscope } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { AmbulanceFareBadge } from '@/components/public/ambulance-fare-badge'
import type { AmbulanceType } from '@/types/api'

export const metadata: Metadata = {
  title: 'Emergency Medical Services & Fleet Classes',
  description:
    'Basic transport, ICU ventilators, and Cardiac care ambulances. Dynamic fleet matching based on emergency triage priority.',
  openGraph: {
    title: 'Emergency Medical Services & Fleet Classes',
    description:
      'Three specialized ambulance tiers for emergency transit, hospital transfers, and critical care.',
  },
}

// Marketing content rarely changes — rebuild the static HTML hourly.
export const revalidate = 3600

const SERVICES: {
  tone: string
  icon: React.ReactNode
  name: string
  type: AmbulanceType
  price: string
  blurb: string
  eta: string
}[] = [
  {
    tone: 'text-oxygen',
    icon: <Stethoscope className="h-6 w-6" />,
    name: 'Basic transport',
    type: 'BASIC',
    price: '$15',
    blurb:
      'Stretcher transport with a trained driver for stable patients — hospital transfers, discharges, routine runs.',
    eta: 'Widest availability',
  },
  {
    tone: 'text-brand',
    icon: <HeartPulse className="h-6 w-6" />,
    name: 'ICU support',
    type: 'ICU',
    price: '$35',
    blurb:
      'Ventilator-ready ambulance with monitoring equipment on board for patients who need continuous support in transit.',
    eta: 'Priority assignment',
  },
  {
    tone: 'text-amber',
    icon: <Activity className="h-6 w-6" />,
    name: 'Cardiac care',
    type: 'CARDIAC',
    price: '$60',
    blurb:
      'Defibrillator and cardiac monitoring with the highest dispatch priority — chest pain and cardiac events go to the front of the queue.',
    eta: 'Highest priority',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section className="space-y-3">
          <h1 className="text-4xl sm:text-5xl text-ink max-w-2xl">Three ambulances. One right choice.</h1>
          <p className="text-slate leading-relaxed max-w-2xl">
            Three vehicle classes cover the range from stable transport to
            critical care. Requests marked CRITICAL skip the queue entirely.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="bg-paper border border-hairline rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft ${s.tone}`}>
                {s.icon}
              </span>
              <h2 className="text-2xl text-ink">{s.name}</h2>
              <p className="font-heading text-3xl text-ink tabular-nums">
                <AmbulanceFareBadge type={s.type} fallback={s.price} suffix="per trip" />
              </p>
              <p className="text-sm text-slate flex-1">{s.blurb}</p>
              <p className="text-xs font-semibold text-ink">{s.eta}</p>
            </div>
          ))}
        </section>

        <section className="bg-paper border border-hairline rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl text-ink">Priority levels</h2>
          <div className="space-y-3 text-sm text-slate">
            <p>
              <span className="font-semibold text-signal">CRITICAL</span>:
              life-threatening. Assigned first, dispatched before anything else
              in the queue.
            </p>
            <p>
              <span className="font-semibold text-amber">HIGH</span>:
              urgent but stable. Ahead of normal requests in assignment order.
            </p>
            <p>
              <span className="font-semibold text-oxygen">NORMAL</span>:
              standard transport, first-come first-served.
            </p>
          </div>
          <p className="text-xs text-slate">
            Fares are charged once, after the trip completes, through Stripe
            checkout.
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
