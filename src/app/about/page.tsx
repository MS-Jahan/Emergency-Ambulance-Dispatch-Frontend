import type { Metadata } from 'next'
import Link from 'next/link'

import { Clock3, HeartPulse, MapPin, Radio, Siren } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Our Mission',
  description:
    'Learn about RapidAid — our mission to connect patients, drivers, and hospitals with fast and reliable smart dispatching.',
  openGraph: {
    title: 'About Our Mission',
    description:
      'Faster emergency response through intelligent triage, live GPS dispatch, and transparent medical transit.',
  },
}

// Marketing content rarely changes — rebuild the static HTML hourly.
export const revalidate = 3600

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <section className="space-y-4">
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            About RapidAid
          </span>
          <h1 className="text-4xl sm:text-5xl text-ink max-w-3xl">
            Every minute belongs to the patient.
          </h1>
          <p className="text-slate leading-relaxed max-w-2xl">
            RapidAid is a city ambulance dispatch service. One tap sends your
            location to the nearest available unit, the dispatcher sees it the
            moment it lands, and you watch the ambulance drive toward you on a
            live map. No phone tree, no guessing if anyone is coming.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="bg-paper border border-hairline rounded-2xl p-6 space-y-2">
            <MapPin className="h-6 w-6 text-brand" />
            <h2 className="text-xl text-ink">Location first</h2>
            <p className="text-sm text-slate">
              The request carries your exact pickup point, so drivers navigate
              to you instead of asking where you are.
            </p>
          </div>
          <div className="bg-paper border border-hairline rounded-2xl p-6 space-y-2">
            <Radio className="h-6 w-6 text-oxygen" />
            <h2 className="text-xl text-ink">Live status</h2>
            <p className="text-sm text-slate">
              Every step — assigned, en route, picked up, delivered — updates
              in real time for you and the dispatcher.
            </p>
          </div>
          <div className="bg-paper border border-hairline rounded-2xl p-6 space-y-2">
            <HeartPulse className="h-6 w-6 text-amber" />
            <h2 className="text-xl text-ink">Right vehicle</h2>
            <p className="text-sm text-slate">
              Basic transport, ICU support, or cardiac care — the fleet is
              matched to what the trip actually needs.
            </p>
          </div>
        </section>

        <section className="bg-paper border border-hairline rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl text-ink">How a trip works</h2>
          <ol className="space-y-3 text-sm text-slate">
            {[
              'You raise a request with your pickup point and priority.',
              'A dispatcher assigns the closest available ambulance.',
              'The driver heads to you — you watch the trip live.',
              'You are taken to a hospital of your choice and pay online.',
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="shrink-0 h-7 w-7 rounded-full bg-brand-soft text-brand text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-brand text-brand-foreground rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6" />
            <p className="font-heading text-xl">
              Emergencies do not wait, neither should dispatch.
            </p>
          </div>
          <Button
            nativeButton={false} render={<Link href="/register" />}
            className="h-11 px-6 bg-signal text-white hover:bg-signal/90 shrink-0"
          >
            <Siren className="h-4 w-4 mr-1" /> Get started
          </Button>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
