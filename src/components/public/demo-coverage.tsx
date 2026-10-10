'use client'

import { DEMO_HOSPITALS } from '@/data/demo-hospitals'
import { useHospitals } from '@/lib/hooks'

const DISTRICTS = Array.from(new Set(DEMO_HOSPITALS.map((h) => h.district)))

/** District chips for the demo network. Hidden once the live directory has hospitals. */
export function DemoCoverage() {
  const { data, isLoading } = useHospitals()
  if (isLoading || (data?.items.length ?? 0) > 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-6">
      <h2 className="text-3xl sm:text-4xl text-ink">Covering districts nationwide</h2>
      <p className="text-slate max-w-2xl">
        Demo network spans {DISTRICTS.length} districts across Bangladesh, from Dhaka to
        Chattogram, Sylhet, and Khulna.
      </p>
      <ul className="flex flex-wrap gap-2">
        {DISTRICTS.map((d) => (
          <li key={d} className="rounded-full border border-hairline bg-paper px-4 py-1.5 text-sm text-ink">
            {d}
          </li>
        ))}
      </ul>
    </section>
  )
}
