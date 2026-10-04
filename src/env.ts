import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:5000/api/v1'),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
})

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => `${issue.path.join('.')}`).join(', ')
  throw new Error(`Invalid environment variables: ${missing}`)
}

export const env = parsed.data
