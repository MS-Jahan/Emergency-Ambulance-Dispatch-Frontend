'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BedDouble, Building2, LocateFixed, MapPin, Phone, Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEMO_HOSPITALS } from '@/data/demo-hospitals'
import { DHAKA, nearest, type Coords } from '@/lib/geo'

type Origin = { coords: Coords; label: string; source: 'ip' | 'device' | 'default' }

// Rough Bangladesh bounding box; an IP outside it (VPN, foreign proxy) would
// rank hospitals by distance from abroad, so treat it as "unknown".
const inBangladesh = ({ lat, lng }: Coords) =>
  lat > 20.5 && lat < 26.7 && lng > 88 && lng < 92.8

export function NearbyHospitals({ limit = 5, showAllLink = true }: { limit?: number; showAllLink?: boolean }) {
  const [origin, setOrigin] = useState<Origin>({ coords: DHAKA, label: 'Dhaka', source: 'default' })
  const [locating, setLocating] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/geo')
      .then((r) => r.json())
      .then((g: { lat: number; lng: number; city?: string; source: string }) => {
        if (cancelled || !g || !inBangladesh(g)) return
        setOrigin((prev) =>
          prev.source === 'device'
            ? prev
            : { coords: { lat: g.lat, lng: g.lng }, label: g.city || 'your area', source: 'ip' },
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const ranked = useMemo(() => nearest(DEMO_HOSPITALS, origin.coords, limit), [origin, limit])

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setDenied(true)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDenied(false)
        setLocating(false)
        setOrigin({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          label: 'your location',
          source: 'device',
        })
      },
      () => {
        setLocating(false)
        setDenied(true)
      },
      { timeout: 8000, maximumAge: 300000 },
    )
  }

  const basis =
    origin.source === 'device'
      ? 'Sorted by your device location'
      : origin.source === 'ip'
        ? `Sorted by approximate location (${origin.label}, from your IP)`
        : 'Sorted from Dhaka (default). Share your location for exact results'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate">
          <span className="rounded-full border border-amber/50 bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-ink">
            Demo data
          </span>
          <span>{basis}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={useMyLocation}
          disabled={locating}
          className="h-10 gap-2 px-4"
        >
          <LocateFixed className="h-4 w-4" />
          {locating ? 'Locating…' : origin.source === 'device' ? 'Refresh location' : 'Use my location'}
        </Button>
      </div>
      {denied && (
        <p role="status" className="text-sm text-signal">
          Location permission was denied or is unavailable. Showing the approximate results instead.
        </p>
      )}

      <ol className="grid gap-3 lg:grid-cols-5 sm:grid-cols-2">
        {ranked.map(({ item: h, km }, i) => (
          <li
            key={h.id}
            className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-paper p-4 transition-colors hover:border-brand"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold tabular-nums text-brand">
                {i + 1}
              </span>
              <span className="text-xs font-semibold tabular-nums text-ink">
                {km < 10 ? km.toFixed(1) : Math.round(km)} km
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base leading-snug text-ink">{h.name}</h3>
              <p className="flex items-center gap-1 text-xs text-slate">
                <MapPin className="h-3 w-3 shrink-0" /> {h.district}
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate">
              <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{h.beds}</span>
              {h.icu && <span className="flex items-center gap-1 rounded-full bg-oxygen/15 px-2 py-0.5 font-semibold text-ink"><Siren className="h-3 w-3" />ICU</span>}
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{h.phone.slice(-8)}</span>
            </div>
          </li>
        ))}
      </ol>

      {showAllLink && (
        <Link href="/hospitals" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          <Building2 className="h-4 w-4" /> See all hospitals <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
