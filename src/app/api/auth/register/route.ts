import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'
import { setAuthCookies } from '@/lib/auth-cookies'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const upstream = await backendFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status })
  }

  const res = NextResponse.json({
    success: true,
    message: payload.message ?? 'Account created',
    data: { user: payload.data.user },
  })
  setAuthCookies(res, payload.data)
  return res
}
