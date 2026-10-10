import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Ambulance,
  BellRing,
  Building2,
  Activity,
  Check,
  CreditCard,
  HeartPulse,
  MapPin,
  Radio,
  Route,
  ShieldCheck,
  Siren,
  Smartphone,
  Stethoscope,
  Users,
} from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { TripLineDemo } from '@/components/public/trip-line-demo'
import { FeatureCard } from '@/components/public/feature-card'
import { MotionCard } from '@/components/motion-card'
import { Button } from '@/components/ui/button'
import { NearbyHospitals } from '@/components/public/nearby-hospitals'
import { LiveStats } from '@/components/public/live-stats'
import { AmbulanceFareBadge } from '@/components/public/ambulance-fare-badge'
import { DemoCoverage } from '@/components/public/demo-coverage'
import {
  PatientSpotlightPreview,
  DriverSpotlightPreview,
  DispatcherSpotlightPreview,
} from '@/components/public/role-previews'

export const metadata: Metadata = {
  title: {
    absolute: 'RapidAid — Emergency Ambulance Dispatch Platform',
  },
  description:
    'Instant emergency ambulance dispatch across Bangladesh. one form to request, live GPS tracking, and post-trip digital payments.',
  openGraph: {
    title: 'RapidAid — Emergency Ambulance Dispatch Platform',
    description:
      'Connecting patients, drivers, and hospitals with real-time emergency dispatch and response.',
  },
}

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
      'One short form to raise a request',
      'Live map with driver position and ETA',
      'Tap to call your driver any time',
      'Full trip history and digital receipts',
    ],
    cta: 'Request an ambulance',
    href: '/register',
    preview: <PatientSpotlightPreview />,
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
    preview: <DriverSpotlightPreview />,
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
    preview: <DispatcherSpotlightPreview />,
  },
]

const STATS = [
  { value: '1 form', label: 'to raise an emergency request' },
  { value: '6 stages', label: 'live trip line, from pending to completed' },
  { value: '3 types', label: 'basic, ICU and cardiac ambulances' },
  { value: '$0 advance', label: 'pay only after the trip completes' },
]

const AMBULANCE_TYPES = [
  {
    icon: <Stethoscope className="h-6 w-6" />,
    code: 'BASIC',
    name: 'Basic',
    fare: '$15',
    blurb: 'Stable patients, hospital transfers and routine runs with a trained driver.',
    tone: 'text-oxygen',
  },
  {
    icon: <HeartPulse className="h-6 w-6" />,
    code: 'ICU',
    name: 'ICU',
    fare: '$35',
    blurb: 'Ventilator-ready, with monitoring equipment on board for critical patients.',
    tone: 'text-brand',
  },
  {
    icon: <Activity className="h-6 w-6" />,
    code: 'CARDIAC',
    name: 'Cardiac',
    fare: '$60',
    blurb: 'Defibrillator and cardiac monitoring with the highest dispatch priority.',
    tone: 'text-amber',
  },
]

const FIRST_AID = [
  {
    q: 'CPR (no pulse, not breathing)',
    a: 'Call 999 or ask someone to call. Push hard and fast in the centre of the chest, about 100 to 120 pushes a minute. Keep going until help arrives.',
  },
  {
    q: 'Severe bleeding',
    a: 'Press firmly on the wound with a clean cloth. If it soaks through, add more cloth on top rather than lifting it. Keep pressing and call 999.',
  },
  {
    q: 'Burns',
    a: 'Cool the burn under cool running water for at least 20 minutes. Do not use ice, butter or creams. Cover loosely with a clean non-fluffy cloth.',
  },
  {
    q: 'Choking',
    a: 'Encourage coughing. If that fails, give up to 5 firm back blows between the shoulder blades, then up to 5 abdominal thrusts. Call 999 if it does not clear.',
  },
]


function HospitalsSection() {
  return (
    <section id="hospitals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8">
      <MotionCard className="max-w-2xl space-y-3">
        <h2 className="text-3xl sm:text-4xl text-ink">
          Nearest hospitals
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
        <section className="border-b border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <MotionCard className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-oxygen/10 px-3 py-1 text-xs font-semibold text-ink">
                <span className="h-2 w-2 rounded-full bg-oxygen" aria-hidden />
                Live dispatch board
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.02]">
                Help, on its way in minutes.
              </h1>
              <p className="text-lg text-slate max-w-prose">
                Share your location, tap once, and watch the nearest ambulance
                come to you. Three taps to request, and you pay only after you
                arrive.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/register" />}
                  size="lg"
                  className="h-14 px-8 bg-signal text-white hover:bg-signal/90 text-base font-semibold"
                >
                  <Siren className="h-5 w-5 mr-2" /> Request an ambulance
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/login" />}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base"
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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((st) => (
              <div key={st.label} className="rounded-2xl border border-hairline bg-paper p-5">
                <dt className="font-heading text-3xl sm:text-4xl tabular-nums text-ink">{st.value}</dt>
                <dd className="mt-1 text-sm text-slate">{st.label}</dd>
              </div>
            ))}
          </dl>
          <LiveStats />
        </section>

        <HospitalsSection />

        {/* Ambulance types */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 space-y-8">
          <MotionCard className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl text-ink">Choose the right ambulance</h2>
            <p className="text-slate">
              Three vehicle classes with a flat fare per trip, charged once
              after the trip completes.
            </p>
          </MotionCard>
          <ul className="grid gap-4 sm:grid-cols-3">
            {AMBULANCE_TYPES.map((t, i) => (
              <MotionCard
                as="li"
                key={t.code}
                delay={i * 100}
                className="flex flex-col gap-3 rounded-2xl border border-hairline bg-paper p-6"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft ${t.tone}`}>
                  {t.icon}
                </span>
                <h3 className="text-2xl text-ink">{t.name}</h3>
                <p className="text-sm text-slate flex-1">{t.blurb}</p>
                <p className="font-heading text-2xl tabular-nums text-ink">
                  <AmbulanceFareBadge
                    type={t.code as 'BASIC' | 'ICU' | 'CARDIAC'}
                    fallback={t.fare}
                  />
                </p>
              </MotionCard>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="bg-paper border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
            <MotionCard className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl text-ink">
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
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                      {step.icon}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-slate">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg text-ink">{step.title}</h3>
                  <p className="text-sm text-slate">{step.description}</p>
                </MotionCard>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
          <MotionCard className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl text-ink">
              One system, three perspectives
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
                    <span className="text-brand font-semibold">{role.role}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl text-ink">
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
                    className="h-10 px-5"
                  >
                    {role.cta}
                  </Button>
                </div>

                <div
                  className="rounded-3xl border border-hairline bg-gauze p-5 sm:p-8"
                >
                  {role.preview}
                </div>
              </MotionCard>
            ))}
          </div>
        </section>

        <DemoCoverage />

        {/* First aid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl text-ink">First aid while you wait</h2>
            <p className="text-slate max-w-sm">
              General guidance only. Call 999 or request an ambulance first;
              this is not a substitute for emergency services.
            </p>
          </div>
          <div className="space-y-3">
            {FIRST_AID.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-hairline bg-paper px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden className="text-xl leading-none text-brand transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="flex flex-col gap-6 rounded-3xl bg-brand p-8 sm:p-12 text-brand-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl">Be ready before you need us.</h2>
              <p className="opacity-90">No credit card. No subscription.</p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/register" />}
              size="lg"
              className="h-12 px-7 bg-ink text-gauze hover:bg-ink/90 text-base shrink-0"
            >
              Create free account
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
