import { NextRequest, NextResponse } from 'next/server'

const FALLBACK = { lat: 23.8103, lng: 90.4125, city: 'Dhaka', source: 'default' as const }

/** Approximate location from the caller's IP. Never fails: falls back to Dhaka. */
export async function GET(req: NextRequest) {
  const vLat = req.headers.get('x-vercel-ip-latitude')
  const vLng = req.headers.get('x-vercel-ip-longitude')
  if (vLat && vLng) {
    return NextResponse.json({
      lat: Number(vLat),
      lng: Number(vLng),
      city: decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? ''),
      source: 'ip',
    })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const isPrivate = !ip || /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)
  try {
    const res = await fetch(`https://ipwho.is/${isPrivate ? '' : ip}`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    })
    const data = (await res.json()) as {
      success?: boolean
      latitude?: number
      longitude?: number
      city?: string
      country_code?: string
    }
    if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return NextResponse.json({
        lat: data.latitude,
        lng: data.longitude,
        city: data.city ?? '',
        source: 'ip',
      })
    }
  } catch {
    // fall through to default
  }
  return NextResponse.json(FALLBACK)
}
