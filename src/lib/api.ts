import type { ApiResponse } from '@/types/api'

// Client calls stay same-origin: /api/proxy forwards to the backend with the
// Bearer token from the HTTP-only cookie, /api/auth/* handles login/register/
// refresh/logout and sets those cookies. Tokens never reach the browser.
const PROXY_BASE = '/api/proxy'
const AUTH_BASE = '/api/auth'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message)
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 && typeof window !== 'undefined') {
    const pathname = window.location.pathname
    // Only signed-in areas bounce to the login page. Public pages also call
    // /users/me in the background and a visitor without a session must stay put.
    const protectedArea = ['/dashboard', '/driver', '/admin'].some((p) => pathname.startsWith(p))
    if (protectedArea) {
      const next = pathname + window.location.search
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${encodeURIComponent(next)}`)
    }
  }

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    const apiError = data as { success: false; message: string; errors?: unknown }
    throw new ApiError(
      response.status,
      apiError.message,
      apiError.errors as Array<{ field?: string; message: string }> | undefined,
    )
  }

  if (!data.success) {
    throw new ApiError(response.status, data.message)
  }

  return data.data
}

export const api = {
  async get<T>(path: string, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      ...opts,
      method: 'GET',
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async patch<T>(path: string, body?: unknown, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      ...opts,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async delete<T>(path: string, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      ...opts,
      method: 'DELETE',
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  /** Posts to a Next auth route handler (/api/auth/*) which sets session cookies. */
  async authPost<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${AUTH_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },
}
