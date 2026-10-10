'use client'

import Link from 'next/link'
import { Building2, MapPin, Phone, Siren } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { Button } from '@/components/ui/button'
import { PublicFooter } from '@/components/public/public-footer'
import { NearbyHospitals } from '@/components/public/nearby-hospitals'
import { DEMO_HOSPITALS } from '@/data/demo-hospitals'
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
  const live = hospitals.data?.items ?? []

  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section className="space-y-3 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink">Hospitals</h1>
          <p className="text-slate">
            Partner hospitals you can pick as the destination for a trip. Nearest first.
          </p>
        </section>

        <NearbyHospitals limit={DEMO_HOSPITALS.length} showAllLink={false} />

        {hospitals.isLoading ? (
          <ListSkeleton rows={2} />
        ) : live.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">Live directory</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((h) => (
                <HospitalCard key={h.id} hospital={h} />
              ))}
            </div>
          </section>
        ) : (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-paper p-6">
            <div className="space-y-1">
              <h2 className="font-semibold text-ink">Want the live directory?</h2>
              <p className="text-sm text-slate">
                The list above is demo data. Sign in to see real partner hospitals and raise a request.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              className="bg-signal text-white hover:bg-signal/90"
            >
              <Siren className="h-4 w-4 mr-1" /> Sign in
            </Button>
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  )
}
