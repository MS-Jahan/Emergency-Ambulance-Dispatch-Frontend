import type { Role } from '@/types/api'

/**
 * Public demo accounts seeded in the backend (`bun run db:seed`). They hold no
 * real data, so they are shown on the sign-in page for evaluators. The one-click
 * buttons use `/api/auth/demo`, which can override these through DEMO_* env vars.
 */
export interface DemoAccount {
  role: Role
  label: string
  email: string
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'ADMIN', label: 'Admin', email: 'admin@dispatch.demo', password: 'Admin123!' },
  { role: 'PATIENT', label: 'Patient', email: 'patient@dispatch.demo', password: 'Demo123!' },
  { role: 'DRIVER', label: 'Driver', email: 'driver@dispatch.demo', password: 'Demo123!' },
]

export function demoAccount(role: Role): DemoAccount {
  return DEMO_ACCOUNTS.find((a) => a.role === role) as DemoAccount
}
