'use client'

import Link from 'next/link'
import { Building2, MapPin, Phone, Siren } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useHospitals } from '@/lib/hooks'
import type { Hospital } from '@/types/api'

function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <div className="bg-paper border border-hairline rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-oxygen shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h2 className="font-semibold text-ink truncate">{hospital.name}</h2>
          <p className="text-sm text-slate">{hospital.address}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3" /> {hospital.phone}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <MapPin className="h-3 w-3" /> {hospital.lat.toFixed(4)},{' '}
          {hospital.lng.toFixed(4)}
        </span>
      </div>
    </div>
  )
}

export default function HospitalsPage() {
  const hospitals = useHospitals()

  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-ink">Hospitals</h1>
          <p className="text-slate">
            Partner hospitals you can pick as the destination for a trip.
          </p>
        </section>

        {hospitals.isLoading ? (
          <ListSkeleton rows={4} />
        ) : hospitals.data && hospitals.data.items.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals.data.items.map((h) => (
              <HospitalCard key={h.id} hospital={h} />
            ))}
          </section>
        ) : (
          <section className="bg-paper border border-hairline rounded-xl p-8">
            <EmptyState
              icon={<Building2 className="h-6 w-6 text-slate" />}
              title="The live directory needs an account"
              description="Hospital data comes from the dispatch service, which is only open to signed-in users. Create an account or sign in to browse hospitals and raise a request."
            />
            <div className="mt-4 flex justify-center">
              <Button
                render={<Link href="/login" />}
                className="bg-signal text-white hover:bg-signal/90"
              >
                <Siren className="h-4 w-4 mr-1" /> Sign in
              </Button>
            </div>
          </section>
        )}
      </main>
      <footer className="border-t border-hairline bg-paper py-4">
        <p className="text-center text-xs text-slate">
          RapidAid — emergency ambulance dispatch
        </p>
      </footer>
    </div>
  )
}
