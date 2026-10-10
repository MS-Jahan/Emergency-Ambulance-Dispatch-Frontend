import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Request an email link to choose a new RapidAid password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
