import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your RapidAid account or choose 1-click Demo Login for Patient, Driver, or Admin access.',
  openGraph: {
    title: 'Sign In',
    description:
      'Fast, reliable emergency medical dispatch portal with role-based dashboards.',
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
