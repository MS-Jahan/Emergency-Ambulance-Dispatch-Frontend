import Link from 'next/link'
import { Clock3, HeartPulse, MapPin, Radio, Siren } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold text-ink">
            An ambulance, minutes away, not an hour
          </h1>
          <p className="text-slate leading-relaxed">
            RapidAid is a city ambulance dispatch service. One tap sends your
            location to the nearest available unit, the dispatcher sees it the
            moment it lands, and you watch the ambulance drive toward you on a
            live map. No phone tree, no guessing if anyone is coming.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="bg-paper border border-hairline rounded-xl p-5 space-y-2">
            <MapPin className="h-5 w-5 text-signal" />
            <h2 className="font-semibold text-ink">Location first</h2>
            <p className="text-sm text-slate">
              The request carries your exact pickup point, so drivers navigate
              to you instead of asking where you are.
            </p>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-5 space-y-2">
            <Radio className="h-5 w-5 text-oxygen" />
            <h2 className="font-semibold text-ink">Live status</h2>
            <p className="text-sm text-slate">
              Every step — assigned, en route, picked up, delivered — updates
              in real time for you and the dispatcher.
            </p>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-5 space-y-2">
            <HeartPulse className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-ink">Right vehicle</h2>
            <p className="text-sm text-slate">
              Basic transport, ICU support, or cardiac care — the fleet is
              matched to what the trip actually needs.
            </p>
          </div>
        </section>

        <section className="bg-paper border border-hairline rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-ink">How a trip works</h2>
          <ol className="space-y-3 text-sm text-slate">
            {[
              'You raise a request with your pickup point and priority.',
              'A dispatcher assigns the closest available ambulance.',
              'The driver heads to you — you watch the trip live.',
              'You are taken to a hospital of your choice and pay online.',
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="shrink-0 h-6 w-6 rounded-full bg-ink text-paper text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-ink text-paper rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6" />
            <p className="text-sm">
              Emergencies do not wait — neither should dispatch.
            </p>
          </div>
          <Button
            render={<Link href="/register" />}
            className="bg-signal text-white hover:bg-signal/90 shrink-0"
          >
            <Siren className="h-4 w-4 mr-1" /> Get started
          </Button>
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
