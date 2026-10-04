import { env } from '@/env'

/**
 * Server-side fetch to the Express backend. Route handlers use this so the
 * browser never talks to the backend directly and never sees tokens.
 */
export function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, init)
}
