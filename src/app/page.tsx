'use client'

import Link from 'next/link'
import {
  Ambulance,
  BellRing,
  Building2,
  Check,
  CreditCard,
  HeartPulse,
  MapPin,
  Radio,
  Route,
  ShieldCheck,
  Siren,
  Smartphone,
  Users,
} from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { TripLineDemo } from '@/components/public/trip-line-demo'
import { FeatureCard } from '@/components/public/feature-card'
import { MotionCard } from '@/components/motion-card'
import { Button } from '@/components/ui/button'
import { NearbyHospitals } from '@/components/public/nearby-hospitals'
import { DEMO_HOSPITALS } from '@/data/demo-hospitals'

const HOW_IT_WORKS = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Pin your location',
    description: 'One tap on the map, or use your current position.',
  },
  {
    icon: <Radio className="h-5 w-5" />,
    title: 'We dispatch',
    description: 'The nearest available ambulance takes your request.',
  },
  {
    icon: <Ambulance className="h-5 w-5" />,
    title: 'Ambulance en route',
    description: 'Watch it move on the map with a live ETA.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Delivered to hospital',
    description: 'Pay after arrival. Receipt stays in the app.',
  },
]

const FEATURES = [
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Request in seconds',
    description:
      'Three taps: location, urgency, confirm. No phone queues, no repeating your address.',
    accentColor: 'signal' as const,
  },
  {
    icon: <Route className="h-6 w-6" />,
    title: 'Track the trip line',
    description:
      'Every request moves through a clear status line — from pending to completed, live.',
    accentColor: 'oxygen' as const,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Built for drivers',
    description:
      'One big button per step, designed for gloves, glare and one-handed use in the cab.',
    accentColor: 'amber' as const,
  },
  {
    icon: <Radio className="h-6 w-6" />,
    title: 'Dispatcher console',
    description:
      'A dense board of pending, active and done trips. Assign the right ambulance fast.',
    accentColor: 'ink' as const,
  },
  {
    icon: <BellRing className="h-6 w-6" />,
    title: 'Real-time updates',
    description:
      'Every status change pulses through instantly — assignment, pickup, hospital arrival.',
    accentColor: 'oxygen' as const,
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Pay after arrival',
    description:
      'Nothing to pay up front. Settle online once the trip is safely completed.',
    accentColor: 'amber' as const,
  },
]

const ROLES = [
  {
    icon: <HeartPulse className="h-6 w-6 text-signal" />,
    accent: 'signal',
    role: 'For patients',
    headline: 'Request and track',
    benefits: [
      'Ambulance in under 30 seconds to request',
      'Live map with driver position and ETA',
      'Tap to call your driver any time',
      'Full trip history and digital receipts',
    ],
    cta: 'Request an ambulance',
    href: '/register',
  },
  {
    icon: <Ambulance className="h-6 w-6 text-amber" />,
    accent: 'amber',
    role: 'For drivers',
    headline: 'Work flexibly',
    benefits: [
      'Go online and offline with one switch',
      'One glanceable action button per trip step',
      'Tap-to-call and tap-to-navigate on every trip',
      'Clear trip history for the day',
    ],
    cta: 'Drive with us',
    href: '/register',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-oxygen" />,
    accent: 'oxygen',
    role: 'For dispatchers',
    headline: 'Dispatch smartly',
    benefits: [
      'Three-column board: pending, in progress, done',
      'Nearby ambulances ranked by distance',
      'Assign or reassign in two clicks',
      'Full audit log of every action',
    ],
    cta: 'Open the console',
    href: '/register',
  },
]

const STATS = [
  { value: '< 3 min', label: 'median dispatch time' },
  { value: '20', label: 'hospitals in the network' },
  { value: '24/7', label: 'dispatcher coverage' },
  { value: '3 taps', label: 'to raise a request' },
]

const DISTRICTS = Array.from(new Set(DEMO_HOSPITALS.map((h) => h.district)))

function HospitalsSection() {
  return (
    <section id="hospitals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8">
      <MotionCard className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-oxygen">Hospital network</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Top hospitals around you
        </h2>
        <p className="text-slate">
          Ranked by distance from your approximate location. Allow location access for exact results.
        </p>
      </MotionCard>
      <NearbyHospitals limit={5} />
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gauze">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gauze to-paper border-b border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <MotionCard className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.02]">
                Ambulance in seconds
              </h1>
              <p className="text-lg text-slate max-w-prose">
                Request help with three taps, watch the nearest ambulance come
                to you, and pay only after you arrive. No phone queue. 24/7.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/register" />}
                  size="lg"
                  className="h-14 px-8 bg-signal text-white hover:bg-signal/90 text-base"
                >
                  <Siren className="h-5 w-5 mr-2" /> Request now
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/login" />}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-ink/40 bg-transparent text-ink hover:bg-muted text-base"
                >
                  Sign in
                </Button>
              </div>
              <p className="text-sm text-slate">
                Free to request. You pay after the trip, never before.
              </p>
            </MotionCard>

            <MotionCard delay={150}>
              <TripLineDemo />
            </MotionCard>
          </div>
        </section>

        <section className="border-b border-hairline bg-paper">
          <dl className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((st) => (
              <div key={st.label}>
                <dt className="text-3xl font-bold tabular-nums tracking-tight text-ink">{st.value}</dt>
                <dd className="text-sm text-slate">{st.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <HospitalsSection />

        {/* How it works */}
        <section className="bg-paper border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
            <MotionCard className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                How dispatch works
              </h2>
              <p className="text-slate">
                The same four steps every time. Each one moves the trip line
                forward — you always know where your request stands.
              </p>
            </MotionCard>

            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step, i) => (
                <MotionCard
                  as="li"
                  key={step.title}
                  delay={i * 100}
                  className="relative space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gauze border border-hairline text-ink">
                      {step.icon}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-slate">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="text-sm text-slate">{step.description}</p>
                </MotionCard>
              ))}
            </ol>
          </div>
        </section>

        {/* Features grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
          <MotionCard className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              One system, three seats
            </h2>
            <p className="text-slate">
              Patients, drivers and dispatchers share one state machine. When a
              status changes, every screen knows.
            </p>
          </MotionCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <MotionCard key={f.title} delay={(i % 3) * 100}>
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                  accentColor={f.accentColor}
                />
              </MotionCard>
            ))}
          </div>
        </section>

        {/* Role spotlights */}
        <section className="bg-paper border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
            {ROLES.map((role, i) => (
              <MotionCard
                key={role.role}
                delay={100}
                className={`grid lg:grid-cols-2 gap-10 items-center ${
                  i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate">
                    {role.icon}
                    <span>{role.role}</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-ink">
                    {role.headline}
                  </h2>
                  <ul className="space-y-2.5">
                    {role.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ink">
                        <Check className="h-4 w-4 mt-0.5 text-oxygen shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    nativeButton={false}
                    render={<Link href={role.href} />}
                    variant="outline"
                    className="border-ink/40 bg-transparent text-ink hover:bg-muted"
                  >
                    {role.cta}
                  </Button>
                </div>

                <div
                  className={`rounded-lg border border-hairline bg-gauze p-6 sm:p-8 ${
                    role.accent === 'signal'
                      ? 'border-l-4 border-l-signal'
                      : role.accent === 'amber'
                        ? 'border-l-4 border-l-amber'
                        : 'border-l-4 border-l-oxygen'
                  }`}
                >
                  <TripLineDemo />
                </div>
              </MotionCard>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Covering districts nationwide</h2>
          <p className="text-slate max-w-2xl">Demo network spans {DISTRICTS.length} districts, from Dhaka to Sylhet to Khulna.</p>
          <ul className="flex flex-wrap gap-2">
            {DISTRICTS.map((d) => (
              <li key={d} className="rounded-full border border-hairline bg-paper px-3.5 py-1.5 text-sm text-ink">{d}</li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-[#0D1B2A]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready when seconds matter
            </h2>
            <p className="text-white/70 text-lg">
              No credit card. No subscription. Available 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/register" />}
                size="lg"
                className="h-14 px-8 bg-signal text-white hover:bg-signal/90 text-base"
              >
                <Siren className="h-5 w-5 mr-2" /> Request now
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/login" />}
                size="lg"
                variant="outline"
                className="h-14 px-8 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white text-base"
              >
                Sign in
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
