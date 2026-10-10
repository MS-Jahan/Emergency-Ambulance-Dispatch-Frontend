'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Search,
  Siren,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NearbyHospitals } from '@/components/public/nearby-hospitals'
import { ListSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { useHospitals } from '@/lib/hooks'
import { DEMO_HOSPITALS } from '@/data/demo-hospitals'
import type { Hospital } from '@/types/api'

function HospitalCard({
  hospital,
  onSelect,
}: {
  hospital: Hospital
  onSelect: (hospital: Hospital) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(hospital)}
      className="group w-full cursor-pointer rounded-2xl border border-hairline bg-paper p-5 text-left transition-all hover:border-brand hover:shadow-sm focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="flex items-start gap-3">
        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-oxygen" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-heading text-lg text-ink">{hospital.name}</h3>
            <span className="shrink-0 text-xs font-bold text-brand group-hover:underline">
              Details →
            </span>
          </div>
          <p className="line-clamp-1 text-sm text-slate">{hospital.address}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3" /> {hospital.phone}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <MapPin className="h-3 w-3" /> {hospital.lat.toFixed(4)},{' '}
          {hospital.lng.toFixed(4)}
        </span>
      </div>
    </button>
  )
}

export function HospitalsDirectoryView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const districtFilter = searchParams.get('district') ?? 'ALL'

  const hospitalsQuery = useHospitals()
  const liveItems = useMemo(
    () => hospitalsQuery.data?.items ?? [],
    [hospitalsQuery.data?.items],
  )
  // If backend returns hospitals, use them; otherwise provide the demo network
  const sourceHospitals = liveItems.length > 0 ? liveItems : DEMO_HOSPITALS

  // District filter: demo hospitals carry a district; live ones only an address,
  // so offer the district names that actually occur in a live address.
  const districts = useMemo(() => {
    const all = Array.from(new Set(DEMO_HOSPITALS.map((h) => h.district))).sort()
    if (liveItems.length === 0) return ['ALL', ...all]
    const present = all.filter((d) =>
      liveItems.some((h) => h.address.toLowerCase().includes(d.toLowerCase())),
    )
    return ['ALL', ...present]
  }, [liveItems])

  const filteredHospitals = useMemo(() => {
    return sourceHospitals.filter((h) => {
      if (q.trim()) {
        const query = q.toLowerCase()
        const matchesName = h.name.toLowerCase().includes(query)
        const matchesAddr = h.address.toLowerCase().includes(query)
        if (!matchesName && !matchesAddr) return false
      }
      if (districtFilter !== 'ALL') {
        const hDistrict = (h as { district?: string }).district ?? ''
        const matchesDistrict =
          hDistrict.toLowerCase() === districtFilter.toLowerCase() ||
          h.address.toLowerCase().includes(districtFilter.toLowerCase())
        if (!matchesDistrict) return false
      }
      return true
    })
  }, [sourceHospitals, q, districtFilter])

  const setQuery = (query: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      sp.set('q', query)
    } else {
      sp.delete('q')
    }
    router.push(`/hospitals?${sp.toString()}`)
  }

  const setDistrict = (d: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (!d || d === 'ALL') {
      sp.delete('district')
    } else {
      sp.set('district', d)
    }
    router.push(`/hospitals?${sp.toString()}`)
  }

  const isDemo = liveItems.length === 0
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)

  return (
    <div className="space-y-10">
      <NearbyHospitals
        limit={5}
        showAllLink={false}
        onSelectHospital={(h) => setSelectedHospital(h as unknown as Hospital)}
      />

      {/* Search and Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl text-ink">Hospital directory</h2>
            {isDemo && (
              <span className="rounded-full border border-amber/50 bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-ink">
                Demo data
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
                aria-hidden
              />
              <Input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hospital or area"
                className="h-10 bg-paper border-hairline text-ink pl-9 rounded-full"
                aria-label="Search hospitals"
              />
            </div>
            <Select value={districtFilter} onValueChange={setDistrict}>
              <SelectTrigger className="w-40 bg-paper border-hairline text-ink">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'ALL' ? 'All districts' : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hospitalsQuery.isLoading ? (
          <ListSkeleton rows={3} />
        ) : filteredHospitals.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6 text-slate" />}
            title="No hospitals found"
            description="Try modifying your search or district filter."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.map((h) => (
              <HospitalCard
                key={h.id}
                hospital={h}
                onSelect={setSelectedHospital}
              />
            ))}
          </div>
        )}
      </section>

      {/* Hospital detail drawer */}
      <Sheet
        open={!!selectedHospital}
        onOpenChange={(open) => !open && setSelectedHospital(null)}
      >
        {selectedHospital && (
          <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
            <SheetHeader className="p-0 space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-oxygen uppercase tracking-wider">
                <Building2 className="h-4 w-4" /> Partner Hospital
              </div>
              <SheetTitle className="text-2xl text-ink leading-snug font-heading">
                {selectedHospital.name}
              </SheetTitle>
              <SheetDescription className="text-sm text-slate">
                {selectedHospital.address}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Direct Contact & Location */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate">
                  Contact & Navigation
                </h4>
                <div className="space-y-2">
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-paper hover:bg-brand-soft hover:border-brand transition-colors text-ink font-bold text-sm"
                  >
                    <div className="h-9 w-9 rounded-full bg-brand-soft flex items-center justify-center text-brand shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs text-slate font-normal">Telephone (Tap to call)</span>
                      <span className="truncate">{selectedHospital.phone}</span>
                    </div>
                  </a>

                  {typeof selectedHospital.lat === 'number' && typeof selectedHospital.lng === 'number' && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-paper hover:bg-brand-soft hover:border-brand transition-colors text-ink font-bold text-sm"
                    >
                      <div className="h-9 w-9 rounded-full bg-brand-soft flex items-center justify-center text-brand shrink-0">
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs text-slate font-normal">Get Directions</span>
                        <span className="tabular-nums truncate font-mono text-xs">
                          {selectedHospital.lat.toFixed(5)}, {selectedHospital.lng.toFixed(5)}
                        </span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Extra attributes if present */}
              {Boolean((selectedHospital as { district?: string }).district || (selectedHospital as { beds?: number }).beds != null || (selectedHospital as { icu?: boolean }).icu) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate">
                    Facility Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(selectedHospital as { district?: string }).district && (
                      <div className="p-3 rounded-xl bg-gauze">
                        <span className="block text-slate">District</span>
                        <span className="font-bold text-ink">{(selectedHospital as { district?: string }).district}</span>
                      </div>
                    )}
                    {(selectedHospital as { beds?: number }).beds != null && (
                      <div className="p-3 rounded-xl bg-gauze">
                        <span className="block text-slate">Bed Capacity</span>
                        <span className="font-bold text-ink">{(selectedHospital as { beds?: number }).beds} beds</span>
                      </div>
                    )}
                    {(selectedHospital as { icu?: boolean }).icu && (
                      <div className="col-span-2 p-3 rounded-xl bg-oxygen/15 text-ink font-semibold flex items-center gap-2">
                        <Siren className="h-4 w-4 text-oxygen" />
                        ICU & Critical Care Units Available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primary action */}
              <div className="pt-2 border-t border-hairline space-y-2">
                <Button
                  nativeButton={false}
                  render={
                    <Link href={`/dashboard/requests/new?hospital=${encodeURIComponent(selectedHospital.id)}`} />
                  }
                  className="w-full h-12 bg-signal hover:bg-signal/90 text-white font-bold gap-2 text-base"
                >
                  <Siren className="h-5 w-5" />
                  Request an ambulance to this hospital
                </Button>
                <p className="text-center text-xs text-slate">
                  Prefills this hospital as the destination in the dispatch wizard
                </p>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* Emergency dispatch CTA banner */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-hairline bg-brand-soft p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl text-ink">Need an ambulance immediately?</h2>
          <p className="text-sm text-slate">
            Request an ambulance to any partner hospital in seconds. 24/7 coverage.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          className="h-11 px-6 bg-signal text-white hover:bg-signal/90"
        >
          <Siren className="h-4 w-4 mr-1" /> Request dispatch
        </Button>
      </section>
    </div>
  )
}
