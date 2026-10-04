import Link from 'next/link'
import { Siren } from 'lucide-react'

const HERO_POINTS = [
  'Nearest ambulance assigned in seconds',
  'Live map — watch it come to you',
  'Pay only after you arrive',
]

/**
 * Shared two-column auth shell: brand hero on the left, form on the right.
 * Mobile collapses to a compact brand header above the form.
 */
export function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gauze">
      {/* Left: hero (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-oxygen to-ink text-paper p-10 xl:p-16">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Siren className="h-6 w-6" />
          RapidAid
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
            Ambulance in seconds
          </h1>
          <p className="text-lg text-paper/80">
            Emergency dispatch, 24/7. No phone queue, no repeating your address.
          </p>
          <ul className="space-y-3 pt-4">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-paper/90">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-paper/70 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-paper/60">
          Free to request. You pay after the trip, never before.
        </p>
      </div>

      {/* Right: form column */}
      <div className="flex flex-col">
        {/* Compact brand header (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <Siren className="h-5 w-5 text-signal" />
            RapidAid
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
