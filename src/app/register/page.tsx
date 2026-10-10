import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create an Account',
  description:
    'Register for RapidAid emergency dispatch to request ambulances, track real-time dispatches, and settle fees securely.',
  openGraph: {
    title: 'Create an Account',
    description:
      'Join RapidAid for 24/7 nationwide emergency ambulance response and medical transit.',
  },
}

export default function RegisterPage() {
  return <RegisterForm />
}
