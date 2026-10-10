import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'
import { REFRESH_COOKIE, clearAuthCookies } from '@/lib/auth-cookies'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value

  // Best effort: the server-side revocation matters less than clearing the
  // session cookies, which must happen even if the backend call fails.
  if (refreshToken) {
    await backendFetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null)
  }

  const res = NextResponse.json({
    success: true,
    message: 'Logged out',
    data: null,
  }, req)
  clearAuthCookies(res)
  return res
}
