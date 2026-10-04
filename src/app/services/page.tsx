import { Activity, HeartPulse, Stethoscope } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'

const SERVICES = [
  {
    icon: <Stethoscope className="h-6 w-6 text-oxygen" />,
    name: 'Basic transport',
    price: '৳15',
    blurb:
      'Stretcher transport with a trained driver for stable patients — hospital transfers, discharges, routine runs.',
    eta: 'Widest availability',
  },
  {
    icon: <HeartPulse className="h-6 w-6 text-signal" />,
    name: 'ICU support',
    price: '৳35',
    blurb:
      'Ventilator-ready ambulance with monitoring equipment on board for patients who need continuous support in transit.',
    eta: 'Priority assignment',
  },
  {
    icon: <Activity className="h-6 w-6 text-amber-500" />,
    name: 'Cardiac care',
    price: '৳60',
    blurb:
      'Defibrillator and cardiac monitoring with the highest dispatch priority — chest pain and cardiac events go to the front of the queue.',
    eta: 'Highest priority',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-ink">Services</h1>
          <p className="text-slate leading-relaxed">
            Three vehicle classes cover the range from stable transport to
            critical care. Requests marked CRITICAL skip the queue entirely.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="bg-paper border border-hairline rounded-xl p-5 flex flex-col gap-3"
            >
              {s.icon}
              <h2 className="font-semibold text-ink">{s.name}</h2>
              <p className="text-2xl font-bold text-ink tabular-nums">
                {s.price}
                <span className="text-xs font-normal text-slate ml-1">per trip</span>
              </p>
              <p className="text-sm text-slate flex-1">{s.blurb}</p>
              <p className="text-xs font-medium text-oxygen">{s.eta}</p>
            </div>
          ))}
        </section>

        <section className="bg-paper border border-hairline rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-ink">Priority levels</h2>
          <div className="space-y-3 text-sm text-slate">
            <p>
              <span className="font-semibold text-signal">CRITICAL</span> —
              life-threatening. Assigned first, dispatched before anything else
              in the queue.
            </p>
            <p>
              <span className="font-semibold text-amber-500">HIGH</span> —
              urgent but stable. Ahead of normal requests in assignment order.
            </p>
            <p>
              <span className="font-semibold text-oxygen">NORMAL</span> —
              standard transport, first-come first-served.
            </p>
          </div>
          <p className="text-xs text-slate">
            Fares are charged once, after the trip completes, through Stripe
            checkout.
          </p>
        </section>
      </main>
      <footer className="border-t border-hairline bg-paper py-4">
        <p className="text-center text-xs text-slate">
          RapidAid — emergency ambulance dispatch
        </p>
      </footer>
    </div>
  )
}
