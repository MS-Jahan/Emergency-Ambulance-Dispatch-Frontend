import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies } from '@/lib/auth-cookies'
import { clientHeaders } from '@/lib/backend'

type Tokens = { accessToken: string; refreshToken: string }

type RouteContext = { params: Promise<{ path: string[] }> }

function forward(
  req: NextRequest,
  relPath: string,
  method: string,
  token: string | undefined,
  body: string | undefined,
): Promise<Response> {
  return fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/${relPath}`, {
    method,
    headers: {
      ...clientHeaders(req),
      ...(body !== undefined && {
        'Content-Type': req.headers.get('content-type') ?? 'application/json',
      }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body,
  })
}

// The backend rotates refresh tokens: a used token is revoked at once. When a
// page fires several requests together after the access token expires, each
// would try to rotate the same token and all but one would fail and bounce the
// user to the login page. Share one rotation per refresh token on this server
// and remember the result briefly for requests that arrive a moment later.
const inflight = new Map<string, Promise<Tokens | null>>()
const SHARE_MS = 15_000

function rotateRefreshToken(req: NextRequest): Promise<Tokens | null> {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return Promise.resolve(null)

  const existing = inflight.get(refreshToken)
  if (existing) return existing

  const attempt = callRefresh(req, refreshToken)
  inflight.set(refreshToken, attempt)
  void attempt.then((tokens) => {
    // Failures are not worth sharing; successes are, for a few seconds.
    setTimeout(() => inflight.delete(refreshToken), tokens ? SHARE_MS : 0)
  })
  return attempt
}

async function callRefresh(req: NextRequest, refreshToken: string): Promise<Tokens | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { ...clientHeaders(req), 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return null

  const payload = await res.json()
  return payload.data as Tokens
}

async function handle(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { path } = await ctx.params
  const relPath = path.join('/') + req.nextUrl.search
  const method = req.method
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value
  let upstream = await forward(req, relPath, method, accessToken, body)

  let rotated: Tokens | null = null
  if (upstream.status === 401) {
    rotated = await rotateRefreshToken(req)
    if (rotated) {
      upstream = await forward(req, relPath, method, rotated.accessToken, body)
    }
  }

  const resBody = await upstream.text()
  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  const res = new NextResponse(resBody, { status: upstream.status, headers })
  if (rotated) setAuthCookies(res, rotated)
  return res
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx)
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx)
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx)
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx)
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx)
}
