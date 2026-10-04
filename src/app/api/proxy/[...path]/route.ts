import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies } from '@/lib/auth-cookies'

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
      ...(body !== undefined && {
        'Content-Type': req.headers.get('content-type') ?? 'application/json',
      }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body,
  })
}

async function rotateRefreshToken(req: NextRequest): Promise<Tokens | null> {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
