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
  // 15m matches backend JWT_ACCESS_EXPIRES_IN; 7d matches JWT_REFRESH_EXPIRES_IN
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: 60 * 15 })
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 })
  res.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 })
}
