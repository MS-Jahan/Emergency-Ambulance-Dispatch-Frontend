import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from '@/lib/auth-cookies'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'No refresh token' },
      { status: 401 },
    )
  }

  const upstream = await backendFetch('/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }, req)
  const payload = await upstream.json()

  if (!upstream.ok) {
    const res = NextResponse.json(payload, { status: upstream.status })
    clearAuthCookies(res)
    return res
  }

  const res = NextResponse.json({
    success: true,
    message: payload.message ?? 'Token refreshed',
    data: { user: payload.data.user },
  })
  setAuthCookies(res, payload.data)
  return res
}
