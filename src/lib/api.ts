import { env } from '@/env'
import type { ApiResponse } from '@/types/api'

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
  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    const apiError = data as { success: false; message: string; errors?: unknown }
    throw new ApiError(response.status, apiError.message, apiError.errors as any)
  }

  if (!data.success) {
    throw new ApiError(response.status, data.message)
  }

  return data.data
}

export const api = {
  async get<T>(path: string, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...opts,
      method: 'GET',
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async patch<T>(path: string, body?: unknown, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...opts,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },

  async delete<T>(path: string, opts?: RequestInit): Promise<T> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...opts,
      method: 'DELETE',
      credentials: 'include',
    })
    return handleResponse<T>(response)
  },
}
