import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:5000/api/v1'),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
})

/**
 * The backend mounts every route under /api/v1. A deploy that sets the env var
 * to the bare host (https://api.example.com) would hit "Route not found:
 * POST /auth/login", so make sure the prefix is always present.
 */
export function normalizeApiBase(raw: string | undefined): string | undefined {
  const value = raw?.trim()
  if (!value) return undefined
  const trimmed = value.replace(/\/+$/, '')
  return /\/api\/v\d+$/.test(trimmed) ? trimmed : `${trimmed}/api/v1`
}

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL),
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
})

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => `${issue.path.join('.')}`).join(', ')
  throw new Error(`Invalid environment variables: ${missing}`)
}

export const env = parsed.data
