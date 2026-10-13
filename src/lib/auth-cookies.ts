import type { NextResponse } from 'next/server'

export const ACCESS_COOKIE = 'accessToken'
export const REFRESH_COOKIE = 'refreshToken'

const base = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  // The access JWT itself lives 15m (backend JWT_ACCESS_EXPIRES_IN) and the
  // backend enforces that. The cookie outlives it, like the refresh cookie (7d),
  // so proxy.ts can still read the role on page navigations; an expired token
  // is renewed by /api/proxy on the first 401.
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: 60 * 60 * 24 * 7 })
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 })
  res.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 })
}
