import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'
import { setAuthCookies } from '@/lib/auth-cookies'
import { demoAccount } from '@/lib/demo-accounts'

// Backend has no /auth/demo endpoint; the Next route maps role -> seeded demo
// credentials and calls /auth/login. Env overrides let deploys re-point at a
// reseeded backend without code changes.
const DEMO_CREDENTIALS: Record<string, { email: string; password: string }> = {
  PATIENT: {
    email: process.env.DEMO_PATIENT_EMAIL ?? demoAccount('PATIENT').email,
    password: process.env.DEMO_PATIENT_PASSWORD ?? demoAccount('PATIENT').password,
  },
  DRIVER: {
    email: process.env.DEMO_DRIVER_EMAIL ?? demoAccount('DRIVER').email,
    password: process.env.DEMO_DRIVER_PASSWORD ?? demoAccount('DRIVER').password,
  },
  ADMIN: {
    email: process.env.DEMO_ADMIN_EMAIL ?? demoAccount('ADMIN').email,
    password: process.env.DEMO_ADMIN_PASSWORD ?? demoAccount('ADMIN').password,
  },
}

export async function POST(req: NextRequest) {
  const { role } = (await req.json()) as { role?: string }
  const credentials = role ? DEMO_CREDENTIALS[role] : undefined

  if (!credentials) {
    return NextResponse.json(
      { success: false, message: 'Invalid demo role' },
      { status: 400 },
    )
  }

  const upstream = await backendFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }, req)
  const payload = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status })
  }

  const res = NextResponse.json({
    success: true,
    message: payload.message ?? 'Logged in',
    data: { user: payload.data.user },
  })
  setAuthCookies(res, payload.data)
  return res
}
