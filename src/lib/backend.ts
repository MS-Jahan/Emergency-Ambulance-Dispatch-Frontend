import { env } from '@/env'

/**
 * Identifies the visitor to the backend for rate limiting. Every browser request
 * reaches the backend through this server, so the backend would otherwise see one
 * shared address. The visitor address is sent with a secret that only this server
 * and the backend know; the backend ignores the address without a matching secret.
 * Without PROXY_SHARED_SECRET nothing is sent and the backend limits by connection.
 */
export function clientHeaders(req: Request): Record<string, string> {
  const secret = process.env.PROXY_SHARED_SECRET
  if (!secret) return {}
  const ip = (
    req.headers.get('x-vercel-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0] ??
    ''
  ).trim()
  if (!ip) return {}
  return { 'x-client-ip': ip, 'x-proxy-secret': secret }
}

/**
 * Server-side fetch to the Express backend. Route handlers use this so the
 * browser never talks to the backend directly and never sees tokens.
 * Pass the incoming request so the visitor address is forwarded.
 */
export function backendFetch(
  path: string,
  init?: RequestInit,
  req?: Request,
): Promise<Response> {
  const headers = { ...(req ? clientHeaders(req) : {}), ...(init?.headers as Record<string, string>) }
  return fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, { ...init, headers })
}
