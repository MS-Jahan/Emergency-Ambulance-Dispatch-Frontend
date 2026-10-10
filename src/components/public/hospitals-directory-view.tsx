'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Phone, Search, Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NearbyHospitals } from '@/components/public/nearby-hospitals'
import { ListSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { useHospitals } from '@/lib/hooks'
import { DEMO_HOSPITALS } from '@/data/demo-hospitals'
import type { Hospital } from '@/types/api'

function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <div className="bg-paper border border-hairline rounded-2xl p-5 space-y-3 transition-colors hover:border-brand">
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-oxygen shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h2 className="text-lg text-ink truncate">{hospital.name}</h2>
          <p className="text-sm text-slate line-clamp-1">{hospital.address}</p>
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

export function HospitalsDirectoryView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const districtFilter = searchParams.get('district') ?? 'ALL'

  const hospitalsQuery = useHospitals()
  const liveItems = hospitalsQuery.data?.items ?? []
  // If backend returns hospitals, use them; otherwise provide the demo network
  const sourceHospitals = liveItems.length > 0 ? liveItems : DEMO_HOSPITALS

  // Distinct districts
  const districts = useMemo(() => {
    const list = Array.from(
      new Set(
        DEMO_HOSPITALS.map((h) => h.district).filter(Boolean),
      ),
    ).sort()
    return ['ALL', ...list]
  }, [])

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

  return (
    <div className="space-y-10">
      <NearbyHospitals limit={5} showAllLink={false} />

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
              <HospitalCard key={h.id} hospital={h} />
            ))}
          </div>
        )}
      </section>

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
